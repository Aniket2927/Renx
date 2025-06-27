import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import crypto from 'crypto';
import { auditService } from '../services/auditService';
import { sessionService } from '../services/sessionService';

interface SecurityConfig {
  enableCSRF: boolean;
  enableRateLimit: boolean;
  enableSecurityHeaders: boolean;
  enableSlowDown: boolean;
  rateLimitWindows: {
    general: { windowMs: number; max: number };
    auth: { windowMs: number; max: number };
    api: { windowMs: number; max: number };
  };
}

interface CSRFToken {
  token: string;
  timestamp: number;
  sessionId?: string;
}

export class SecurityMiddleware {
  private csrfTokens: Map<string, CSRFToken> = new Map();
  private readonly CSRF_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private failedAttempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map();

  private config: SecurityConfig = {
    enableCSRF: process.env.ENABLE_CSRF !== 'false',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS !== 'false',
    enableSlowDown: process.env.ENABLE_SLOW_DOWN !== 'false',
    rateLimitWindows: {
      general: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
      auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 login attempts per 15 minutes
      api: { windowMs: 1 * 60 * 1000, max: 60 }, // 60 API calls per minute
    }
  };

  constructor() {
    // Cleanup expired CSRF tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredCSRFTokens();
    }, 5 * 60 * 1000);

    // Cleanup expired failed attempts every hour
    setInterval(() => {
      this.cleanupExpiredFailedAttempts();
    }, 60 * 60 * 1000);
  }

  /**
   * Apply comprehensive security headers
   */
  securityHeaders() {
    if (!this.config.enableSecurityHeaders) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-eval'"], // Needed for React dev
          connectSrc: ["'self'", "wss:", "ws:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * General rate limiting middleware
   */
  generalRateLimit() {
    if (!this.config.enableRateLimit) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return rateLimit({
      windowMs: this.config.rateLimitWindows.general.windowMs,
      max: this.config.rateLimitWindows.general.max,
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again later.'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: async (req: Request, res: Response) => {
        const clientIp = this.getClientIP(req);
        
        await auditService.logSecurityEvent({
          type: 'suspicious_activity',
          details: {
            reason: 'rate_limit_exceeded',
            endpoint: req.path,
            method: req.method,
            userAgent: req.get('User-Agent')
          },
          ipAddress: clientIp,
          userAgent: req.get('User-Agent'),
          severity: 'medium'
        });

        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
          }
        });
      }
    });
  }

  /**
   * Authentication rate limiting (stricter)
   */
  authRateLimit() {
    if (!this.config.enableRateLimit) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return rateLimit({
      windowMs: this.config.rateLimitWindows.auth.windowMs,
      max: this.config.rateLimitWindows.auth.max,
      skipSuccessfulRequests: true,
      message: {
        error: {
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts, please try again later.'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: async (req: Request, res: Response) => {
        const clientIp = this.getClientIP(req);
        
        await auditService.logSecurityEvent({
          type: 'suspicious_activity',
          details: {
            reason: 'auth_rate_limit_exceeded',
            endpoint: req.path,
            method: req.method,
            email: req.body?.email,
            userAgent: req.get('User-Agent')
          },
          ipAddress: clientIp,
          userAgent: req.get('User-Agent'),
          severity: 'high'
        });

        res.status(429).json({
          error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts, please try again later.'
          }
        });
      }
    });
  }

  /**
   * API rate limiting
   */
  apiRateLimit() {
    if (!this.config.enableRateLimit) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return rateLimit({
      windowMs: this.config.rateLimitWindows.api.windowMs,
      max: this.config.rateLimitWindows.api.max,
      keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise IP
        return req.auth?.userId?.toString() || this.getClientIP(req);
      },
      message: {
        error: {
          code: 'API_RATE_LIMIT_EXCEEDED',
          message: 'API rate limit exceeded, please slow down.'
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Slow down middleware for progressive delays
   */
  slowDownMiddleware() {
    if (!this.config.enableSlowDown) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // Allow 50 requests per windowMs without delay
      delayMs: 500, // Add 500ms delay per request after delayAfter
      maxDelayMs: 20000, // Maximum delay of 20 seconds
    });
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCSRF) {
        return next();
      }

      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip CSRF for API endpoints with valid JWT (they have their own protection)
      if (req.path.startsWith('/api/') && req.auth) {
        return next();
      }

      const token = req.headers['x-csrf-token'] as string || req.body._csrf;
      
      if (!token) {
        return res.status(403).json({
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF token is required'
          }
        });
      }

      if (!this.validateCSRFToken(token, req.sessionID)) {
        return res.status(403).json({
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token'
          }
        });
      }

      next();
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(sessionId?: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    
    this.csrfTokens.set(token, {
      token,
      timestamp: Date.now(),
      sessionId
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionId?: string): boolean {
    const csrfData = this.csrfTokens.get(token);
    
    if (!csrfData) {
      return false;
    }

    // Check expiration
    if (Date.now() - csrfData.timestamp > this.CSRF_TOKEN_EXPIRY) {
      this.csrfTokens.delete(token);
      return false;
    }

    // Check session ID if provided
    if (sessionId && csrfData.sessionId && csrfData.sessionId !== sessionId) {
      return false;
    }

    return true;
  }

  /**
   * Failed login attempt tracking
   */
  trackFailedAttempt() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      
      res.json = function(this: Response, body: any) {
        if (res.statusCode === 401 || res.statusCode === 403) {
          securityMiddleware.recordFailedAttempt(req);
        }
        return originalJson.call(this, body);
      };

      // Check if IP is locked out
      const clientIp = this.getClientIP(req);
      const attempts = this.failedAttempts.get(clientIp);
      
      if (attempts && attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
        
        await auditService.logSecurityEvent({
          type: 'suspicious_activity',
          details: {
            reason: 'access_attempt_while_locked',
            remainingLockoutMinutes: remainingTime,
            endpoint: req.path
          },
          ipAddress: clientIp,
          userAgent: req.get('User-Agent'),
          severity: 'high'
        });

        return res.status(429).json({
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Too many failed attempts. Try again in ${remainingTime} minutes.`
          }
        });
      }

      next();
    };
  }

  /**
   * Session security validation
   */
  sessionSecurity() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.auth || !req.sessionID) {
        return next();
      }

      try {
        // Check for suspicious activity
        const suspiciousActivity = await sessionService.detectSuspiciousActivity(
          req.sessionID,
          this.getClientIP(req),
          req.get('User-Agent') || ''
        );

        if (suspiciousActivity && suspiciousActivity.action === 'logout') {
          await sessionService.terminateSession(req.sessionID, 'suspicious_activity');
          
          return res.status(401).json({
            error: {
              code: 'SESSION_TERMINATED',
              message: suspiciousActivity.message
            }
          });
        }

        // Update session activity
        await sessionService.updateActivity(req.sessionID, req.path, {
          method: req.method,
          userAgent: req.get('User-Agent'),
          ipAddress: this.getClientIP(req)
        });

        next();
      } catch (error) {
        console.error('Session security check failed:', error);
        next();
      }
    };
  }

  /**
   * Content type validation
   */
  contentTypeValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        
        if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
          return res.status(400).json({
            error: {
              code: 'INVALID_CONTENT_TYPE',
              message: 'Content-Type must be application/json or multipart/form-data'
            }
          });
        }
      }
      
      next();
    };
  }

  /**
   * Request size limiting
   */
  requestSizeLimit() {
    return (req: Request, res: Response, next: NextFunction) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const contentLength = parseInt(req.get('Content-Length') || '0');
      
      if (contentLength > maxSize) {
        return res.status(413).json({
          error: {
            code: 'REQUEST_TOO_LARGE',
            message: 'Request size exceeds maximum allowed limit'
          }
        });
      }
      
      next();
    };
  }

  /**
   * Record failed login attempt
   */
  private recordFailedAttempt(req: Request): void {
    const clientIp = this.getClientIP(req);
    const now = Date.now();
    
    let attempts = this.failedAttempts.get(clientIp);
    
    if (!attempts) {
      attempts = { count: 0, lastAttempt: now };
    }

    attempts.count++;
    attempts.lastAttempt = now;

    if (attempts.count >= this.MAX_FAILED_ATTEMPTS) {
      attempts.lockedUntil = now + this.LOCKOUT_DURATION;
      
      auditService.logSecurityEvent({
        type: 'suspicious_activity',
        details: {
          reason: 'account_locked',
          failedAttempts: attempts.count,
          lockoutDuration: this.LOCKOUT_DURATION / 60000 // minutes
        },
        ipAddress: clientIp,
        userAgent: req.get('User-Agent'),
        severity: 'high'
      });
    }

    this.failedAttempts.set(clientIp, attempts);
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  /**
   * Cleanup expired CSRF tokens
   */
  private cleanupExpiredCSRFTokens(): void {
    const now = Date.now();
    
    for (const [token, data] of this.csrfTokens.entries()) {
      if (now - data.timestamp > this.CSRF_TOKEN_EXPIRY) {
        this.csrfTokens.delete(token);
      }
    }
  }

  /**
   * Cleanup expired failed attempts
   */
  private cleanupExpiredFailedAttempts(): void {
    const now = Date.now();
    
    for (const [ip, attempts] of this.failedAttempts.entries()) {
      if (attempts.lockedUntil && now > attempts.lockedUntil) {
        this.failedAttempts.delete(ip);
      } else if (!attempts.lockedUntil && now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
        this.failedAttempts.delete(ip);
      }
    }
  }
}

export const securityMiddleware = new SecurityMiddleware(); 