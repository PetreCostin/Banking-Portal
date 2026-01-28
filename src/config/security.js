require('dotenv').config();

module.exports = {
  // Security Headers Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: parseInt(process.env.PASSWORD_EXPIRY_DAYS) || 90,
    historyCount: 5, // Prevent reuse of last 5 passwords
  },

  // Account Lockout
  accountLockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: (parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15) * 60 * 1000,
    progressiveLockout: [5, 15, 60, 1440], // minutes: 5min, 15min, 1hr, 24hr
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 7200000, // 2 hours
    idleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT) || 900000, // 15 minutes
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // 2FA Configuration
  twoFactor: {
    issuer: process.env.TWO_FACTOR_ISSUER || 'BankingPortal',
    window: 2, // Allow 2 windows of time drift
    backupCodesCount: 10,
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
    masterKey: process.env.MASTER_KEY,
  },

  // Geolocation
  geolocation: {
    enabled: process.env.ENABLE_GEOLOCATION === 'true',
    blockedCountries: (process.env.BLOCKED_COUNTRIES || '').split(',').filter(Boolean),
  },

  // Compliance
  compliance: {
    gdpr: process.env.GDPR_ENABLED === 'true',
    pciDss: process.env.PCI_DSS_MODE === 'true',
    logRetentionDays: 2555, // ~7 years for financial data
  },

  // Fraud Detection
  fraudDetection: {
    highRiskThreshold: 75,
    mediumRiskThreshold: 50,
    transactionAmountThreshold: 10000,
    velocityCheckWindow: 3600000, // 1 hour
    maxTransactionsPerHour: 10,
  },
};
