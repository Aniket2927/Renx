import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Security Tests', () => {
  let validToken: string;
  let expiredToken: string;
  let malformedToken: string;
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    // Create test tenant and user
    const tenantResponse = await request(app)
      .post('/api/admin/tenants')
      .send({
        name: 'Security Test Corp',
        domain: 'security-test.com',
        plan: 'enterprise'
      });
    tenantId = tenantResponse.body.tenant.id;

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'security@test.com',
        password: 'SecurePassword123!',
        tenantId
      });
    userId = userResponse.body.user.id;

    // Create tokens for testing
    validToken = jwt.sign(
      { userId, tenantId, email: 'security@test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    expiredToken = jwt.sign(
      { userId, tenantId, email: 'security@test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' } // Already expired
    );

    malformedToken = 'invalid.jwt.token';
  });

  afterAll(async () => {
    // Cleanup
    await global.testServices?.dbManager?.query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await global.testServices?.dbManager?.query('DELETE FROM tenants WHERE id = $1', [tenantId]);
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/user');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with malformed JWT tokens', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${malformedToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with expired JWT tokens', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid JWT signature', async () => {
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

    it('should properly hash passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
      expect(await bcrypt.compare('wrongpassword', hashedPassword)).toBe(false);
    });

    it('should enforce strong password requirements', async () => {
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

    it('should prevent brute force attacks with rate limiting', async () => {
      const promises: Promise<any>[] = [];
      
      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'security@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Should start rate limiting after several attempts
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Security', () => {
    it('should enforce role-based access control', async () => {
      // User without admin role should not access admin endpoints
      const response = await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should prevent privilege escalation', async () => {
      // User should not be able to assign themselves admin role
      const response = await request(app)
        .put('/api/users/me/roles')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          roles: ['admin', 'super_admin']
        });

      expect(response.status).toBe(403);
    });

    it('should enforce tenant isolation', async () => {
      // Create another tenant
      const tenant2Response = await request(app)
        .post('/api/admin/tenants')
        .send({
          name: 'Security Test Corp 2',
          domain: 'security-test-2.com',
          plan: 'professional'
        });
      const tenant2Id = tenant2Response.body.tenant.id;

      // Create token for different tenant
      const otherTenantToken = jwt.sign(
        { userId, tenantId: tenant2Id, email: 'security@test.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Try to access original tenant's resources
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${otherTenantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.portfolios).toHaveLength(0); // Should be empty for different tenant
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection attacks', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; DELETE FROM portfolios WHERE '1'='1'; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/portfolios')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            name: payload,
            description: 'Test portfolio'
          });

        // Should either reject the request or sanitize the input
        if (response.status === 201) {
          // If accepted, the payload should be sanitized
          expect(response.body.portfolio.name).not.toContain('DROP TABLE');
          expect(response.body.portfolio.name).not.toContain('DELETE FROM');
        } else {
          // Should be rejected with validation error
          expect(response.status).toBe(400);
        }
      }
    });

    it('should prevent XSS attacks', async () => {
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
          // XSS payload should be sanitized
          expect(response.body.portfolio.name).not.toContain('<script>');
          expect(response.body.portfolio.name).not.toContain('javascript:');
          expect(response.body.portfolio.name).not.toContain('onerror');
        }
      }
    });

    it('should validate and sanitize file uploads', async () => {
      // Test malicious file upload attempts
      const response = await request(app)
        .post('/api/upload/portfolio-data')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', Buffer.from('<?php system($_GET["cmd"]); ?>'), {
          filename: 'malicious.php',
          contentType: 'application/php'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/file type|format/i);
    });

    it('should prevent NoSQL injection', async () => {
      const noSqlPayloads = [
        { $ne: null },
        { $gt: '' },
        { $regex: '.*' },
        { $where: 'function() { return true; }' }
      ];

      for (const payload of noSqlPayloads) {
        const response = await request(app)
          .get('/api/portfolios')
          .set('Authorization', `Bearer ${validToken}`)
          .query({ filter: JSON.stringify(payload) });

        // Should reject or sanitize NoSQL injection attempts
        expect(response.status).not.toBe(500);
      }
    });
  });

  describe('Data Protection', () => {
    it('should not expose sensitive data in API responses', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('jwtSecret');
    });

    it('should encrypt sensitive data at rest', async () => {
      // Create portfolio with sensitive data
      const portfolioResponse = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Sensitive Portfolio',
          description: 'Contains sensitive financial data',
          bankAccount: '1234567890',
          ssn: '123-45-6789'
        });

      expect(portfolioResponse.status).toBe(201);

      // Direct database query should show encrypted data
      const dbResult = await global.testServices?.dbManager?.query(
        'SELECT * FROM portfolios WHERE id = $1',
        [portfolioResponse.body.portfolio.id]
      );

      if (dbResult && dbResult.rows[0]) {
        // Sensitive fields should be encrypted or hashed
        expect(dbResult.rows[0].bank_account).not.toBe('1234567890');
        expect(dbResult.rows[0].ssn).not.toBe('123-45-6789');
      }
    });

    it('should implement proper session management', async () => {
      // Login to create session
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'security@test.com',
          password: 'SecurePassword123!'
        });

      expect(loginResponse.status).toBe(200);
      const sessionToken = loginResponse.body.token;

      // Session should be valid
      const validSessionResponse = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(validSessionResponse.status).toBe(200);

      // Logout should invalidate session
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(logoutResponse.status).toBe(200);

      // Session should be invalid after logout
      const invalidSessionResponse = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(invalidSessionResponse.status).toBe(401);
    });
  });

  describe('API Security', () => {
    it('should implement proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/auth/user')
        .set('Origin', 'https://malicious-site.com');

      // Should have restrictive CORS policy
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
    });

    it('should implement security headers', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${validToken}`);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should prevent parameter pollution', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${validToken}`)
        .query('limit=10&limit=1000&limit=evil');

      expect(response.status).toBe(200);
      // Should use the first or last valid parameter, not be confused by multiple values
    });

    it('should implement request size limits', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB payload

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Large Portfolio',
          description: largePayload
        });

      expect(response.status).toBe(413); // Payload too large
    });
  });

  describe('Cryptographic Security', () => {
    it('should use secure random number generation', async () => {
      // Test multiple API keys/tokens generation
      const tokens = new Set();
      
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .post('/api/auth/generate-api-key')
          .set('Authorization', `Bearer ${validToken}`);

        if (response.status === 200) {
          const token = response.body.apiKey;
          expect(tokens.has(token)).toBe(false); // Should be unique
          tokens.add(token);
          expect(token.length).toBeGreaterThan(20); // Should be sufficiently long
        }
      }
    });

    it('should properly validate JWT tokens', async () => {
      // Test token manipulation
      const tokenParts = validToken.split('.');
      const manipulatedToken = tokenParts[0] + '.' + tokenParts[1] + '.manipulated_signature';

      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${manipulatedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Audit and Logging Security', () => {
    it('should log security events', async () => {
      // Attempt unauthorized access
      await request(app)
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${validToken}`);

      // Check if security event was logged
      const auditResponse = await request(app)
        .get('/api/audit/security-logs')
        .set('Authorization', `Bearer ${validToken}`);

      if (auditResponse.status === 200) {
        expect(auditResponse.body.logs).toContainEqual(
          expect.objectContaining({
            event_type: 'unauthorized_access_attempt',
            user_id: userId,
            tenant_id: tenantId
          })
        );
      }
    });

    it('should not log sensitive information', async () => {
      // Make request with sensitive data
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword123!'
        });

      const auditResponse = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${validToken}`);

      if (auditResponse.status === 200) {
        const logs = JSON.stringify(auditResponse.body.logs);
        expect(logs).not.toContain('SecurePassword123!');
        expect(logs).not.toContain('NewSecurePassword123!');
      }
    });
  });

  describe('Vulnerability Assessment', () => {
    it('should not be vulnerable to timing attacks', async () => {
      const validEmail = 'security@test.com';
      const invalidEmail = 'nonexistent@test.com';
      const password = 'wrongpassword';

      // Measure response times
      const validEmailTimes: number[] = [];
      const invalidEmailTimes: number[] = [];

      for (let i = 0; i < 10; i++) {
        // Valid email, wrong password
        const start1 = Date.now();
        await request(app)
          .post('/api/auth/login')
          .send({ email: validEmail, password });
        validEmailTimes.push(Date.now() - start1);

        // Invalid email
        const start2 = Date.now();
        await request(app)
          .post('/api/auth/login')
          .send({ email: invalidEmail, password });
        invalidEmailTimes.push(Date.now() - start2);
      }

      const avgValidTime = validEmailTimes.reduce((a, b) => a + b) / validEmailTimes.length;
      const avgInvalidTime = invalidEmailTimes.reduce((a, b) => a + b) / invalidEmailTimes.length;

      // Response times should be similar to prevent timing attacks
      const timeDifference = Math.abs(avgValidTime - avgInvalidTime);
      expect(timeDifference).toBeLessThan(100); // Less than 100ms difference
    });

    it('should prevent directory traversal attacks', async () => {
      const traversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '....//....//....//etc/passwd'
      ];

      for (const payload of traversalPayloads) {
        const response = await request(app)
          .get(`/api/files/${payload}`)
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).not.toBe(200);
        expect(response.status).toBe(400); // Should reject malicious paths
      }
    });

    it('should prevent command injection', async () => {
      const commandInjectionPayloads = [
        '; ls -la',
        '| cat /etc/passwd',
        '&& rm -rf /',
        '`whoami`',
        '$(id)'
      ];

      for (const payload of commandInjectionPayloads) {
        const response = await request(app)
          .post('/api/system/execute')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            command: `backup_portfolio ${payload}`
          });

        // Should reject or sanitize command injection attempts
        expect(response.status).not.toBe(200);
      }
    });
  });

  describe('Third-party Security', () => {
    it('should validate API responses from external services', async () => {
      // Mock malicious external API response
      const mockMaliciousResponse = {
        data: '<script>alert("XSS")</script>',
        price: 'Infinity',
        volume: -1,
        __proto__: { polluted: true }
      };

      // This would require mocking external API calls
      // Test that the application properly validates and sanitizes external data
      const response = await request(app)
        .get('/api/market-data/AAPL')
        .set('Authorization', `Bearer ${validToken}`);

      if (response.status === 200) {
        expect(response.body.data).not.toContain('<script>');
        expect(typeof response.body.price).toBe('number');
        expect(response.body.volume).toBeGreaterThanOrEqual(0);
      }
    });

    it('should implement proper certificate validation for HTTPS requests', async () => {
      // This would test that the application properly validates SSL certificates
      // when making external API calls
      const response = await request(app)
        .post('/api/external/validate-ssl')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          url: 'https://self-signed.badssl.com/'
        });

      expect(response.status).toBe(400); // Should reject invalid certificates
    });
  });
}); 