const session = require('express-session');
const securityConfig = require('../config/security');

/**
 * Session Management Middleware
 * Configures secure session handling with timeouts and security options
 */

const sessionMiddleware = session({
  secret: securityConfig.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...securityConfig.session.cookie,
    maxAge: securityConfig.session.maxAge,
  },
  name: 'sessionId', // Don't use default 'connect.sid' 
  rolling: true, // Reset expiration on every response
});

/**
 * Session timeout middleware
 * Tracks idle time and enforces session timeout
 */
const sessionTimeoutMiddleware = (req, res, next) => {
  if (req.session) {
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    const idleTime = now - lastActivity;

    // Check if session has been idle too long
    if (idleTime > securityConfig.session.idleTimeout) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
      return res.redirect('/?timeout=true');
    }

    // Update last activity time
    req.session.lastActivity = now;
  }
  next();
};

module.exports = {
  sessionMiddleware,
  sessionTimeoutMiddleware,
};
