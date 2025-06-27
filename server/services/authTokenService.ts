import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { dbManager } from '../db';
import { auditService } from './auditService';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: Date;
}

interface RefreshTokenData {
  id: string;
  userId: number;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  deviceFingerprint?: string;
  lastUsed: Date;
  createdAt: Date;
}

interface TokenClaims {
  tenantId: string;
  userId: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  deviceId?: string;
  sessionId?: string;
  needsRefresh?: boolean;
}

export class AuthTokenService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'renx-jwt-secret';
  private readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Shorter for security
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  private readonly REFRESH_TOKEN_ROTATION = process.env.REFRESH_TOKEN_ROTATION === 'true';
  private readonly MAX_REFRESH_TOKENS_PER_USER = 5; // Limit concurrent sessions

  /**
   * Generate a complete token pair with automatic expiration handling
   */
  async generateTokenPair(
    tenantId: string,
    userId: number,
    email: string,
    role: string,
    deviceFingerprint?: string
  ): Promise<TokenPair> {
    try {
      const sessionId = crypto.randomUUID();
      const deviceId = deviceFingerprint ? this.hashDeviceFingerprint(deviceFingerprint) : undefined;

      // Generate access token with short expiration
      const accessTokenClaims: TokenClaims = {
        tenantId,
        userId,
        email,
        role,
        type: 'access',
        deviceId,
        sessionId
      };

      const accessToken = jwt.sign(accessTokenClaims, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'renx-platform',
        audience: 'renx-users'
      } as SignOptions);

      // Generate refresh token with longer expiration
      const refreshTokenClaims: TokenClaims = {
        tenantId,
        userId,
        email,
        role,
        type: 'refresh',
        deviceId,
        sessionId
      };

      const refreshToken = jwt.sign(refreshTokenClaims, this.JWT_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'renx-platform',
        audience: 'renx-users'
      } as SignOptions);

      // Store refresh token securely
      await this.storeRefreshToken(refreshToken, tenantId, userId, deviceFingerprint);

      // Calculate expiration time
      const expiresIn = this.parseExpirationTime(this.ACCESS_TOKEN_EXPIRES_IN);
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Log successful token generation
      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          sessionId,
          deviceId: deviceId?.substring(0, 8),
          tokenExpiration: expiresAt.toISOString()
        },
        severity: 'low'
      });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating token pair:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Refresh access token with automatic rotation
   */
  async refreshAccessToken(refreshToken: string, deviceFingerprint?: string): Promise<TokenPair | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as JwtPayload & TokenClaims;
      
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      const { tenantId, userId, email, role, sessionId } = decoded;

      // Validate refresh token is stored and not revoked
      const isValid = await this.validateRefreshToken(refreshToken, tenantId, userId);
      if (!isValid) {
        await auditService.logSecurityEvent({
          type: 'login_failure',
          tenantId,
          userId: userId.toString(),
          details: {
            reason: 'invalid_refresh_token',
            sessionId: sessionId || 'unknown'
          },
          severity: 'medium'
        });
        return null;
      }

      // Check device fingerprint if provided
      if (deviceFingerprint) {
        const storedToken = await this.getStoredRefreshToken(refreshToken);
        if (storedToken?.deviceFingerprint && 
            storedToken.deviceFingerprint !== this.hashDeviceFingerprint(deviceFingerprint)) {
          await auditService.logSecurityEvent({
            type: 'suspicious_activity',
            tenantId,
            userId: userId.toString(),
            details: {
              reason: 'device_fingerprint_mismatch',
              sessionId: sessionId || 'unknown'
            },
            severity: 'high'
          });
          return null;
        }
      }

      // Generate new token pair
      const newTokenPair = await this.generateTokenPair(tenantId, userId, email, role, deviceFingerprint);

      // If rotation is enabled, revoke old refresh token
      if (this.REFRESH_TOKEN_ROTATION) {
        await this.revokeRefreshToken(refreshToken, tenantId, userId);
      } else {
        // Update last used timestamp
        await this.updateRefreshTokenLastUsed(refreshToken);
      }

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          reason: 'token_refresh',
          sessionId: sessionId || 'unknown',
          rotationEnabled: this.REFRESH_TOKEN_ROTATION
        },
        severity: 'low'
      });

      return newTokenPair;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid refresh token');
      } else {
        console.error('Error refreshing token:', error);
      }
      return null;
    }
  }

  /**
   * Validate access token with comprehensive checks
   */
  async validateAccessToken(token: string): Promise<TokenClaims | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'renx-platform',
        audience: 'renx-users'
      }) as JwtPayload & TokenClaims;

      if (!decoded || decoded.type !== 'access') {
        return null;
      }

      // Check if token is close to expiration (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (decoded.exp || 0) - now;
      
      if (timeUntilExpiry <= 300) { // 5 minutes
        // Token is close to expiration, client should refresh
        decoded.needsRefresh = true;
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid access token');
      } else {
        console.error('Error validating access token:', error);
      }
      return null;
    }
  }

  /**
   * Revoke specific refresh token
   */
  async revokeRefreshToken(refreshToken: string, tenantId: string, userId: number): Promise<void> {
    try {
      const tokenHash = this.hashToken(refreshToken);
      const pool = await dbManager.getPool(tenantId);
      
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2',
        [tokenHash, userId]
      );

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'refresh_token_revoked',
          tokenHash: tokenHash.substring(0, 8)
        },
        severity: 'low'
      });
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user (logout all sessions)
   */
  async revokeAllRefreshTokens(tenantId: string, userId: number): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      const result = await pool.query(
        'DELETE FROM refresh_tokens WHERE user_id = $1 RETURNING token_hash',
        [userId]
      );

      await auditService.logSecurityEvent({
        type: 'login_success',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'all_refresh_tokens_revoked',
          tokensRevoked: result.rowCount || 0
        },
        severity: 'low'
      });
    } catch (error) {
      console.error('Error revoking all refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(tenantId: string, userId: number): Promise<RefreshTokenData[]> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      const result = await pool.query(
        `SELECT id, user_id, tenant_id, token_hash, expires_at, device_fingerprint, 
                last_used, created_at
         FROM refresh_tokens 
         WHERE user_id = $1 AND expires_at > NOW()
         ORDER BY last_used DESC`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        tenantId: row.tenant_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        deviceFingerprint: row.device_fingerprint,
        lastUsed: row.last_used,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Store refresh token securely in database
   */
  private async storeRefreshToken(
    refreshToken: string,
    tenantId: string,
    userId: number,
    deviceFingerprint?: string
  ): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      const tokenHash = this.hashToken(refreshToken);
      const deviceHash = deviceFingerprint ? this.hashDeviceFingerprint(deviceFingerprint) : null;
      
      // Check if we need to clean up old tokens
      const existingTokens = await this.getActiveSessions(tenantId, userId);
      if (existingTokens.length >= this.MAX_REFRESH_TOKENS_PER_USER) {
        // Remove oldest token
        const oldestToken = existingTokens[existingTokens.length - 1];
        await pool.query(
          'DELETE FROM refresh_tokens WHERE id = $1',
          [oldestToken.id]
        );
      }

      await pool.query(
        `INSERT INTO refresh_tokens 
         (id, user_id, tenant_id, token_hash, expires_at, device_fingerprint, last_used, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          crypto.randomUUID(),
          userId,
          tenantId,
          tokenHash,
          new Date(Date.now() + this.parseExpirationTime(this.REFRESH_TOKEN_EXPIRES_IN) * 1000),
          deviceHash
        ]
      );
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  /**
   * Validate refresh token against stored data
   */
  private async validateRefreshToken(refreshToken: string, tenantId: string, userId: number): Promise<boolean> {
    try {
      const pool = await dbManager.getPool(tenantId);
      const tokenHash = this.hashToken(refreshToken);
      
      const result = await pool.query(
        'SELECT expires_at FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2',
        [tokenHash, userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const expiresAt = new Date(result.rows[0].expires_at);
      return expiresAt > new Date();
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Get stored refresh token data
   */
  private async getStoredRefreshToken(refreshToken: string): Promise<RefreshTokenData | null> {
    try {
      // This is a simplified version - in production, you'd need to know the tenant
      // For now, we'll query the tenant management pool
      const pool = await dbManager.getPool('tenant_management');
      const tokenHash = this.hashToken(refreshToken);
      
      const result = await pool.query(
        `SELECT id, user_id, tenant_id, token_hash, expires_at, device_fingerprint, 
                last_used, created_at
         FROM refresh_tokens 
         WHERE token_hash = $1`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        tenantId: row.tenant_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        deviceFingerprint: row.device_fingerprint,
        lastUsed: row.last_used,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Error getting stored refresh token:', error);
      return null;
    }
  }

  /**
   * Update last used timestamp for refresh token
   */
  private async updateRefreshTokenLastUsed(refreshToken: string): Promise<void> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const tokenHash = this.hashToken(refreshToken);
      
      await pool.query(
        'UPDATE refresh_tokens SET last_used = NOW() WHERE token_hash = $1',
        [tokenHash]
      );
    } catch (error) {
      console.error('Error updating refresh token last used:', error);
    }
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Hash device fingerprint for secure storage
   */
  private hashDeviceFingerprint(fingerprint: string): string {
    return crypto.createHash('sha256').update(fingerprint + this.JWT_SECRET).digest('hex');
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      
      const result = await pool.query(
        'DELETE FROM refresh_tokens WHERE expires_at <= NOW()'
      );

      const deletedCount = result.rowCount || 0;
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired refresh tokens`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}

export const authTokenService = new AuthTokenService(); 