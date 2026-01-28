import dotenv from 'dotenv';

dotenv.config();

// Validate critical security settings in production
if (process.env.NODE_ENV === 'production') {
  const defaultSecrets = ['default-secret-change-this', 'default-refresh-secret'];
  const jwtSecret = process.env.JWT_SECRET || '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
  
  if (defaultSecrets.includes(jwtSecret) || defaultSecrets.includes(refreshSecret)) {
    throw new Error(
      'SECURITY ERROR: Default JWT secrets detected in production environment. ' +
      'Please set JWT_SECRET and JWT_REFRESH_SECRET environment variables to secure values.'
    );
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expire: (process.env.JWT_EXPIRE || '15m') as string,
    refreshExpire: (process.env.JWT_REFRESH_EXPIRE || '7d') as string,
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutTime: parseInt(process.env.LOCKOUT_TIME || '1800000', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@bankingportal.com',
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
};
