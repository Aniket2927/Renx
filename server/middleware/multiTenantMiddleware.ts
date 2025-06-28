import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RBACService } from '../services/rbacService';
import { auditService } from '../services/auditService';
import { TenantContext, User } from '../types/enhanced-types';
import { z } from 'zod';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
      user?: User;
      tenantId?: string;
      userId?: number;
      auth?: {
        tenantId: string;
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}

const rbacService = new RBACService();

interface TenantError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Multi-Tenant Authentication Middleware
 * 
 * Validates JWT tokens and extracts tenant/user information
 */
export const authenticateMultiTenant = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No valid authorization token provided'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'renx-jwt-secret';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      if (!decoded.tenantId || !decoded.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token missing required tenant or user information'
          }
        });
        return;
      }

      // Set auth context
      req.auth = {
        tenantId: decoded.tenantId,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user'
      };

      req.tenantId = decoded.tenantId;
      req.userId = decoded.userId;

      // Create tenant context
      const tenantContext = await rbacService.createTenantContext(decoded.tenantId, decoded.userId);
      
      if (!tenantContext) {
        // Handle demo mode - create mock tenant context
        if (process.env.NODE_ENV !== 'production' && decoded.tenantId === 'demo_tenant') {
          req.tenantContext = {
            tenantId: 'demo_tenant',
            tenantName: 'Demo Trading Firm',
            user: {
              id: decoded.userId,
              username: 'demo',
              email: decoded.email,
              firstName: 'Demo',
              lastName: 'User',
              role: decoded.role,
              permissions: [],
              status: 'active',
              tenantId: decoded.tenantId,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            permissions: [{
              id: 'all-access',
              name: 'all:*',
              description: 'Full access to all resources',
              resource: '*',
              action: '*'
            }]
          };

          req.user = {
            id: decoded.userId.toString(),
            email: decoded.email,
            firstName: 'Demo',
            lastName: 'User',
            emailVerified: true,
            role: decoded.role,
            status: 'active',
            profileImageUrl: undefined,
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              theme: 'dark',
              notifications: {
                email: true,
                push: true,
                trading: true,
                news: true
              },
              trading: {
                defaultOrderType: 'limit',
                confirmOrders: true,
                riskLevel: 'medium'
              }
            }
          };
        } else {
          res.status(403).json({
            success: false,
            error: {
              code: 'TENANT_ACCESS_DENIED',
              message: 'User does not have access to this tenant'
            }
          });
          return;
        }
      } else {
        req.tenantContext = tenantContext;
        req.user = await rbacService.getUser(decoded.tenantId, decoded.userId) || undefined;
      }

      // Log the request for audit (skip for demo mode)
      if (!(process.env.NODE_ENV !== 'production' && decoded.tenantId === 'demo_tenant')) {
        await auditService.log({
          tenantId: decoded.tenantId,
          userId: decoded.userId,
          action: 'api_access',
          resource: req.path,
          details: {
            method: req.method,
            path: req.path,
            query: req.query
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'low'
        });
      }

      next();
    } catch {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal authentication error'
      }
    });
  }
};

/**
 * Role-Based Authorization Middleware Factory
 * 
 * Creates middleware that checks if user has required roles
 */
