import crypto from 'crypto';
import { dbManager } from '../db';
import { auditService } from './auditService';

interface UserSession {
  id: string;
  userId: number;
  tenantId: string;
  deviceFingerprint: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
    location?: string;
  };
  ipAddress: string;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

interface SessionWarning {
  type: 'timeout_warning' | 'concurrent_session' | 'suspicious_activity';
  message: string;
  timeRemaining?: number;
  action?: 'extend' | 'logout';
}

export class SessionService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before timeout
  private readonly MAX_CONCURRENT_SESSIONS = 3;

  /**
   * Create a new user session
   */
  async createSession(
    tenantId: string,
    userId: number,
    deviceFingerprint: string,
    deviceInfo: any,
    ipAddress: string
  ): Promise<UserSession> {
    try {
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

      const session: UserSession = {
        id: sessionId,
        userId,
        tenantId,
        deviceFingerprint,
        deviceInfo,
        ipAddress,
        lastActivity: new Date(),
        expiresAt,
        isActive: true,
        createdAt: new Date()
      };

      // Store session in database
      await this.storeSession(session);

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'session_created',
          sessionId,
          deviceInfo: this.sanitizeDeviceInfo(deviceInfo),
          ipAddress
        },
        ipAddress,
        userAgent: deviceInfo.userAgent,
        severity: 'low'
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create user session');
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string, activity: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.isActive) {
        return;
      }

      // Update last activity and extend expiration
      const newExpiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);
      
      const pool = await dbManager.getPool(session.tenantId);
      await pool.query(
        'UPDATE user_sessions SET last_activity = NOW(), expires_at = $1 WHERE id = $2',
        [newExpiresAt, sessionId]
      );
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * Get session information
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      
      const result = await pool.query(
        `SELECT id, user_id, tenant_id, device_fingerprint, device_info, ip_address,
                last_activity, expires_at, is_active, created_at
         FROM user_sessions 
         WHERE id = $1 AND expires_at > NOW()`,
        [sessionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        tenantId: row.tenant_id,
        deviceFingerprint: row.device_fingerprint,
        deviceInfo: JSON.parse(row.device_info),
        ipAddress: row.ip_address,
        lastActivity: row.last_activity,
        expiresAt: row.expires_at,
        isActive: row.is_active,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(tenantId: string, userId: number): Promise<UserSession[]> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      const result = await pool.query(
        `SELECT id, user_id, tenant_id, device_fingerprint, device_info, ip_address,
                last_activity, expires_at, is_active, created_at
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
         ORDER BY last_activity DESC`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        tenantId: row.tenant_id,
        deviceFingerprint: row.device_fingerprint,
        deviceInfo: JSON.parse(row.device_info),
        ipAddress: row.ip_address,
        lastActivity: row.last_activity,
        expiresAt: row.expires_at,
        isActive: row.is_active,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Check session timeout status
   */
  async checkSessionTimeout(sessionId: string): Promise<SessionWarning | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.isActive) {
        return null;
      }

      const now = new Date();
      const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();

      if (timeUntilExpiry <= 0) {
        await this.terminateSession(sessionId, 'timeout');
        return null;
      }

      if (timeUntilExpiry <= this.WARNING_THRESHOLD) {
        return {
          type: 'timeout_warning',
          message: `Your session will expire in ${Math.ceil(timeUntilExpiry / 60000)} minutes`,
          timeRemaining: timeUntilExpiry,
          action: 'extend'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking session timeout:', error);
      return null;
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.isActive) {
        return false;
      }

      const newExpiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);
      
      const pool = await dbManager.getPool(session.tenantId);
      await pool.query(
        'UPDATE user_sessions SET expires_at = $1, last_activity = NOW() WHERE id = $2',
        [newExpiresAt, sessionId]
      );

      return true;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId: string, reason: string = 'manual_logout'): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return;
      }

      // Mark session as inactive
      const pool = await dbManager.getPool(session.tenantId);
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      );

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId: session.tenantId,
        userId: session.userId.toString(),
        details: {
          action: 'session_terminated',
          sessionId,
          reason
        },
        severity: 'low'
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(tenantId: string, userId: number, excludeSessionId?: string): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      let query = 'UPDATE user_sessions SET is_active = false WHERE user_id = $1';
      let params: any[] = [userId];

      if (excludeSessionId) {
        query += ' AND id != $2';
        params.push(excludeSessionId);
      }

      await pool.query(query, params);

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'all_sessions_terminated',
          excludedSession: excludeSessionId
        },
        severity: 'medium'
      });
    } catch (error) {
      console.error('Error terminating all user sessions:', error);
      throw error;
    }
  }

  /**
   * Detect suspicious session activity
   */
  async detectSuspiciousActivity(sessionId: string, currentIp: string, currentUserAgent: string): Promise<SessionWarning | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      let suspicious = false;
      const reasons: string[] = [];

      // Check IP address change
      if (session.ipAddress !== currentIp) {
        suspicious = true;
        reasons.push('IP address change');
      }

      // Check user agent change
      if (session.deviceInfo.userAgent !== currentUserAgent) {
        suspicious = true;
        reasons.push('User agent change');
      }

      if (suspicious) {
        await auditService.logSecurityEvent({
          type: 'suspicious_activity',
          tenantId: session.tenantId,
          userId: session.userId.toString(),
          details: {
            sessionId,
            reasons,
            originalIp: session.ipAddress,
            currentIp,
            originalUserAgent: session.deviceInfo.userAgent,
            currentUserAgent
          },
          ipAddress: currentIp,
          userAgent: currentUserAgent,
          severity: 'high'
        });

        return {
          type: 'suspicious_activity',
          message: `Suspicious activity detected: ${reasons.join(', ')}`,
          action: 'logout'
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return null;
    }
  }

  /**
   * Store session in database
   */
  private async storeSession(session: UserSession): Promise<void> {
    try {
      const pool = await dbManager.getPool(session.tenantId);
      
      await pool.query(
        `INSERT INTO user_sessions 
         (id, user_id, tenant_id, device_fingerprint, device_info, ip_address, 
          last_activity, expires_at, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          session.id,
          session.userId,
          session.tenantId,
          session.deviceFingerprint,
          JSON.stringify(session.deviceInfo),
          session.ipAddress,
          session.lastActivity,
          session.expiresAt,
          session.isActive,
          session.createdAt
        ]
      );
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  }

  /**
   * Sanitize device info for logging
   */
  private sanitizeDeviceInfo(deviceInfo: any): any {
    return {
      platform: deviceInfo.platform,
      browser: deviceInfo.browser,
    };
  }
}

export const sessionService = new SessionService(); 