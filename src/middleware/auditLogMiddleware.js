const logger = require('../config/logger');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Audit Logging Middleware
 * Captures comprehensive audit trail for all critical actions
 */

const auditLogMiddleware = (action) => {
  return (req, res, next) => {
    // Capture request details (with fallbacks for test environment)
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    const geo = geoip.lookup(ip);
    const userAgentString = req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : '';
    const parser = new UAParser(userAgentString);
    const userAgent = parser.getResult();

    // Store audit info in request for later use
    req.auditInfo = {
      action,
      ip,
      timestamp: new Date().toISOString(),
      userAgent: {
        browser: userAgent.browser.name,
        os: userAgent.os.name,
        device: userAgent.device.type || 'desktop',
      },
      location: geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
      } : null,
    };

    // Intercept response to log after completion
    const originalSend = res.send;
    res.send = function (data) {
      res.send = originalSend;

      // Log the audit event
      const auditLog = {
        ...req.auditInfo,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
      };

      // Add request body for certain actions (excluding sensitive data)
      if (['transfer', 'payment'].includes(action)) {
        auditLog.requestData = {
          from: req.body && req.body.from,
          to: req.body && req.body.to,
          amount: req.body && req.body.amount ? '***' : undefined, // Mask actual amount
        };
      }

      logger.info('Audit Log', { audit: auditLog });

      return res.send(data);
    };

    next();
  };
};

// Log security events
const logSecurityEvent = (event, severity = 'warn', details = {}) => {
  logger.log(severity, `Security Event: ${event}`, {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

module.exports = {
  auditLogMiddleware,
  logSecurityEvent,
};
