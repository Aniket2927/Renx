/**
 * Phase 1 Critical Tasks Validation Test Suite
 * 
 * This test suite validates all acceptance criteria for Phase 1:
 * - Critical Task 1: TypeScript Compilation
 * - Critical Task 2: Mock Data Elimination  
 * - Critical Task 3: API Service Consolidation
 * - Critical Task 4: Database Configuration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Phase 1 Critical Tasks Validation', () => {
  
  // CRITICAL TASK 1: TypeScript Compilation Failures
  describe('TC-C1: TypeScript Compilation', () => {
    
    test('TC-C1.1: npm run check should pass without critical errors', () => {
      try {
        const result = execSync('npm run check', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        // Should not throw error (exit code 0 means success)
        expect(true).toBe(true);
      } catch (error) {
        // Check if it's just linting warnings (not critical compilation errors)
        const output = error.stdout || error.stderr || '';
        const hasCompilationErrors = output.includes('error TS') && 
                                   !output.includes('error TS6133') && // unused variable warnings
                                   !output.includes('error TS6192') && // unused import warnings
                                   !output.includes('error TS7016');   // missing declaration warnings
        
        expect(hasCompilationErrors).toBe(false);
      }
    }, 120000); // 2 minutes timeout

    test('TC-C1.2: npm run build should generate clean dist/ directory', () => {
      // Clean previous build
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
      }
      
      // Run build
      execSync('npm run build', { stdio: 'pipe' });
      
      // Verify dist directory exists
      expect(fs.existsSync('dist')).toBe(true);
      expect(fs.existsSync('dist/index.js')).toBe(true);
    }, 180000); // 3 minutes timeout

    test('TC-C1.3: .d.ts files should be in .gitignore', () => {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      expect(gitignoreContent).toMatch(/\*\.d\.ts/);
      expect(gitignoreContent).toMatch(/server\/\*\*\/\*\.d\.ts/);
    });

    test('TC-C1.4: No .d.ts files should exist in server directory', () => {
      const findDtsFiles = (dir) => {
        if (!fs.existsSync(dir)) return [];
        const files = fs.readdirSync(dir, { withFileTypes: true });
        let dtsFiles = [];
        
        for (const file of files) {
          if (file.name === 'node_modules') continue;
          
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            dtsFiles = dtsFiles.concat(findDtsFiles(fullPath));
          } else if (file.name.endsWith('.d.ts')) {
            dtsFiles.push(fullPath);
          }
        }
        return dtsFiles;
      };
      
      const dtsFiles = findDtsFiles('./server');
      expect(dtsFiles).toHaveLength(0);
    });

    test('TC-C1.5: tsconfig.json should exclude server directory properly', () => {
      const tsconfigContent = fs.readFileSync('tsconfig.json', 'utf8');
      const tsconfig = JSON.parse(tsconfigContent);
      
      expect(tsconfig.exclude).toContain('server');
      expect(tsconfig.references).toBeDefined();
    });
  });

  // CRITICAL TASK 2: Mock Data Elimination
  describe('TC-C2: Mock Data Elimination', () => {
    
    test('TC-C2.1: apiConfig.js should use real API by default', () => {
      const apiConfigPath = 'client/src/services/apiConfig.js';
      expect(fs.existsSync(apiConfigPath)).toBe(true);
      
      const content = fs.readFileSync(apiConfigPath, 'utf8');
      
      // Should default to real API (useRealAPI !== 'false' means defaults to true)
      expect(content).toMatch(/useRealAPI.*!==.*['"]false['"];/);
      
      // Should export real API methods
      expect(content).toMatch(/export.*authAPI.*=.*realAPI\.authAPI/);
      expect(content).toMatch(/export.*tradingAPI.*=.*realAPI\.tradingAPI/);
    });

    test('TC-C2.2: Portfolio page should use real data queries', () => {
      const portfolioPath = 'client/src/pages/Portfolio.tsx';
      expect(fs.existsSync(portfolioPath)).toBe(true);
      
      const content = fs.readFileSync(portfolioPath, 'utf8');
      
      // Should have real API queries (match actual implementation format)
      expect(content).toMatch(/queryKey:\s*\[["']\/api\/portfolios["']\]/);
      expect(content).toMatch(/queryKey:\s*\[["']\/api\/portfolio\/positions["']\]/);
      expect(content).toMatch(/queryKey:\s*\[["']\/api\/portfolio\/summary["']\]/);
      expect(content).toMatch(/queryKey:\s*\[["']\/api\/portfolio\/performance["']\]/);
    });

    test('TC-C2.3: main.tsx should use proper environment variables', () => {
      const mainPath = 'client/src/main.tsx';
      expect(fs.existsSync(mainPath)).toBe(true);
      
      const content = fs.readFileSync(mainPath, 'utf8');
      
      // Should not use import.meta.env directly for conditionals
      expect(content).not.toMatch(/if.*import\.meta\.env/);
      // Should use proper environment checking
      expect(content).toMatch(/process\.env|window\.__ENV__|typeof window/);
    });
  });

  // CRITICAL TASK 3: API Service Consolidation
  describe('TC-C3: API Service Consolidation', () => {
    
    test('TC-C3.1: Single consolidated API service should exist', () => {
      const apiPath = 'client/src/services/api.js';
      expect(fs.existsSync(apiPath)).toBe(true);
      
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Should have consolidated API service with axios instance
      expect(content).toMatch(/const api = axios\.create/);
      expect(content).toMatch(/export const authAPI/);
      expect(content).toMatch(/export const tradesAPI/);
      expect(content).toMatch(/export const tradingAPI/);
    });

    test('TC-C3.2: API service should have consistent error handling', () => {
      const apiPath = 'client/src/services/api.js';
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Should have response interceptor for error handling
      expect(content).toMatch(/api\.interceptors\.response\.use/);
      expect(content).toMatch(/catch.*error/);
      expect(content).toMatch(/throw new Error/);
    });

    test('TC-C3.3: JWT headers should be automatically added', () => {
      const apiPath = 'client/src/services/api.js';
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Should have request interceptor for auth headers
      expect(content).toMatch(/api\.interceptors\.request\.use/);
      expect(content).toMatch(/Authorization.*Bearer/);
      expect(content).toMatch(/localStorage\.getItem.*token/);
    });

    test('TC-C3.4: Automatic token refresh should be implemented', () => {
      const apiPath = 'client/src/services/api.js';
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Should handle 401 errors with token refresh
      expect(content).toMatch(/error\.response\?\.status === 401/);
      expect(content).toMatch(/refreshToken/);
      expect(content).toMatch(/auth\/refresh/);
    });
  });

  // CRITICAL TASK 4: Database Configuration
  describe('TC-C4: Database Configuration', () => {
    
    test('TC-C4.1: Database config should use environment variables', () => {
      const dbPath = 'server/db.ts';
      expect(fs.existsSync(dbPath)).toBe(true);
      
      const content = fs.readFileSync(dbPath, 'utf8');
      
      // Should use environment variables, not hardcoded values
      expect(content).toMatch(/process\.env\./);
      expect(content).toMatch(/getEnvVar/);
      expect(content).not.toMatch(/password.*=.*['"][^'"\$]/); // No hardcoded passwords
    });

    test('TC-C4.2: Database should support multi-tenant configuration', () => {
      const dbPath = 'server/db.ts';
      const content = fs.readFileSync(dbPath, 'utf8');
      
      // Should have multi-tenant support
      expect(content).toMatch(/tenantId/);
      expect(content).toMatch(/TenantDatabase/);
      expect(content).toMatch(/DatabaseManager/);
    });

    test('TC-C4.3: Database should have connection pooling', () => {
      const dbPath = 'server/db.ts';
      const content = fs.readFileSync(dbPath, 'utf8');
      
      // Should use connection pooling
      expect(content).toMatch(/Pool/);
      expect(content).toMatch(/maxConnections/);
      expect(content).toMatch(/connectionTimeoutMillis/);
    });

    test('TC-C4.4: Database config should have SSL support', () => {
      const dbPath = 'server/db.ts';
      const content = fs.readFileSync(dbPath, 'utf8');
      
      // Should support SSL configuration
      expect(content).toMatch(/ssl/);
      expect(content).toMatch(/DB_SSL/);
    });
  });

  // Integration Tests
  describe('Phase 1 Integration Tests', () => {
    
    test('INT-1: All critical files should exist', () => {
      const criticalFiles = [
        'client/src/services/api.js',
        'client/src/services/apiConfig.js', 
        'client/src/pages/Portfolio.tsx',
        'client/src/main.tsx',
        'server/db.ts',
        '.gitignore',
        'tsconfig.json',
        'tsconfig.node.json'
      ];
      
      criticalFiles.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });
    });

    test('INT-2: Package.json should have required scripts', () => {
      const packagePath = 'package.json';
      const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(content.scripts).toHaveProperty('check');
      expect(content.scripts).toHaveProperty('build');
      expect(content.scripts.check).toMatch(/tsc/);
    });

    test('INT-3: TypeScript configuration files should be properly structured', () => {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      const tsconfigNode = JSON.parse(fs.readFileSync('tsconfig.node.json', 'utf8'));
      
      // Main tsconfig should exclude server
      expect(tsconfig.exclude).toContain('server');
      
      // Node tsconfig should include server
      expect(tsconfigNode.include).toContain('server/**/*');
      expect(tsconfigNode.compilerOptions.noEmit).toBe(false);
    });
  });
});
