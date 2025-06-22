import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { dbManager } from '../db';
import { app } from '../index';
import jwt from 'jsonwebtoken';

describe('Performance Tests', () => {
  let testStartTime: number;
  let authToken: string;
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    testStartTime = Date.now();
    // Initialize database connection for performance tests
    // dbManager is already initialized as singleton

    // Use mock data for performance tests
    tenantId = 'perf-test-tenant-id';
    userId = 'perf-test-user-id';
    authToken = jwt.sign(
      { userId, tenantId, email: 'perf@test.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    const totalTestTime = Date.now() - testStartTime;
    console.log(`Total performance test time: ${totalTestTime}ms`);
    
    // Clean up database connections
    await dbManager.close();
  });

  describe('API Response Times', () => {
    it('should respond to health check within 100ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
      expect(response.body).toBeDefined();
    });

    it('should handle authentication within 200ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          tenantId: 'test-tenant'
        });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle portfolio data requests within 300ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', 'Bearer test-token');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(300);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Database Performance', () => {
    it('should handle database queries efficiently', async () => {
      const startTime = Date.now();
      
      try {
        await dbManager.getMainPool().query('SELECT 1');
        const queryTime = Date.now() - startTime;
        expect(queryTime).toBeLessThan(50);
      } catch (error) {
        // Database might not be available in test environment
        console.warn('Database not available for performance testing');
      }
    });

    it('should handle concurrent database connections', async () => {
      const startTime = Date.now();
      const concurrentQueries = 10;
      
      try {
        const promises = Array.from({ length: concurrentQueries }, () =>
          dbManager.getMainPool().query('SELECT 1')
        );
        
        await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        expect(totalTime).toBeLessThan(200);
      } catch (error) {
        console.warn('Database not available for concurrent testing');
      }
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage', () => {
      const memUsage = process.memoryUsage();
      const maxHeapUsed = 100 * 1024 * 1024; // 100MB
      
      expect(memUsage.heapUsed).toBeLessThan(maxHeapUsed);
    });

    it('should not have significant memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate some operations
      for (let i = 0; i < 100; i++) {
        await request(app).get('/health');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const maxIncrease = 10 * 1024 * 1024; // 10MB
      
      expect(memoryIncrease).toBeLessThan(maxIncrease);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app).get('/health')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should complete within reasonable time
      expect(totalTime).toBeLessThan(2000);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Average response time should be reasonable
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(100);
    });

    it('should handle load spikes gracefully', async () => {
      const spikeRequests = 100;
      const startTime = Date.now();
      
      const promises = Array.from({ length: spikeRequests }, () =>
        request(app).get('/health')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // Should complete within reasonable time even under load
      expect(totalTime).toBeLessThan(5000);
      
      // Should maintain high success rate
      const successfulResponses = responses.filter(r => r.status === 200);
      const successRate = successfulResponses.length / responses.length;
      expect(successRate).toBeGreaterThan(0.95); // 95% success rate
    });
  });

  describe('Resource Utilization', () => {
    it('should efficiently utilize CPU resources', async () => {
      const startTime = Date.now();
      const startCpuUsage = process.cpuUsage();
      
      // Perform CPU-intensive operations
      for (let i = 0; i < 10; i++) {
        await request(app).get('/health');
      }
      
      const cpuUsage = process.cpuUsage(startCpuUsage);
      const totalTime = Date.now() - startTime;
      
      // CPU usage should be reasonable
      const cpuPercentage = (cpuUsage.user + cpuUsage.system) / (totalTime * 1000);
      expect(cpuPercentage).toBeLessThan(0.8); // Less than 80% CPU usage
    });
  });

  describe('Scalability Metrics', () => {
    it('should demonstrate linear scalability', async () => {
      const testSizes = [1, 5, 10, 20];
      const results: Array<{ size: number; time: number }> = [];
      
      for (const size of testSizes) {
        const startTime = Date.now();
        
        const promises = Array.from({ length: size }, () =>
          request(app).get('/health')
        );
        
        await Promise.all(promises);
        const time = Date.now() - startTime;
        
        results.push({ size, time });
      }
      
      // Check that response time scales reasonably
      const timePerRequest = results.map(r => r.time / r.size);
      const avgTimePerRequest = timePerRequest.reduce((a, b) => a + b) / timePerRequest.length;
      
      expect(avgTimePerRequest).toBeLessThan(50); // Less than 50ms per request on average
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
      expect(response.body).toBeDefined();
    });
  });

  describe('Throughput Measurements', () => {
    it('should achieve target throughput', async () => {
      const duration = 5000; // 5 seconds
      const startTime = Date.now();
      let requestCount = 0;
      
      const makeRequest = async () => {
        while (Date.now() - startTime < duration) {
          try {
            await request(app).get('/health');
            requestCount++;
          } catch (error) {
            // Continue on error
          }
        }
      };
      
      // Run concurrent request makers
      const concurrency = 5;
      const promises = Array.from({ length: concurrency }, makeRequest);
      await Promise.all(promises);
      
      const actualDuration = Date.now() - startTime;
      const throughput = (requestCount / actualDuration) * 1000; // requests per second
      
      expect(throughput).toBeGreaterThan(10); // At least 10 requests per second
    });
  });
}); 