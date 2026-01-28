const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Creates structured logging for security events and audit trails
 */

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for masking sensitive data
const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = ['password', 'ssn', 'cardNumber', 'cvv', 'pin'];
  
  if (info.meta) {
    sensitiveFields.forEach(field => {
      if (info.meta[field]) {
        info.meta[field] = '***MASKED***';
      }
    });
  }
  
  return info;
});

// Logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    maskSensitiveData(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'banking-portal' },
  transports: [
    // Write all logs to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Write security events to security.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
