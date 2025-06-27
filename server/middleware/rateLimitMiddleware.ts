import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// General rate limiting for trading routes
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000 // 15 minutes in milliseconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    });
  }
});

// Specific rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: 60 * 1000 // 1 minute in milliseconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded, please try again later.',
      retryAfter: 60 * 1000
    });
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000 // 15 minutes in milliseconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    });
  }
});

// Custom rate limiting middleware for trading operations
export const tradingRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 trading requests per minute
  message: {
    error: 'Trading rate limit exceeded, please try again later.',
    retryAfter: 60 * 1000 // 1 minute in milliseconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Trading rate limit exceeded, please try again later.',
      retryAfter: 60 * 1000
    });
  }
});

// Export default as the general rate limit middleware
export default rateLimitMiddleware; 