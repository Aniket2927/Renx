import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { dbManager } from '../db';
import { rbacService } from '../services/rbacService';
import { authTokenService } from '../services/authTokenService';
import { mfaService } from '../services/mfaService';
import { sessionService } from '../services/sessionService';
import { auditService } from '../services/auditService';
import { AuthRequest, AuthResponse, TokenResponse, EnhancedUser } from '../types/enhanced-types';

/**
 * Enhanced Authentication Controller with MFA and Session Management
 * 
 * Handles multi-tenant authentication with comprehensive security features
 */
export class AuthController {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'renx-jwt-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Shortened for security
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  /**
   * Enhanced multi-tenant user login with MFA support
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, tenantId, totpCode, rememberDevice } = req.body;

      if (!email || !password || !tenantId) {
        res.status(400).json({
          success: false,
          message: 'Email, password, and tenant ID are required',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get database pool for the tenant
      const userPool = await dbManager.getPool(tenantId);

      // Find user with comprehensive validation
      const userResult = await userPool.query(
        'SELECT id, username, email, password, first_name, last_name, role, status, last_login FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        await auditService.logUserLogin(tenantId, 'unknown', false, req.ip, req.get('User-Agent'));
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = userResult.rows[0];

      // Check user status
      if (user.status !== 'active') {
        await auditService.logUserLogin(tenantId, user.id.toString(), false, req.ip, req.get('User-Agent'));
        res.status(403).json({
          success: false,
          message: 'User account is not active',
          code: 'USER_INACTIVE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        await auditService.logUserLogin(tenantId, user.id.toString(), false, req.ip, req.get('User-Agent'));
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if MFA is enabled
      const mfaEnabled = await mfaService.isMFAEnabled(tenantId, user.id);
      
      if (mfaEnabled && !totpCode) {
        // Return MFA challenge requirement
        res.status(200).json({
          success: false,
          requiresMFA: true,
          message: 'Multi-factor authentication required',
          code: 'MFA_REQUIRED',
          userId: user.id,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify MFA if provided
      if (mfaEnabled && totpCode) {
        const mfaVerification = await mfaService.verifyMFAChallenge(
          tenantId,
          user.id,
          'totp',
          totpCode,
          undefined,
          this.getDeviceFingerprint(req)
        );

        if (!mfaVerification.isValid) {
          await auditService.logUserLogin(tenantId, user.id.toString(), false, req.ip, req.get('User-Agent'));
          res.status(401).json({
            success: false,
            message: 'Invalid authentication code',
            code: 'INVALID_MFA_CODE',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Create session
      const deviceInfo = this.extractDeviceInfo(req);
      const session = await sessionService.createSession(
        tenantId,
        user.id,
        this.getDeviceFingerprint(req),
        deviceInfo,
        req.ip || 'unknown'
      );

      // Generate token pair using enhanced token service
      const tokenPair = await authTokenService.generateTokenPair(
        tenantId,
        user.id,
        user.email,
        user.role,
        this.getDeviceFingerprint(req)
      );

      // Update last login
      await userPool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Get user permissions
      const permissions = await rbacService.getUserPermissions(tenantId, user.id);

      const enhancedUser: EnhancedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions,
        status: user.status,
        tenantId,
        isActive: user.status === 'active',
        lastLoginAt: user.last_login?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: enhancedUser,
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn,
          sessionId: session.id,
          mfaEnabled
        }
      };

      await auditService.logUserLogin(tenantId, user.id.toString(), true, req.ip, req.get('User-Agent'));

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to authenticate user',
        code: 'LOGIN_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Enhanced token refresh with session validation
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Use enhanced token service for refresh
      const newTokenPair = await authTokenService.refreshAccessToken(
        refreshToken,
        this.getDeviceFingerprint(req)
      );

      if (!newTokenPair) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: TokenResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
          expiresIn: newTokenPair.expiresIn
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        code: 'TOKEN_REFRESH_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Enhanced logout with session termination
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken, logoutAllSessions } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      if (logoutAllSessions) {
        // Terminate all user sessions
        await sessionService.terminateAllUserSessions(tenantId, userId);
        await authTokenService.revokeAllRefreshTokens(tenantId, userId);
      } else {
        // Terminate current session only
        if (req.sessionID) {
          await sessionService.terminateSession(req.sessionID, 'manual_logout');
        }
        
        if (refreshToken) {
          await authTokenService.revokeRefreshToken(refreshToken, tenantId, userId);
        }
      }

      res.json({
        success: true,
        message: logoutAllSessions ? 'Logged out from all sessions' : 'Logged out successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        code: 'LOGOUT_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const userEmail = req.auth?.email!;

      const mfaSetup = await mfaService.setupTOTP(tenantId, userId, userEmail);

      res.json({
        success: true,
        message: 'MFA setup initiated',
        data: {
          secret: mfaSetup.secret,
          qrCodeUrl: mfaSetup.qrCodeUrl,
          backupCodes: mfaSetup.backupCodes,
          manualEntryKey: mfaSetup.manualEntryKey
        }
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup MFA',
        code: 'MFA_SETUP_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verify MFA setup
   */
  async verifyMFASetup(req: Request, res: Response): Promise<void> {
    try {
      const { totpCode } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      if (!totpCode) {
        res.status(400).json({
          success: false,
          message: 'TOTP code is required',
          code: 'MISSING_TOTP_CODE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const verified = await mfaService.verifyTOTPSetup(tenantId, userId, totpCode);

      if (verified) {
        res.json({
          success: true,
          message: 'MFA enabled successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid TOTP code',
          code: 'INVALID_TOTP_CODE',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify MFA',
        code: 'MFA_VERIFICATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const sessions = await sessionService.getUserSessions(tenantId, userId);

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            isCurrentSession: session.id === req.sessionID
          }))
        }
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active sessions',
        code: 'GET_SESSIONS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Terminate specific session
   */
  async terminateSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      // Verify the session belongs to the user
      const sessions = await sessionService.getUserSessions(tenantId, userId);
      const targetSession = sessions.find(s => s.id === sessionId);

      if (!targetSession) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await sessionService.terminateSession(sessionId, 'manual_termination');

      res.json({
        success: true,
        message: 'Session terminated successfully'
      });
    } catch (error) {
      console.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate session',
        code: 'TERMINATE_SESSION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Extract device information from request
   */
  private extractDeviceInfo(req: Request): any {
    const userAgent = req.get('User-Agent') || '';
    
    return {
      userAgent,
      platform: this.extractPlatform(userAgent),
      browser: this.extractBrowser(userAgent),
      acceptLanguage: req.get('Accept-Language'),
      acceptEncoding: req.get('Accept-Encoding')
    };
  }

  /**
   * Generate device fingerprint
   */
  private getDeviceFingerprint(req: Request): string {
    const components = [
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || '',
      req.ip || ''
    ];
    
    return Buffer.from(components.join('|')).toString('base64');
  }

  /**
   * Extract platform from user agent
   */
  private extractPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Extract browser from user agent
   */
  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
}

// Export controller instance
export const authController = new AuthController(); 