import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { app } from '../index';

describe('Security Tests', () => {
  let validToken: string;
  let userId: string;
  let tenantId: string;

  beforeAll(async () => {
    // Create test tenant
    const tenantResponse = await request(app)
      .post('/api/admin/tenants')
      .send({
        name: 'Security Test Corp',
        domain: 'security-test.com',
        plan: 'professional'
      });
    tenantId = tenantResponse.body.tenant.id;

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'security@test.com',
        password: 'SecurePassword123!',
        tenantId
      });
    
    userId = userResponse.body.user.id;
    validToken = userResponse.body.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await request(app)
      .delete(`/api/admin/tenants/${tenantId}`);
  });

  describe('Authentication Security', () => {
    test('should reject requests without valid token', async () => {
      const response = await request(app)
        .get('/api/auth/user');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject requests with invalid token', async () => {
      const invalidToken = jwt.sign(
        { userId, tenantId, email: 'security@test.com' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should properly hash passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
      expect(await bcrypt.compare('wrongpassword', hashedPassword)).toBe(false);
    });

    test('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'password',
        '123456',
        'abc123',
        'Password',
        'password123',
        'PASSWORD123'
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `weak${Date.now()}@test.com`,
            password: weakPassword,
            tenantId
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/password/i);
      }
    });
  });

  describe('Authorization Security', () => {
    test('should enforce role-based access control', async () => {
      const response = await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    test('should enforce tenant isolation', async () => {
      const tenant2Response = await request(app)
        .post('/api/admin/tenants')
        .send({
          name: 'Security Test Corp 2',
          domain: 'security-test-2.com',
          plan: 'professional'
        });
      const tenant2Id = tenant2Response.body.tenant.id;

      const otherTenantToken = jwt.sign(
        { userId, tenantId: tenant2Id, email: 'security@test.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${otherTenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.portfolios).toHaveLength(0);
    });
  });

  describe('Input Validation Security', () => {
    test('should prevent XSS attacks', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("XSS")'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/portfolios')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            name: `Portfolio ${payload}`,
            description: 'Test portfolio'
          });

        if (response.status === 201) {
          expect(response.body.portfolio.name).not.toContain('<script>');
          expect(response.body.portfolio.name).not.toContain('<img');
          expect(response.body.portfolio.name).not.toContain('javascript:');
        }
      }
    });
  });
}); 