import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { dbManager } from '../db';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

interface MFAVerification {
  isValid: boolean;
  method: 'totp' | 'sms' | 'email' | 'backup_code';
  deviceTrusted?: boolean;
}

interface TrustedDevice {
  id: string;
  userId: number;
  tenantId: string;
  deviceFingerprint: string;
  deviceName: string;
  lastUsed: Date;
  expiresAt: Date;
  createdAt: Date;
}

interface MFAChallenge {
  id: string;
  userId: number;
  tenantId: string;
  type: 'sms' | 'email';
  code: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

export class MFAService {
  private readonly TOTP_WINDOW = 2; // Allow 2 time windows (±60 seconds)
  private readonly SMS_CODE_LENGTH = 6;
  private readonly EMAIL_CODE_LENGTH = 8;
  private readonly BACKUP_CODE_COUNT = 10;
  private readonly BACKUP_CODE_LENGTH = 8;
  private readonly MAX_ATTEMPTS = 3;
  private readonly CHALLENGE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly TRUSTED_DEVICE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Setup TOTP-based MFA for a user
   */
  async setupTOTP(tenantId: string, userId: number, userEmail: string): Promise<MFASetup> {
    try {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `RenX Trading (${userEmail})`,
        issuer: 'RenX Trading Platform',
        length: 32
      });

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Store MFA configuration (but don't enable yet - user must verify)
      await this.storeMFAConfiguration(tenantId, userId, {
        type: 'totp',
        secret: secret.base32,
        backupCodes: backupCodes,
        enabled: false,
        verifiedAt: null
      });

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

      await auditService.logSecurityEvent({
        type: 'permission_change',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'mfa_setup_initiated',
          method: 'totp'
        },
        severity: 'medium'
      });

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      throw new Error('Failed to setup TOTP authentication');
    }
  }

  /**
   * Verify TOTP setup and enable MFA
   */
  async verifyTOTPSetup(tenantId: string, userId: number, token: string): Promise<boolean> {
    try {
      const mfaConfig = await this.getMFAConfiguration(tenantId, userId);
      
      if (!mfaConfig || mfaConfig.type !== 'totp' || !mfaConfig.secret) {
        return false;
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: mfaConfig.secret,
        encoding: 'base32',
        token: token,
        window: this.TOTP_WINDOW
      });

      if (verified) {
        // Enable MFA
        await this.enableMFA(tenantId, userId);
        
        await auditService.logSecurityEvent({
          type: 'permission_change',
          tenantId,
          userId: userId.toString(),
          details: {
            action: 'mfa_enabled',
            method: 'totp'
          },
          severity: 'medium'
        });

        return true;
      }

      await auditService.logSecurityEvent({
        type: 'login_failure',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'mfa_setup_verification_failed',
          method: 'totp'
        },
        severity: 'medium'
      });

      return false;
    } catch (error) {
      console.error('Error verifying TOTP setup:', error);
      return false;
    }
  }

  /**
   * Send SMS verification code
   */
  async sendSMSChallenge(tenantId: string, userId: number, phoneNumber: string): Promise<string> {
    try {
      const code = this.generateVerificationCode(this.SMS_CODE_LENGTH);
      const challengeId = crypto.randomUUID();
      
      // Store challenge
      await this.storeMFAChallenge(tenantId, userId, {
        id: challengeId,
        type: 'sms',
        code: await this.hashCode(code),
        expiresAt: new Date(Date.now() + this.CHALLENGE_EXPIRY)
      });

      // Send SMS (implement with your SMS provider)
      const success = await this.sendSMS(phoneNumber, `Your RenX verification code is: ${code}. Valid for 5 minutes.`);
      
      if (!success) {
        throw new Error('Failed to send SMS');
      }

      await auditService.logSecurityEvent({
        type: 'permission_change',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'sms_challenge_sent',
          phoneNumber: this.maskPhoneNumber(phoneNumber)
        },
        severity: 'low'
      });

      return challengeId;
    } catch (error) {
      console.error('Error sending SMS challenge:', error);
      throw new Error('Failed to send SMS verification code');
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailChallenge(tenantId: string, userId: number, email: string): Promise<string> {
    try {
      const code = this.generateVerificationCode(this.EMAIL_CODE_LENGTH);
      const challengeId = crypto.randomUUID();
      
      // Store challenge
      await this.storeMFAChallenge(tenantId, userId, {
        id: challengeId,
        type: 'email',
        code: await this.hashCode(code),
        expiresAt: new Date(Date.now() + this.CHALLENGE_EXPIRY)
      });

      // Send email
      const success = await notificationService.sendEmail({
        to: email,
        subject: 'RenX Verification Code',
        template: 'verification-code',
        data: {
          code,
          expiryMinutes: 5,
          userEmail: email
        }
      });

      if (!success) {
        throw new Error('Failed to send email');
      }

      await auditService.logSecurityEvent({
        type: 'permission_change',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'email_challenge_sent',
          email: this.maskEmail(email)
        },
        severity: 'low'
      });

      return challengeId;
    } catch (error) {
      console.error('Error sending email challenge:', error);
      throw new Error('Failed to send email verification code');
    }
  }

  /**
   * Verify MFA challenge
   */
  async verifyMFAChallenge(
    tenantId: string,
    userId: number,
    method: 'totp' | 'sms' | 'email' | 'backup_code',
    code: string,
    challengeId?: string,
    deviceFingerprint?: string
  ): Promise<MFAVerification> {
    try {
      let isValid = false;
      let deviceTrusted = false;

      switch (method) {
        case 'totp':
          isValid = await this.verifyTOTP(tenantId, userId, code);
          break;
        case 'sms':
        case 'email':
          if (!challengeId) {
            throw new Error('Challenge ID required for SMS/email verification');
          }
          isValid = await this.verifyChallengeCode(tenantId, userId, challengeId, code);
          break;
        case 'backup_code':
          isValid = await this.verifyBackupCode(tenantId, userId, code);
          break;
      }

      if (isValid) {
        // Check if device should be trusted
        if (deviceFingerprint) {
          deviceTrusted = await this.isTrustedDevice(tenantId, userId, deviceFingerprint);
          
          if (!deviceTrusted) {
            // Optionally trust this device for future logins
            await this.trustDevice(tenantId, userId, deviceFingerprint, 'Login Device');
            deviceTrusted = true;
          }
        }

        await auditService.logSecurityEvent({
          type: 'login_success',
          tenantId,
          userId: userId.toString(),
          details: {
            action: 'mfa_verification_success',
            method,
            deviceTrusted
          },
          severity: 'low'
        });
      } else {
        await auditService.logSecurityEvent({
          type: 'login_failure',
          tenantId,
          userId: userId.toString(),
          details: {
            action: 'mfa_verification_failed',
            method
          },
          severity: 'medium'
        });
      }

      return {
        isValid,
        method,
        deviceTrusted
      };
    } catch (error) {
      console.error('Error verifying MFA challenge:', error);
      return {
        isValid: false,
        method,
        deviceTrusted: false
      };
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(tenantId: string, userId: number): Promise<boolean> {
    try {
      const mfaConfig = await this.getMFAConfiguration(tenantId, userId);
      return mfaConfig?.enabled || false;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(tenantId: string, userId: number): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      await pool.query(
        'UPDATE user_mfa_config SET enabled = false, disabled_at = NOW() WHERE user_id = $1',
        [userId]
      );

      // Revoke all trusted devices
      await pool.query(
        'DELETE FROM trusted_devices WHERE user_id = $1',
        [userId]
      );

      await auditService.logSecurityEvent({
        type: 'permission_change',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'mfa_disabled'
        },
        severity: 'high'
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  }

  /**
   * Get user's backup codes
   */
  async getBackupCodes(tenantId: string, userId: number): Promise<string[]> {
    try {
      const mfaConfig = await this.getMFAConfiguration(tenantId, userId);
      
      if (!mfaConfig?.backupCodes) {
        return [];
      }

      // Return only unused backup codes
      return mfaConfig.backupCodes.filter((code: any) => !code.used);
    } catch (error) {
      console.error('Error getting backup codes:', error);
      return [];
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(tenantId: string, userId: number): Promise<string[]> {
    try {
      const newBackupCodes = this.generateBackupCodes();
      
      const pool = await dbManager.getPool(tenantId);
      await pool.query(
        'UPDATE user_mfa_config SET backup_codes = $1 WHERE user_id = $2',
        [JSON.stringify(newBackupCodes.map(code => ({ code: this.hashCodeSync(code), used: false }))), userId]
      );

      await auditService.logSecurityEvent({
        type: 'permission_change',
        tenantId,
        userId: userId.toString(),
        details: {
          action: 'backup_codes_regenerated'
        },
        severity: 'medium'
      });

      return newBackupCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  }

  /**
   * Trust a device for future MFA bypassing
   */
  private async trustDevice(
    tenantId: string,
    userId: number,
    deviceFingerprint: string,
    deviceName: string
  ): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      const deviceId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + this.TRUSTED_DEVICE_EXPIRY);
      
      await pool.query(
        `INSERT INTO trusted_devices 
         (id, user_id, tenant_id, device_fingerprint, device_name, last_used, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())`,
        [deviceId, userId, tenantId, this.hashCodeSync(deviceFingerprint), deviceName, expiresAt]
      );
    } catch (error) {
      console.error('Error trusting device:', error);
      throw error;
    }
  }

  /**
   * Check if device is trusted
   */
  private async isTrustedDevice(tenantId: string, userId: number, deviceFingerprint: string): Promise<boolean> {
    try {
      const pool = await dbManager.getPool(tenantId);
      const hashedFingerprint = this.hashCodeSync(deviceFingerprint);
      
      const result = await pool.query(
        `SELECT id FROM trusted_devices 
         WHERE user_id = $1 AND device_fingerprint = $2 AND expires_at > NOW()`,
        [userId, hashedFingerprint]
      );

      if (result.rows.length > 0) {
        // Update last used timestamp
        await pool.query(
          'UPDATE trusted_devices SET last_used = NOW() WHERE id = $1',
          [result.rows[0].id]
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking trusted device:', error);
      return false;
    }
  }

  /**
   * Verify TOTP token
   */
  private async verifyTOTP(tenantId: string, userId: number, token: string): Promise<boolean> {
    try {
      const mfaConfig = await this.getMFAConfiguration(tenantId, userId);
      
      if (!mfaConfig?.enabled || mfaConfig.type !== 'totp' || !mfaConfig.secret) {
        return false;
      }

      return speakeasy.totp.verify({
        secret: mfaConfig.secret,
        encoding: 'base32',
        token: token,
        window: this.TOTP_WINDOW
      });
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Verify challenge code (SMS/Email)
   */
  private async verifyChallengeCode(
    tenantId: string,
    userId: number,
    challengeId: string,
    code: string
  ): Promise<boolean> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      const result = await pool.query(
        `SELECT code, expires_at, attempts, verified
         FROM mfa_challenges 
         WHERE id = $1 AND user_id = $2 AND verified = false`,
        [challengeId, userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const challenge = result.rows[0];
      
      // Check if expired
      if (new Date() > new Date(challenge.expires_at)) {
        return false;
      }

      // Check attempts
      if (challenge.attempts >= this.MAX_ATTEMPTS) {
        return false;
      }

      // Verify code
      const hashedCode = await this.hashCode(code);
      const isValid = challenge.code === hashedCode;

      // Update attempts
      await pool.query(
        'UPDATE mfa_challenges SET attempts = attempts + 1, verified = $1 WHERE id = $2',
        [isValid, challengeId]
      );

      return isValid;
    } catch (error) {
      console.error('Error verifying challenge code:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(tenantId: string, userId: number, code: string): Promise<boolean> {
    try {
      const mfaConfig = await this.getMFAConfiguration(tenantId, userId);
      
      if (!mfaConfig?.enabled || !mfaConfig.backupCodes) {
        return false;
      }

      const hashedCode = this.hashCodeSync(code);
      const backupCode = mfaConfig.backupCodes.find((bc: any) => bc.code === hashedCode && !bc.used);

      if (backupCode) {
        // Mark backup code as used
        backupCode.used = true;
        
        const pool = await dbManager.getPool(tenantId);
        await pool.query(
          'UPDATE user_mfa_config SET backup_codes = $1 WHERE user_id = $2',
          [JSON.stringify(mfaConfig.backupCodes), userId]
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  /**
   * Store MFA configuration
   */
  private async storeMFAConfiguration(tenantId: string, userId: number, config: any): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      await pool.query(
        `INSERT INTO user_mfa_config 
         (user_id, tenant_id, type, secret, backup_codes, enabled, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, tenant_id) 
         DO UPDATE SET type = $3, secret = $4, backup_codes = $5, enabled = $6, updated_at = NOW()`,
        [
          userId,
          tenantId,
          config.type,
          config.secret,
          JSON.stringify(config.backupCodes?.map((code: string) => ({ code: this.hashCodeSync(code), used: false })) || []),
          config.enabled
        ]
      );
    } catch (error) {
      console.error('Error storing MFA configuration:', error);
      throw error;
    }
  }

  /**
   * Get MFA configuration
   */
  private async getMFAConfiguration(tenantId: string, userId: number): Promise<any> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      const result = await pool.query(
        'SELECT type, secret, backup_codes, enabled FROM user_mfa_config WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const config = result.rows[0];
      return {
        type: config.type,
        secret: config.secret,
        backupCodes: config.backup_codes ? JSON.parse(config.backup_codes) : [],
        enabled: config.enabled
      };
    } catch (error) {
      console.error('Error getting MFA configuration:', error);
      return null;
    }
  }

  /**
   * Enable MFA
   */
  private async enableMFA(tenantId: string, userId: number): Promise<void> {
    const pool = await dbManager.getPool(tenantId);
    await pool.query(
      'UPDATE user_mfa_config SET enabled = true, verified_at = NOW() WHERE user_id = $1',
      [userId]
    );
  }

  /**
   * Store MFA challenge
   */
  private async storeMFAChallenge(tenantId: string, userId: number, challenge: any): Promise<void> {
    try {
      const pool = await dbManager.getPool(tenantId);
      
      await pool.query(
        `INSERT INTO mfa_challenges 
         (id, user_id, tenant_id, type, code, expires_at, verified, attempts, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, 0, NOW())`,
        [challenge.id, userId, tenantId, challenge.type, challenge.code, challenge.expiresAt]
      );
    } catch (error) {
      console.error('Error storing MFA challenge:', error);
      throw error;
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      codes.push(this.generateVerificationCode(this.BACKUP_CODE_LENGTH));
    }
    return codes;
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(length: number): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash code for storage
   */
  private async hashCode(code: string): Promise<string> {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Hash code synchronously
   */
  private hashCodeSync(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 2)}***${phone.substring(phone.length - 2)}`;
  }

  /**
   * Mask email for logging
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.substring(0, 2)}***@${domain}`;
  }

  /**
   * Send SMS (implement with your SMS provider)
   */
  private async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Implement with your SMS provider (Twilio, AWS SNS, etc.)
      console.log(`SMS to ${this.maskPhoneNumber(phoneNumber)}: ${message}`);
      
      // For demo purposes, always return true
      // In production, implement actual SMS sending
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Cleanup expired challenges and trusted devices
   */
  async cleanup(): Promise<void> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      
      // Cleanup expired challenges
      await pool.query('DELETE FROM mfa_challenges WHERE expires_at <= NOW()');
      
      // Cleanup expired trusted devices
      await pool.query('DELETE FROM trusted_devices WHERE expires_at <= NOW()');
      
      console.log('🧹 MFA cleanup completed');
    } catch (error) {
      console.error('Error during MFA cleanup:', error);
    }
  }
}

export const mfaService = new MFAService(); 