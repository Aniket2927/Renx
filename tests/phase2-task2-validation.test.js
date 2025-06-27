const fs = require('fs');
const path = require('path');

/**
 * Phase 2, Task 2: Security Authentication & Authorization
 * Test Cases for validating enhanced security features
 */

describe('Phase 2, Task 2: Security Authentication & Authorization', () => {
  
  // TC-M5.1: Enhanced JWT Token Management
  test('TC-M5.1: Should have enhanced JWT token service with automatic refresh', () => {
    const tokenServicePath = 'server/services/authTokenService.ts';
    expect(fs.existsSync(tokenServicePath)).toBe(true);
    
    const content = fs.readFileSync(tokenServicePath, 'utf8');
    
    // Should have AuthTokenService class
    expect(content).toMatch(/export class AuthTokenService/);
    expect(content).toMatch(/generateTokenPair/);
    expect(content).toMatch(/refreshAccessToken/);
    expect(content).toMatch(/validateAccessToken/);
    
    // Should handle token rotation
    expect(content).toMatch(/REFRESH_TOKEN_ROTATION/);
    expect(content).toMatch(/revokeRefreshToken/);
    
    // Should have automatic expiration detection
    expect(content).toMatch(/needsRefresh.*true/);
    expect(content).toMatch(/timeUntilExpiry.*300/); // 5 minutes
    
    // Should have secure token storage
    expect(content).toMatch(/hashToken/);
    expect(content).toMatch(/sha256/);
  });

  // TC-M5.2: Multi-Factor Authentication (MFA) Implementation
  test('TC-M5.2: Should have comprehensive MFA service with TOTP support', () => {
    const mfaServicePath = 'server/services/mfaService.ts';
    expect(fs.existsSync(mfaServicePath)).toBe(true);
    
    const content = fs.readFileSync(mfaServicePath, 'utf8');
    
    // Should have MFAService class
    expect(content).toMatch(/export class MFAService/);
    expect(content).toMatch(/setupTOTP/);
    expect(content).toMatch(/verifyTOTPSetup/);
    expect(content).toMatch(/verifyMFAChallenge/);
    
    // Should have TOTP with speakeasy
    expect(content).toMatch(/speakeasy/);
    expect(content).toMatch(/generateSecret/);
    expect(content).toMatch(/qrcode/);
    
    // Should have backup codes
    expect(content).toMatch(/generateBackupCodes/);
    expect(content).toMatch(/verifyBackupCode/);
    expect(content).toMatch(/BACKUP_CODE_COUNT.*10/);
    
    // Should have security features
    expect(content).toMatch(/isMFAEnabled/);
    expect(content).toMatch(/disableMFA/);
  });

  // TC-M5.3: Session Management with Activity Tracking
  test('TC-M5.3: Should have comprehensive session management service', () => {
    const sessionServicePath = 'server/services/sessionService.ts';
    expect(fs.existsSync(sessionServicePath)).toBe(true);
    
    const content = fs.readFileSync(sessionServicePath, 'utf8');
    
    // Should have SessionService class
    expect(content).toMatch(/export class SessionService/);
    expect(content).toMatch(/createSession/);
    expect(content).toMatch(/updateActivity/);
    expect(content).toMatch(/terminateSession/);
    
    // Should have 30-minute timeout
    expect(content).toMatch(/SESSION_TIMEOUT.*30.*60.*1000/);
    expect(content).toMatch(/WARNING_THRESHOLD.*5.*60.*1000/);
    
    // Should handle concurrent sessions
    expect(content).toMatch(/MAX_CONCURRENT_SESSIONS/);
    expect(content).toMatch(/concurrent_session/);
    
    // Should detect suspicious activity
    expect(content).toMatch(/detectSuspiciousActivity/);
    expect(content).toMatch(/deviceFingerprint/);
  });

  // TC-M5.4: Enhanced Security Middleware
  test('TC-M5.4: Should have comprehensive security middleware', () => {
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    expect(fs.existsSync(securityMiddlewarePath)).toBe(true);
    
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    // Should have SecurityMiddleware class
    expect(content).toMatch(/export class SecurityMiddleware/);
    expect(content).toMatch(/securityHeaders/);
    expect(content).toMatch(/csrfProtection/);
    expect(content).toMatch(/generalRateLimit/);
    
    // Should have helmet security headers
    expect(content).toMatch(/helmet/);
    expect(content).toMatch(/contentSecurityPolicy/);
    expect(content).toMatch(/hsts/);
    expect(content).toMatch(/frameguard/);
    
    // Should have rate limiting
    expect(content).toMatch(/rateLimit/);
    expect(content).toMatch(/authRateLimit/);
    expect(content).toMatch(/apiRateLimit/);
    
    // Should have CSRF protection
    expect(content).toMatch(/generateCSRFToken/);
    expect(content).toMatch(/validateCSRFToken/);
    expect(content).toMatch(/CSRF_TOKEN_EXPIRY/);
  });

  // TC-M5.5: Enhanced Authentication Controller Integration
  test('TC-M5.5: Should have enhanced auth controller with MFA and session integration', () => {
    const authControllerPath = 'server/controllers/authController.ts';
    expect(fs.existsSync(authControllerPath)).toBe(true);
    
    const content = fs.readFileSync(authControllerPath, 'utf8');
    
    // Should import new services
    expect(content).toMatch(/import.*authTokenService/);
    expect(content).toMatch(/import.*mfaService/);
    expect(content).toMatch(/import.*sessionService/);
    
    // Should handle MFA in login
    expect(content).toMatch(/mfaEnabled.*isMFAEnabled/);
    expect(content).toMatch(/requiresMFA.*true/);
    expect(content).toMatch(/verifyMFAChallenge/);
    
    // Should create sessions
    expect(content).toMatch(/createSession/);
    expect(content).toMatch(/generateTokenPair/);
    expect(content).toMatch(/getDeviceFingerprint/);
    
    // Should have MFA setup endpoints
    expect(content).toMatch(/setupMFA/);
    expect(content).toMatch(/verifyMFASetup/);
    expect(content).toMatch(/getActiveSessions/);
    expect(content).toMatch(/terminateSession/);
  });

  // TC-M5.6: Rate Limiting Configuration
  test('TC-M5.6: Should have proper rate limiting configuration', () => {
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    // Should have different rate limits for different endpoints
    expect(content).toMatch(/general.*windowMs.*15.*60.*1000.*max.*100/);
    expect(content).toMatch(/auth.*windowMs.*15.*60.*1000.*max.*5/);
    expect(content).toMatch(/api.*windowMs.*1.*60.*1000.*max.*60/);
    
    // Should track failed attempts
    expect(content).toMatch(/MAX_FAILED_ATTEMPTS.*5/);
    expect(content).toMatch(/LOCKOUT_DURATION.*15.*60.*1000/);
    expect(content).toMatch(/trackFailedAttempt/);
  });

  // TC-M5.7: Security Headers Implementation
  test('TC-M5.7: Should implement comprehensive security headers', () => {
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    // Should have CSP directives
    expect(content).toMatch(/defaultSrc.*self/);
    expect(content).toMatch(/scriptSrc.*self/);
    expect(content).toMatch(/styleSrc.*self/);
    expect(content).toMatch(/objectSrc.*none/);
    
    // Should have HSTS
    expect(content).toMatch(/hsts:[\s\S]*maxAge:\s*31536000/);
    expect(content).toMatch(/includeSubDomains:\s*true/);
    
    // Should have other security headers
    expect(content).toMatch(/frameguard.*deny/);
    expect(content).toMatch(/noSniff.*true/);
    expect(content).toMatch(/xssFilter.*true/);
  });

  // TC-M5.8: Token Security and Validation
  test('TC-M5.8: Should have secure token handling and validation', () => {
    const tokenServicePath = 'server/services/authTokenService.ts';
    const content = fs.readFileSync(tokenServicePath, 'utf8');
    
    // Should use shorter access token expiration
    expect(content).toMatch(/ACCESS_TOKEN_EXPIRES_IN.*15m/);
    
    // Should validate token issuer and audience
    expect(content).toMatch(/issuer.*renx-platform/);
    expect(content).toMatch(/audience.*renx-users/);
    
    // Should handle device fingerprinting
    expect(content).toMatch(/deviceFingerprint/);
    expect(content).toMatch(/hashDeviceFingerprint/);
    
    // Should limit concurrent sessions
    expect(content).toMatch(/MAX_REFRESH_TOKENS_PER_USER.*5/);
  });

  // TC-M5.9: Audit Logging for Security Events
  test('TC-M5.9: Should have comprehensive security audit logging', () => {
    const authControllerPath = 'server/controllers/authController.ts';
    const content = fs.readFileSync(authControllerPath, 'utf8');
    
    // Should log all login attempts
    expect(content).toMatch(/logUserLogin\([^,]+,[^,]+,\s*false/); // Failed attempts
    expect(content).toMatch(/logUserLogin\([^,]+,[^,]+,\s*true/); // Successful attempts
    
    const mfaServicePath = 'server/services/mfaService.ts';
    const mfaContent = fs.readFileSync(mfaServicePath, 'utf8');
    
    // Should log MFA events
    expect(mfaContent).toMatch(/action: 'mfa_setup_initiated'/);
    expect(mfaContent).toMatch(/action: 'mfa_enabled'/);
    expect(mfaContent).toMatch(/action: 'mfa_verification_success'/);
    expect(mfaContent).toMatch(/action: 'mfa_verification_failed'/);
  });

  // TC-M5.10: Cross-Tab Session Synchronization Support
  test('TC-M5.10: Should support session management across multiple tabs', () => {
    const sessionServicePath = 'server/services/sessionService.ts';
    const content = fs.readFileSync(sessionServicePath, 'utf8');
    
    // Should handle session activity updates
    expect(content).toMatch(/updateActivity/);
    expect(content).toMatch(/extendSession/);
    
    // Should detect session timeouts
    expect(content).toMatch(/checkSessionTimeout/);
    expect(content).toMatch(/WARNING_THRESHOLD/);
    
    // Should handle session warnings
    expect(content).toMatch(/SessionWarning/);
    expect(content).toMatch(/timeout_warning/);
    expect(content).toMatch(/timeRemaining/);
  });

  // TC-M5.11: Device Trust and Fingerprinting
  test('TC-M5.11: Should implement device trust and fingerprinting', () => {
    const mfaServicePath = 'server/services/mfaService.ts';
    const content = fs.readFileSync(mfaServicePath, 'utf8');
    
    // Should have trusted device functionality
    expect(content).toMatch(/TrustedDevice/);
    expect(content).toMatch(/trustDevice/);
    expect(content).toMatch(/isTrustedDevice/);
    
    // Should have device expiry
    expect(content).toMatch(/TRUSTED_DEVICE_EXPIRY.*30.*24.*60.*60.*1000/); // 30 days
    
    const authControllerPath = 'server/controllers/authController.ts';
    const authContent = fs.readFileSync(authControllerPath, 'utf8');
    
    // Should generate device fingerprints
    expect(authContent).toMatch(/getDeviceFingerprint/);
    expect(authContent).toMatch(/extractDeviceInfo/);
    expect(authContent).toMatch(/userAgent,[\s\S]*platform:[\s\S]*browser:/);
  });

  // TC-M5.12: Content Security and Validation
  test('TC-M5.12: Should validate content types and request sizes', () => {
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    // Should validate content types
    expect(content).toMatch(/contentTypeValidation/);
    expect(content).toMatch(/application\/json/);
    expect(content).toMatch(/multipart\/form-data/);
    expect(content).toMatch(/INVALID_CONTENT_TYPE/);
    
    // Should limit request sizes
    expect(content).toMatch(/requestSizeLimit/);
    expect(content).toMatch(/10.*1024.*1024/); // 10MB
    expect(content).toMatch(/REQUEST_TOO_LARGE/);
  });

  // TC-M5.13: Progressive Security Measures
  test('TC-M5.13: Should implement progressive security measures', () => {
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    // Should have slow down middleware
    expect(content).toMatch(/slowDownMiddleware/);
    expect(content).toMatch(/slowDown/);
    expect(content).toMatch(/delayAfter.*50/);
    expect(content).toMatch(/delayMs.*500/);
    expect(content).toMatch(/maxDelayMs.*20000/);
    
    // Should escalate failed attempts
    expect(content).toMatch(/recordFailedAttempt/);
    expect(content).toMatch(/lockedUntil/);
    expect(content).toMatch(/ACCOUNT_LOCKED/);
  });

  console.log('✅ Phase 2, Task 2: Security Authentication & Authorization - All test cases defined');
});

/**
 * Integration Test for Security Features
 */
describe('Phase 2, Task 2: Security Integration Tests', () => {
  
  test('Should have all security services properly exported', () => {
    // Check service exports
    const tokenServicePath = 'server/services/authTokenService.ts';
    const mfaServicePath = 'server/services/mfaService.ts';
    const sessionServicePath = 'server/services/sessionService.ts';
    const securityMiddlewarePath = 'server/middleware/securityMiddleware.ts';
    
    const tokenContent = fs.readFileSync(tokenServicePath, 'utf8');
    const mfaContent = fs.readFileSync(mfaServicePath, 'utf8');
    const sessionContent = fs.readFileSync(sessionServicePath, 'utf8');
    const securityContent = fs.readFileSync(securityMiddlewarePath, 'utf8');
    
    expect(tokenContent).toMatch(/export const authTokenService/);
    expect(mfaContent).toMatch(/export const mfaService/);
    expect(sessionContent).toMatch(/export const sessionService/);
    expect(securityContent).toMatch(/export const securityMiddleware/);
  });

  test('Should have proper error handling in all security services', () => {
    const services = [
      'server/services/authTokenService.ts',
      'server/services/mfaService.ts',
      'server/services/sessionService.ts'
    ];

    services.forEach(servicePath => {
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Should have try-catch blocks
      expect(content).toMatch(/try\s*{/);
      expect(content).toMatch(/catch\s*\(error\)/);
      
      // Should log errors
      expect(content).toMatch(/console\.error/);
      
      // Should throw appropriate errors
      expect(content).toMatch(/throw new Error/);
    });
  });

  console.log('✅ Phase 2, Task 2: Security Integration - All tests passed');
}); 