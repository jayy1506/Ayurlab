import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ayurveda_secure_jwt_secret_key_2026_x89!k';

// Helper to extract client IP reliably behind proxies
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

// Helper to extract user ID or fallback to IP for AI endpoint
const getAiUserOrIpKey = (req) => {
  // If user object is already attached by auth middleware
  if (req.user && (req.user._id || req.user.id)) {
    return `user_${req.user._id || req.user.id}`;
  }

  // Check accessToken or token cookie / header without throwing
  const token = req.cookies?.accessToken || req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.id || decoded.email)) {
        return `user_${decoded.id || decoded.email}`;
      }
    } catch (e) {}
  }

  return `ip_${getClientIp(req)}`;
};

/**
 * Strict Rate Limiter for Authentication Endpoints (login, change-password, refresh)
 * Limits brute force attacks (15 requests per 15 minutes per IP)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `auth_${getClientIp(req)}`,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    return res.status(429).json({
      error: 'TooManyRequests',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      retryAfter,
    });
  },
});

/**
 * Strict Rate Limiter for AI Tutor Endpoint (/api/ai/tutor)
 * Limits requests per User ID when logged in, else per IP (30 requests per 15 minutes)
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 queries per 15 minutes window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAiUserOrIpKey,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    return res.status(429).json({
      error: 'TooManyRequests',
      message: 'AI query limit exceeded for this time window. Please wait a few minutes before asking more questions.',
      retryAfter,
    });
  },
});

/**
 * General API Rate Limiter
 * Applied globally to /api to prevent denial of service (150 requests per 15 minutes)
 */
export const defaultRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `api_${getClientIp(req)}`,
  handler: (req, res, next, options) => {
    return res.status(429).json({
      error: 'TooManyRequests',
      message: 'Too many requests received from this client. Please slow down.',
    });
  },
});
