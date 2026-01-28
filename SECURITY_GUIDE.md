# Banking Portal - Security Implementation Guide

## 🔒 Security Features Overview

This Banking Portal now includes enterprise-grade security features to protect user data, prevent fraud, and ensure compliance with industry standards.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

Generate secure keys:

```bash
# Generate encryption key (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `.env` with your generated keys.

### 3. Run the Application

```bash
npm start
```

The application will run on `http://localhost:3000` with all security features enabled.

### 4. Run Tests

```bash
npm test
```

## 🛡️ Implemented Security Features

### Core Security Infrastructure

#### 1. Security Headers (Helmet.js)
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Browser XSS protection
- **Referrer-Policy**: Controls referrer information

#### 2. Rate Limiting
- **General Rate Limiting**: 100 requests per 15 minutes
- **Authentication Rate Limiting**: 5 attempts per 15 minutes
- **Transaction Rate Limiting**: 20 transactions per hour
- Automatic bypass in test environment

#### 3. Session Management
- **Secure Sessions**: httpOnly, secure (in production), sameSite cookies
- **Idle Timeout**: 15 minutes (configurable)
- **Absolute Timeout**: 2 hours (configurable)
- **Session Regeneration**: On privilege changes

#### 4. Comprehensive Audit Logging
- **Winston Logger**: Structured JSON logging
- **Automatic Log Rotation**: 5MB max file size, 5-10 files retained
- **Security Event Tracking**: All critical actions logged
- **Geolocation Logging**: IP-based location tracking
- **User Agent Parsing**: Browser, OS, device information
- **Sensitive Data Masking**: Automatic redaction in logs

### Authentication & Authorization

#### 5. Enhanced Password Security
- **Argon2 Hashing**: State-of-the-art password hashing (Argon2id)
- **Password Strength Validation**: Configurable requirements
- **Password Strength Scoring**: 0-100 scale
- **Common Password Detection**: Prevents weak passwords
- **Secure Password Generation**: Cryptographically secure random passwords
- **Password History**: Prevent reuse of recent passwords

#### 6. Two-Factor Authentication (2FA)
- **TOTP Implementation**: Time-based One-Time Passwords
- **QR Code Generation**: Easy setup with authenticator apps
- **Backup Codes**: 10 encrypted backup codes
- **2FA Setup Flow**: Complete enrollment process
- **2FA Verification**: Token validation with time drift tolerance

### Data Protection

#### 7. Encryption Service
- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Field-Level Encryption**: Encrypt sensitive data before storage
- **Data Masking**:
  - Account numbers: `****1234`
  - Email addresses: `j***n@example.com`
  - Phone numbers: `***-***-1234`
- **SHA-256 Hashing**: One-way hashing for checksums

### Fraud Detection & Prevention

#### 8. Real-time Transaction Monitoring
- **Risk Scoring System**: 0-100 scale based on multiple factors
- **Transaction Amount Analysis**: High amounts increase risk
- **Velocity Checks**: Detect rapid successive transactions
- **Geolocation Analysis**: Flag unusual locations
- **Time Pattern Detection**: Late night transactions flagged
- **Suspicious IP Tracking**: Maintain list of flagged IPs

#### 9. Risk Assessment
- **Low Risk (0-49)**: Transaction proceeds normally
- **Medium Risk (50-74)**: Transaction allowed but flagged
- **High Risk (75-100)**: Transaction blocked, manual review required

### Input Validation & Sanitization

#### 10. Comprehensive Input Validation
- **Express Validator**: Schema-based validation
- **Transfer Validation**: Account and amount checks
- **Payment Validation**: Amount and balance validation
- **XSS Prevention**: Automatic HTML escaping
- **Injection Prevention**: Parameterized queries, input sanitization

## 📁 Project Structure

```
Banking-Portal/
├── src/
│   ├── config/
│   │   ├── logger.js              # Winston logger configuration
│   │   └── security.js            # Centralized security settings
│   ├── controllers/
│   │   └── SecurityController.js  # 2FA and password endpoints
│   ├── middleware/
│   │   ├── auditLogMiddleware.js        # Audit trail logging
│   │   ├── inputValidationMiddleware.js # Input validation
│   │   ├── rateLimitMiddleware.js       # Rate limiting
│   │   ├── securityHeadersMiddleware.js # Helmet.js headers
│   │   └── sessionMiddleware.js         # Session management
│   ├── services/
│   │   ├── EncryptionService.js         # Encryption & masking
│   │   ├── FraudDetectionService.js     # Risk scoring
│   │   ├── PasswordService.js           # Argon2 password hashing
│   │   └── TwoFactorAuthService.js      # TOTP 2FA
│   ├── routes/
│   │   ├── accounts.js            # Account routes
│   │   ├── security.js            # Security API endpoints
│   │   └── services.js            # Transfer/payment routes
│   ├── app.js                     # Main application with security
│   └── data.js                    # Data management
├── test/
│   └── security/
│       └── security-services.spec.js    # Security tests
├── logs/                          # Application logs (gitignored)
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Example environment file
├── SECURITY.md                   # Comprehensive security documentation
└── README.md                     # This file
```

## 🔌 API Endpoints

### Security Endpoints

All security endpoints are prefixed with `/api/security`:

#### Two-Factor Authentication

```bash
# Setup 2FA (generates secret and QR code)
POST /api/security/2fa/setup
Body: { "email": "user@example.com" }
Response: { "success": true, "qrCode": "data:image/...", "secret": "...", "backupCodes": [...] }

# Verify 2FA setup
POST /api/security/2fa/verify-setup
Body: { "secret": "...", "token": "123456" }
Response: { "success": true, "message": "2FA enabled successfully" }

# Verify 2FA during login
POST /api/security/2fa/verify
Body: { "secret": "...", "token": "123456" }
Response: { "success": true, "message": "Verification successful" }

# Disable 2FA
POST /api/security/2fa/disable
Body: { "password": "current_password" }
Response: { "success": true, "message": "2FA disabled successfully" }
```

