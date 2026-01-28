const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per IP
 */

// Skip rate limiting in test environment
const skipInTest = process.env.NODE_ENV === 'test';

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: securityConfig.rateLimit.message,
  standardHeaders: securityConfig.rateLimit.standardHeaders,
  legacyHeaders: securityConfig.rateLimit.legacyHeaders,
  skip: () => skipInTest,
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: () => skipInTest,
});

// Limiter for transfer/payment operations
const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 transactions per hour
  message: 'Transaction limit exceeded, please try again later.',
  skip: () => skipInTest,
});

module.exports = {
  generalLimiter,
  authLimiter,
  transactionLimiter,
};
