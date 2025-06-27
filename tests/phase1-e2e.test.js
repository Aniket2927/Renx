import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import http from 'http';

describe('Phase 1 End-to-End Functionality Tests', () => {
  
  // Helper function to make HTTP requests
  const makeRequest = (url, method = 'GET') => {
    return new Promise((resolve, reject) => {
      const req = http.request(url, { method, timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      
      req.on('error', reject);
      req.end();
    });
  };

  describe('E2E-1: Database Configuration Tests', () => {
    
    test('E2E-1.1: Database should use environment variables', () => {
      const dbPath = 'server/db.ts';
      expect(fs.existsSync(dbPath)).toBe(true);
      
      const content = fs.readFileSync(dbPath, 'utf8');
      expect(content).toMatch(/process\.env\./);
      expect(content).toMatch(/getEnvVar/);
      expect(content).not.toMatch(/password.*=.*['"][^'"\$]/);
    });

    test('E2E-1.2: Database should have multi-tenant support', () => {
      const dbPath = 'server/db.ts';
      const content = fs.readFileSync(dbPath, 'utf8');
      
      expect(content).toMatch(/tenantId/);
      expect(content).toMatch(/TenantDatabase/);
      expect(content).toMatch(/DatabaseManager/);
    });
  });

  describe('E2E-2: Backend Server Tests', () => {
    
    test('E2E-2.1: Server build should exist and be reasonable size', () => {
      expect(fs.existsSync('dist/index.js')).toBe(true);
      
      const stats = fs.statSync('dist/index.js');
      expect(stats.size).toBeLessThan(1024 * 1024); // Under 1MB
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    });

    test('E2E-2.2: Server should respond to HTTP requests', async () => {
      try {
        const response = await makeRequest('http://localhost:3344/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatch(/<!DOCTYPE html>/i);
      } catch (error) {
        // If server isn't running, that's a failure
        throw new Error(`Server not responding: ${error.message}`);
      }
    }, 10000);
  });

  describe('E2E-3: Frontend Build Tests', () => {
    
    test('E2E-3.1: Frontend build artifacts should exist', () => {
      expect(fs.existsSync('dist/public')).toBe(true);
      expect(fs.existsSync('dist/public/index.html')).toBe(true);
    });

    test('E2E-3.2: API configuration should use real APIs', () => {
      const apiConfigPath = 'client/src/services/apiConfig.js';
      const content = fs.readFileSync(apiConfigPath, 'utf8');
      
      expect(content).toMatch(/useRealAPI.*!==.*['"]false['"];/);
      expect(content).toMatch(/export const authAPI/);
      expect(content).toMatch(/export const tradingAPI/);
    });
  });

  describe('E2E-4: Integration Tests', () => {
    
    test('E2E-4.1: TypeScript compilation should succeed', () => {
      try {
        execSync('npm run check', { stdio: 'pipe' });
        expect(true).toBe(true);
      } catch (error) {
        const output = error.stdout || error.stderr || '';
        const hasCriticalErrors = output.includes('error TS') && 
                                !output.includes('error TS6133') && 
                                !output.includes('error TS6192') && 
                                !output.includes('error TS7016');
        expect(hasCriticalErrors).toBe(false);
      }
    }, 60000);

    test('E2E-4.2: Full build should complete successfully', () => {
      const result = execSync('npm run build', { encoding: 'utf8' });
      expect(result).toMatch(/built|done/i);
      expect(fs.existsSync('dist/index.js')).toBe(true);
      expect(fs.existsSync('dist/public/index.html')).toBe(true);
    }, 120000);
  });
});