export const requireRoles = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth || !req.tenantContext) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const userRole = req.auth.role;
      
      if (!roles.includes(userRole)) {
        await auditService.logSecurityEvent({
          type: 'permission_change',
          tenantId: req.auth.tenantId,
          userId: req.auth.userId.toString(),
          details: {
            requiredRoles: roles,
            userRole: userRole,
            resource: req.path
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          severity: 'medium'
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Required roles: ${roles.join(', ')}`
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal authorization error'
        }
      });
    }
  };
};

/**
 * Permission-Based Authorization Middleware Factory
 * 
 * Creates middleware that checks if user has required permissions
 */
export const requirePermissions = (permissions: Array<{ resource: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth || !req.tenantContext) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      for (const permission of permissions) {
        const hasPermission = await rbacService.hasPermission(
          req.auth.tenantId,
          req.auth.userId,
          permission.resource,
          permission.action
        );

        if (!hasPermission) {
          await auditService.logSecurityEvent({
            type: 'permission_change',
            tenantId: req.auth.tenantId,
            userId: req.auth.userId.toString(),
            details: {
              requiredPermission: permission,
              resource: req.path
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'medium'
          });

          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `Missing permission: ${permission.action} on ${permission.resource}`
            }
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal authorization error'
        }
      });
    }
  };
};

/**
 * Admin Only Middleware
 * 
 * Ensures only admin or super_admin users can access the endpoint
 */
export const requireAdmin = requireRoles(['admin', 'super_admin']);

/**
 * Super Admin Only Middleware
 * 
 * Ensures only super_admin users can access the endpoint
 */
export const requireSuperAdmin = requireRoles(['super_admin']);

/**
 * Tenant Isolation Middleware
 * 
 * Ensures requests are properly isolated to the authenticated tenant
 */
export const ensureTenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.auth?.tenantId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Tenant context required'
        }
      });
      return;
    }

    // Add tenant ID to query parameters for database queries
    req.query.tenantId = req.auth.tenantId;

    // Ensure any body data includes tenant context
    if (req.body && typeof req.body === 'object') {
      req.body.tenantId = req.auth.tenantId;
      req.body.userId = req.auth.userId;
    }

    next();
  } catch (error) {
    console.error('Tenant isolation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal tenant isolation error'
      }
    });
  }
};

/**
 * Request Logging Middleware
 * 
 * Logs requests with tenant context for audit purposes
 */
export const logTenantRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const startTime = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      
      if (req.auth) {
        await auditService.log({
          tenantId: req.auth.tenantId,
          userId: req.auth.userId.toString(),
          action: 'api_request',
          resource: req.path,
          details: {
            method: req.method,
            statusCode: res.statusCode,
            duration: duration,
            userAgent: req.get('User-Agent')
          },
          ipAddress: req.ip,
          severity: res.statusCode >= 400 ? 'medium' : 'low'
        });
      }
    });

    next();
  } catch (error) {
    console.error('Request logging error:', error);
    next(); // Don't block the request for logging errors
  }
};

/**
 * Rate Limiting Middleware Factory
 * 
 * Creates tenant-aware rate limiting middleware
 */
export const createTenantRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.auth?.tenantId) {
        next();
        return;
      }

      const tenantId = req.auth.tenantId;
      const now = Date.now();
      const key = `${tenantId}:${req.ip}`;

      let requestData = requestCounts.get(key);

      if (!requestData || now > requestData.resetTime) {
        requestData = {
          count: 0,
          resetTime: now + options.windowMs
        };
        requestCounts.set(key, requestData);
      }

      requestData.count++;

      if (requestData.count > options.maxRequests) {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests'
          }
        });
        return;
      }

      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - requestData.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000).toString());

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Don't block requests for rate limiting errors
    }
  };
};

/**
 * Validation Middleware Factory
 * 
 * Creates middleware for request validation with tenant context
 */
export const validateTenantRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: result.error.errors
          }
        });
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal validation error'
        }
      });
    }
  };
};

/**
 * Error Handler Middleware
 * 
 * Handles errors with tenant context
 */
export const handleTenantError = (
  error: TenantError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Tenant middleware error:', error);

  // Log security events for certain error types
  if (req.auth && (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')) {
    auditService.logSecurityEvent({
      type: 'suspicious_activity',
      tenantId: req.auth.tenantId,
      userId: req.auth.userId.toString(),
      details: {
        error: error.message,
        path: req.path,
        method: req.method
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high'
    }).catch(console.error);
  }

  if (error.statusCode) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An error occurred'
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Additional exports for backward compatibility
export const requireAuth = authenticateMultiTenant;
export const requireRole = (role: string) => requireRoles([role]); 
