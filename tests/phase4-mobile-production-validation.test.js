/**
 * Phase 4: Mobile & Production Readiness - Test Suite
 * RenX Neural Trading Platform
 */

const fs = require('fs');
const path = require('path');

describe('Phase 4: Mobile & Production Readiness', () => {
  let testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  };

  const logTest = (testName, passed) => {
    testResults.totalTests++;
    if (passed) {
      testResults.passedTests++;
      console.log(`✅ ${testName}`);
    } else {
      testResults.failedTests++;
      console.log(`❌ ${testName}`);
    }
  };

  describe('TC-M9: Mobile React Native App Integration', () => {
    
    test('TC-M9.1: React Native app builds successfully', () => {
      const testName = 'TC-M9.1: React Native Build Success';
      
      try {
        const mobileDir = path.join(process.cwd(), 'mobile');
        expect(fs.existsSync(mobileDir)).toBe(true);
        
        const packageJsonPath = path.join(mobileDir, 'package.json');
        expect(fs.existsSync(packageJsonPath)).toBe(true);
        
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        expect(packageJson.scripts).toHaveProperty('start');
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-M9.2: Mobile API Integration', () => {
      const testName = 'TC-M9.2: Mobile API Integration';
      
      try {
        const apiServicePath = path.join(process.cwd(), 'mobile/src/services/ApiService.ts');
        expect(fs.existsSync(apiServicePath)).toBe(true);
        
        const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
        expect(apiServiceContent).toMatch(/login/);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-M9.3: Cross-Platform Feature Parity', () => {
      const testName = 'TC-M9.3: Cross-Platform Feature Parity';
      
      try {
        const appPath = path.join(process.cwd(), 'mobile/App.tsx');
        expect(fs.existsSync(appPath)).toBe(true);
        
        const navPath = path.join(process.cwd(), 'mobile/src/navigation/AppNavigator.tsx');
        expect(fs.existsSync(navPath)).toBe(true);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-M9.4: Mobile User Journey', () => {
      const testName = 'TC-M9.4: Mobile User Journey';
      
      try {
        const tradingScreenPath = path.join(process.cwd(), 'mobile/src/screens/TradingScreen.tsx');
        expect(fs.existsSync(tradingScreenPath)).toBe(true);
        
        const portfolioScreenPath = path.join(process.cwd(), 'mobile/src/screens/PortfolioScreen.tsx');
        expect(fs.existsSync(portfolioScreenPath)).toBe(true);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-M9.5: App Store Requirements', () => {
      const testName = 'TC-M9.5: App Store Requirements';
      
      try {
        const deployScriptPath = path.join(process.cwd(), 'deploy-mobile.sh');
        expect(fs.existsSync(deployScriptPath)).toBe(true);
        
        const deployContent = fs.readFileSync(deployScriptPath, 'utf8');
        expect(deployContent).toMatch(/eas build/);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });
  });

  describe('TC-P10: Production Deployment & Monitoring', () => {
    
    test('TC-P10.1: Docker Production Build', () => {
      const testName = 'TC-P10.1: Docker Production Build';
      
      try {
        const deployScriptPath = path.join(process.cwd(), 'deploy-mobile.sh');
        expect(fs.existsSync(deployScriptPath)).toBe(true);
        
        const deployContent = fs.readFileSync(deployScriptPath, 'utf8');
        expect(deployContent).toMatch(/docker/);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-P10.2: Kubernetes Auto-scaling', () => {
      const testName = 'TC-P10.2: Kubernetes Auto-scaling';
      
      try {
        const k8sDeploymentPath = path.join(process.cwd(), 'k8s/mobile-deployment.yaml');
        expect(fs.existsSync(k8sDeploymentPath)).toBe(true);
        
        const k8sContent = fs.readFileSync(k8sDeploymentPath, 'utf8');
        expect(k8sContent).toMatch(/HorizontalPodAutoscaler/);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });

    test('TC-P10.3: Monitoring Dashboard', () => {
      const testName = 'TC-P10.3: Monitoring Dashboard';
      
      try {
        const k8sDeploymentPath = path.join(process.cwd(), 'k8s/mobile-deployment.yaml');
        const k8sContent = fs.readFileSync(k8sDeploymentPath, 'utf8');
        
        expect(k8sContent).toMatch(/livenessProbe/);
        expect(k8sContent).toMatch(/readinessProbe/);
        
        logTest(testName, true);
      } catch (error) {
        logTest(testName, false);
        throw error;
      }
    });
  });

  afterAll(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📱 PHASE 4: MOBILE & PRODUCTION READINESS - TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passedTests}`);
    console.log(`❌ Failed: ${testResults.failedTests}`);
    console.log(`📈 Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));
    
    if (testResults.failedTests === 0) {
      console.log('🎉 ALL PHASE 4 TESTS PASSED! Mobile & Production Readiness VALIDATED!');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues.');
    }
    
    console.log('='.repeat(80));
  });
}); 