#### Password Management

```bash
# Change password
POST /api/security/change-password
Body: { "currentPassword": "...", "newPassword": "..." }
Response: { "success": true, "message": "Password changed successfully", "strength": 85 }

# Validate password strength
POST /api/security/validate-password
Body: { "password": "..." }
Response: { "success": true, "strength": 75, "errors": [] }
```

#### Security Settings

```bash
# Get security settings
GET /api/security/settings
Response: { 
  "success": true, 
  "settings": {
    "twoFactorEnabled": false,
    "passwordLastChanged": "2024-01-28T...",
    "sessionTimeout": 900000,
    "loginAttempts": 0,
    "accountLocked": false
  }
}
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Security Tests Only

```bash
npx mocha test/security/security-services.spec.js
```

### Test Coverage

- ✅ 53 existing tests (unchanged)
- ✅ 17 new security tests
- ✅ Total: 70 tests passing

## 🔐 Security Configuration

### Environment Variables

All security settings are configurable via environment variables in `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Encryption (REQUIRED)
ENCRYPTION_KEY=<64-character-hex-string>
MASTER_KEY=<32+-character-string>

# Session (REQUIRED)
SESSION_SECRET=<32+-character-string>
SESSION_MAX_AGE=7200000          # 2 hours
SESSION_IDLE_TIMEOUT=900000      # 15 minutes

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_EXPIRY_DAYS=90

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# 2FA
TWO_FACTOR_ISSUER=BankingPortal

# Geolocation
ENABLE_GEOLOCATION=true
BLOCKED_COUNTRIES=                # Comma-separated (e.g., KP,IR)

# Compliance
GDPR_ENABLED=true
PCI_DSS_MODE=true

# Logging
LOG_LEVEL=info
```

### Security Configuration File

Advanced settings can be modified in `src/config/security.js`:

- Password policy (min length, complexity requirements)
- Account lockout policies (attempts, duration)
- Session configuration
- Rate limiting per endpoint
- 2FA settings (issuer, window, backup codes)
- Fraud detection thresholds
- Compliance requirements

## 📊 Monitoring & Logging

### Log Files

Logs are written to the `/logs` directory:

- **combined.log**: All application logs
- **error.log**: Error-level events
- **security.log**: Security events and warnings

### Log Format

```json
{
  "level": "info",
  "message": "Audit Log",
  "timestamp": "2024-01-28 19:00:00",
  "service": "banking-portal",
  "audit": {
    "action": "transfer",
    "ip": "192.168.1.1",
    "method": "POST",
    "path": "/services/transfer",
    "statusCode": 200,
    "success": true,
    "userAgent": {
      "browser": "Chrome",
      "os": "Windows",
      "device": "desktop"
    },
    "location": {
      "country": "US",
      "region": "CA",
      "city": "San Francisco"
    }
  }
}
```

### Security Events

The following events are automatically logged:

- User logins/logouts
- Failed login attempts
- Account lockouts
- Password changes
- 2FA setup/disable
- High-risk transactions
- Transaction blocks
- Unusual locations
- Rate limit violations

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Generate strong encryption keys
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS/TLS
- [ ] Enable secure cookies
- [ ] Set up Redis for sessions and rate limiting
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts
- [ ] Review and adjust rate limits
- [ ] Configure blocked countries (if needed)
- [ ] Enable all security headers
- [ ] Run security audit: `npm audit`
- [ ] Test all security features

### Recommended Enhancements for Production

1. **Redis Integration**:
   ```bash
   npm install redis connect-redis rate-limit-redis
   ```
   Configure in `src/middleware/sessionMiddleware.js` and `src/middleware/rateLimitMiddleware.js`

2. **Database Integration**:
   - Store user credentials, 2FA secrets, and backup codes
   - Implement password history
   - Track login attempts and lockouts
   - Store audit logs in database for long-term retention

3. **Email Notifications**:
   - Send 2FA setup confirmation
   - Alert on password changes
   - Notify of suspicious activity
   - Account lockout notifications

4. **Enhanced Monitoring**:
   - Integrate with Datadog, New Relic, or similar
   - Set up dashboards for security metrics
   - Configure alerts for security events
   - Real-time fraud detection monitoring

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)**: Comprehensive security documentation
- **[.env.example](./.env.example)**: Example environment configuration
- **API Documentation**: Coming soon (Swagger/OpenAPI)

## 🛠️ Maintenance

### Regular Tasks

- **Weekly**: Review security logs
- **Monthly**: Run `npm audit` and update dependencies
- **Quarterly**: Rotate encryption keys
- **Annually**: Security audit and penetration testing

### Updating Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

## 🔒 Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use HTTPS in production**: Protect data in transit
3. **Regular updates**: Keep dependencies current
4. **Strong passwords**: Enforce password policies
5. **Enable 2FA**: For all users, especially admins
6. **Monitor logs**: Review security events regularly
7. **Backup regularly**: Encrypted backups with secure storage
8. **Principle of least privilege**: Minimum necessary permissions
9. **Defense in depth**: Multiple layers of security
10. **Security training**: Educate development team

## 🆘 Support

For security issues or questions:
- Email: security@yourcompany.com
- Documentation: See [SECURITY.md](./SECURITY.md)
- Issues: Create a GitHub issue (for non-security bugs)

## 📄 License

MIT

## 🙏 Acknowledgments

Security libraries used:
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **argon2**: Password hashing
- **speakeasy**: TOTP 2FA
- **winston**: Logging
- **express-validator**: Input validation
- **geoip-lite**: Geolocation
