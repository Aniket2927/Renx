import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { dbManager } from '../db';
import { rbacService } from '../services/rbacService';
import { AuthRequest, AuthResponse, TokenResponse, EnhancedUser } from '../types/enhanced-types';

/**
 * Enhanced Authentication Controller
 * 
 * Handles multi-tenant authentication with RBAC support
 */
export class AuthController {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'renx-jwt-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  /**
   * Multi-tenant user login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      let { tenantId, email, password }: AuthRequest = req.body;

      // Default to demo_tenant if no tenant specified (for testing)
      if (!tenantId) {
        tenantId = 'demo_tenant';
      }

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate tenant exists and is active
      const pool = await dbManager.getPool();
      const tenantResult = await pool.query(
        'SELECT status FROM tenants WHERE id = $1 AND active = true',
        [tenantId]
      );

      if (tenantResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (tenantResult.rows[0].status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Tenant is not active',
          code: 'TENANT_INACTIVE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Find user in tenant schema
      const userPool = await dbManager.getPool(tenantId);
      const userResult = await userPool.query(
        `SELECT id, username, email, password, first_name, last_name, role, status, last_login 
         FROM users WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
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
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update last login
      await userPool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Get user permissions
      const permissions = await rbacService.getUserPermissions(tenantId, user.id);

      // Generate tokens
      const accessToken = this.generateAccessToken(tenantId, user.id, user.role);
      const refreshToken = this.generateRefreshToken(tenantId, user.id);

      // Store refresh token (in production, use Redis or database)
      await this.storeRefreshToken(tenantId, user.id, refreshToken);

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
          accessToken,
          refreshToken,
          expiresIn: this.parseExpirationTime(this.JWT_EXPIRES_IN)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal authentication error',
        code: 'AUTH_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Register new user (Admin only)
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, firstName, lastName, role = 'user' } = req.body;
      const tenantId = req.tenantId!;
      const currentUserId = req.userId!;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required',
          code: 'MISSING_REQUIRED_FIELDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user has permission to create users
      const hasPermission = await rbacService.hasPermission(
        tenantId,
        currentUserId,
        'users',
        'create'
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create users',
          code: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user already exists
      const userPool = await dbManager.getPool(tenantId);
      const existingUser = await userPool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'User with this email or username already exists',
          code: 'USER_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const result = await userPool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, status, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, username, email, first_name, last_name, role, status, created_at`,
        [username, email, hashedPassword, firstName, lastName, role, 'active', tenantId]
      );

      const newUser = result.rows[0];

      // Get permissions for the new user
      const permissions = await rbacService.getUserPermissions(tenantId, newUser.id);

      const enhancedUser: EnhancedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        permissions,
        status: newUser.status,
        tenantId,
        isActive: newUser.status === 'active',
        createdAt: newUser.created_at.toISOString(),
        updatedAt: newUser.created_at.toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: enhancedUser,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        code: 'REGISTRATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Public user signup (for new user registration)
   */
  async publicSignup(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, username, email, password, firstName, lastName } = req.body;

      if (!tenantId || !username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID, username, email, and password are required',
          code: 'MISSING_REQUIRED_FIELDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate tenant exists and is active
      const pool = await dbManager.getPool();
      const tenantResult = await pool.query(
        'SELECT status FROM tenants WHERE id = $1 AND active = true',
        [tenantId]
      );

      if (tenantResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (tenantResult.rows[0].status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Tenant is not active',
          code: 'TENANT_INACTIVE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user already exists
      const userPool = await dbManager.getPool(tenantId);
      const existingUser = await userPool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'User with this email or username already exists',
          code: 'USER_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with 'user' role by default
      const result = await userPool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, status, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, username, email, first_name, last_name, role, status, created_at`,
        [username, email, hashedPassword, firstName, lastName, 'user', 'active', tenantId]
      );

      const newUser = result.rows[0];

      // Get permissions for the new user
      const permissions = await rbacService.getUserPermissions(tenantId, newUser.id);

      // Generate tokens for immediate login
      const accessToken = this.generateAccessToken(tenantId, newUser.id, newUser.role);
      const refreshToken = this.generateRefreshToken(tenantId, newUser.id);

      // Store refresh token
      await this.storeRefreshToken(tenantId, newUser.id, refreshToken);

      const enhancedUser: EnhancedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        permissions,
        status: newUser.status,
        tenantId,
        isActive: newUser.status === 'active',
        createdAt: newUser.created_at.toISOString(),
        updatedAt: newUser.created_at.toISOString()
      };

      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: enhancedUser,
          accessToken,
          refreshToken,
          expiresIn: this.parseExpirationTime(this.JWT_EXPIRES_IN)
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Public signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        code: 'SIGNUP_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Refresh access token
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

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, this.JWT_SECRET);
      } catch {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { tenantId, userId, type } = decoded;

      if (type !== 'refresh') {
        res.status(401).json({
          success: false,
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate token is stored (check against database/Redis)
      const isValidToken = await this.validateRefreshToken(tenantId, userId, refreshToken);
      if (!isValidToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get user information
      const userPool = await dbManager.getPool(tenantId);
      const userResult = await userPool.query(
        'SELECT id, role, status FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0 || userResult.rows[0].status !== 'active') {
        res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = userResult.rows[0];

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(tenantId, userId, user.role);
      const newRefreshToken = this.generateRefreshToken(tenantId, userId);

      // Store new refresh token and invalidate old one
      await this.replaceRefreshToken(tenantId, userId, refreshToken, newRefreshToken);

      const response: TokenResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: this.parseExpirationTime(this.JWT_EXPIRES_IN)
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
   * Get current user information
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const pool = await dbManager.getPool();
      const userResult = await pool.query(
        'SELECT id, username, email, first_name, last_name, role, status, last_login FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = userResult.rows[0];

             const enhancedUser: EnhancedUser = {
         id: user.id,
         username: user.username,
         email: user.email,
         firstName: user.first_name,
         lastName: user.last_name,
         role: user.role,
         status: user.status,
         tenantId,
         isActive: user.status === 'active',
         lastLoginAt: user.last_login?.toISOString(),
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         permissions: [] // Add default empty permissions array
       };

      res.json({
        success: true,
        message: 'User information retrieved successfully',
        data: enhancedUser,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
        code: 'USER_INFO_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      if (refreshToken) {
        // Invalidate refresh token
        await this.revokeRefreshToken(tenantId, userId, refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
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
   * Change user password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
          code: 'MISSING_PASSWORDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get current user
      const pool = await dbManager.getPool(tenantId);
      const userResult = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);
      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      // Revoke all refresh tokens for this user
      await this.revokeAllRefreshTokens(tenantId, userId);

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate access token
   */
  private generateAccessToken(tenantId: string, userId: number, role: string): string {
    return jwt.sign(
      { tenantId, userId, role, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(tenantId: string, userId: number): string {
    return jwt.sign(
      { tenantId, userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );
  }

  /**
   * Store refresh token (simplified - in production use Redis)
   */
  private async storeRefreshToken(tenantId: string, userId: number, _token: string): Promise<void> {
    // For now, store in memory or database
    // In production, use Redis with expiration
    console.log(`Storing refresh token for ${tenantId}:${userId}`);
  }

  /**
   * Validate refresh token
   */
  private async validateRefreshToken(_tenantId: string, _userId: number, _token: string): Promise<boolean> {
    // For now, assume valid if JWT verification passed
    // In production, check against Redis/database
    return true;
  }

  /**
   * Replace refresh token
   */
  private async replaceRefreshToken(
    tenantId: string,
    userId: number,
    oldToken: string,
    newToken: string
  ): Promise<void> {
    // Remove old token and store new one
    await this.revokeRefreshToken(tenantId, userId, oldToken);
    await this.storeRefreshToken(tenantId, userId, newToken);
  }

  /**
   * Revoke refresh token
   */
  private async revokeRefreshToken(tenantId: string, userId: number, _token: string): Promise<void> {
    // Remove token from storage
    console.log(`Revoking refresh token for ${tenantId}:${userId}`);
  }

  /**
   * Revoke all refresh tokens for user
   */
  private async revokeAllRefreshTokens(tenantId: string, userId: number): Promise<void> {
    // Remove all tokens for user
    console.log(`Revoking all refresh tokens for ${tenantId}:${userId}`);
  }

  /**
   * Parse expiration time to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 60 * 60;
      case 'd': return num * 60 * 60 * 24;
      default: return 3600;
    }
  }
}

// Export controller instance
export const authController = new AuthController(); 