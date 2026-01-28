const helmet = require('helmet');
const securityConfig = require('../config/security');

/**
 * Security Headers Middleware
 * Implements comprehensive security headers using Helmet.js
 */
const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: securityConfig.helmet.contentSecurityPolicy,
  hsts: securityConfig.helmet.hsts,
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

module.exports = securityHeadersMiddleware;
