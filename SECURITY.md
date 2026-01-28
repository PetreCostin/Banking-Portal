# Security Documentation

## Overview

This Banking Portal application implements comprehensive enterprise-grade security features to protect user data and prevent fraud. This document outlines all security measures implemented and best practices for maintaining security.

## Table of Contents

1. [Security Headers](#security-headers)
2. [Authentication & Authorization](#authentication--authorization)
3. [Rate Limiting](#rate-limiting)
4. [Session Management](#session-management)
5. [Data Protection & Encryption](#data-protection--encryption)
6. [Fraud Detection](#fraud-detection)
7. [Audit Logging](#audit-logging)
8. [Input Validation](#input-validation)
9. [Security Configuration](#security-configuration)
10. [Best Practices](#best-practices)
11. [Incident Response](#incident-response)

## Security Headers

### Implemented Headers (via Helmet.js)

- **Content-Security-Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser features

### Configuration

All security headers are configured in `src/middleware/securityHeadersMiddleware.js` using industry-standard settings.

## Authentication & Authorization

### Password Security

- **Hashing Algorithm**: Argon2id (state-of-the-art password hashing)
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain uppercase, lowercase, numbers, and special characters
  - Cannot be common password
  - Password strength scoring (0-100)

### Two-Factor Authentication (2FA)

- **Method**: TOTP (Time-based One-Time Password)
- **Compatible with**: Google Authenticator, Authy, 1Password, etc.
- **Features**:
  - QR code generation for easy setup
  - Backup codes (10 codes, encrypted)
  - 2-window time drift tolerance

### Account Lockout

- **Max Failed Attempts**: 5 (configurable)
- **Lockout Duration**: Progressive (5min, 15min, 1hr, 24hr)
- **Recovery**: Email-based unlock or admin override

### Session Management

- **Session Storage**: Express-session (can be upgraded to Redis)
- **Session Duration**: 2 hours (configurable)
- **Idle Timeout**: 15 minutes (configurable)
- **Cookie Security**:
  - httpOnly: true (prevents XSS access)
  - secure: true (HTTPS only in production)
  - sameSite: 'strict' (CSRF protection)

## Rate Limiting

### General Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Applies to**: All routes

### Authentication Rate Limiting

- **Window**: 15 minutes
- **Max Attempts**: 5
- **Applies to**: Login endpoints

### Transaction Rate Limiting

- **Window**: 1 hour
- **Max Transactions**: 20
- **Applies to**: Transfer and payment operations

### Implementation

Rate limiting is automatically disabled in test environment and uses in-memory store. For production:
- Upgrade to Redis-backed rate limiting
- Configure `rate-limit-redis` adapter
- Set Redis URL in environment variables

## Session Management

### Features

- **Idle Timeout**: Automatic logout after 15 minutes of inactivity
- **Absolute Timeout**: Maximum session duration of 2 hours
- **Session Regeneration**: Session ID regenerated on privilege changes
- **Concurrent Session Control**: Can limit simultaneous sessions per user

### Implementation

Sessions are managed via `src/middleware/sessionMiddleware.js` with configurable timeouts and security options.

## Data Protection & Encryption

### Encryption Service

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Use Cases**:
  - PII data at rest
  - Sensitive configuration values
  - Backup codes for 2FA

### Data Masking

Implemented masking for:
- **Account Numbers**: Shows only last 4 digits (****1234)
- **Email Addresses**: Masked display (j***n@example.com)
- **Phone Numbers**: Shows only last 4 digits (***-***-1234)
- **Log Files**: Automatic masking of sensitive fields

### Field-Level Encryption

Sensitive data should be encrypted before database storage:
```javascript
const EncryptionService = require('./services/EncryptionService');
const encrypted = EncryptionService.encrypt(sensitiveData);
// Store encrypted.encryptedData, encrypted.iv, encrypted.authTag
```

## Fraud Detection

### Risk Scoring System

Transactions are scored based on multiple factors:
- **Transaction Amount**: Higher amounts = higher risk
- **Velocity Check**: Too many transactions in short time
- **Geolocation**: Unusual locations or blocked countries
- **Time Patterns**: Late night transactions are riskier
- **Suspicious IPs**: Previously flagged addresses

### Risk Levels

- **Low Risk (0-49)**: Transaction proceeds normally
- **Medium Risk (50-74)**: Transaction allowed but flagged for review
- **High Risk (75-100)**: Transaction blocked, manual review required

### Geolocation Features

- IP-based location detection
- Country blocking support
- VPN/Proxy detection (can be enhanced with 3rd party service)
- Unusual location alerts

## Audit Logging

### What is Logged

- All user actions (login, logout, views, transactions)
- IP address and geolocation
- User agent (browser, OS, device)
- Timestamp
- Success/failure status
- Request parameters (sensitive data masked)

### Log Storage

- **Combined Log**: All application logs
- **Error Log**: Error-level events only
- **Security Log**: Security events and warnings
- **Location**: `/logs` directory
- **Retention**: Configurable, recommend 7 years for financial data

### Log Analysis

Logs are in JSON format for easy parsing and analysis:
```json
{
  "level": "info",
  "message": "Audit Log",
  "audit": {
    "action": "transfer",
    "ip": "192.168.1.1",
    "timestamp": "2024-01-28T19:00:00.000Z",
    "success": true
  }
}
```

## Input Validation

### Validation Rules

Implemented for:
- Transfer operations (from, to, amount)
- Payment operations (amount)
- All user inputs sanitized to prevent XSS

### Validation Middleware

```javascript
const { validateTransfer, handleValidationErrors } = require('./middleware/inputValidationMiddleware');

router.post('/transfer', validateTransfer, handleValidationErrors, handler);
```

### Sanitization

- All string inputs are escaped
- HTML tags removed
- SQL injection prevention (via parameterized queries)
- NoSQL injection prevention

## Security Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Encryption Keys (Generate secure random keys)
ENCRYPTION_KEY=your-32-character-encryption-key-here
MASTER_KEY=your-master-key-for-key-encryption

# Session Secret (at least 32 characters)
SESSION_SECRET=your-session-secret-at-least-32-chars

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_EXPIRY_DAYS=90

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Geolocation
ENABLE_GEOLOCATION=true
BLOCKED_COUNTRIES=  # Comma-separated country codes

# Compliance
GDPR_ENABLED=true
PCI_DSS_MODE=true
```

### Generating Secure Keys

```bash
# Generate encryption key (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Best Practices

### Development

1. **Never commit secrets**: Use environment variables
2. **Use HTTPS in production**: Enable secure cookies
3. **Regular updates**: Keep dependencies up to date
4. **Security testing**: Run `npm audit` regularly
5. **Code review**: Review all security-critical code

### Production Deployment

1. **Enable all security features**:
   - Set `NODE_ENV=production`
   - Configure Redis for sessions and rate limiting
   - Enable HTTPS/TLS
   - Set strong secrets

2. **Configure monitoring**:
   - Set up log aggregation (ELK, Splunk)
   - Configure alerts for security events
   - Monitor rate limit violations

3. **Regular maintenance**:
   - Rotate encryption keys
   - Review audit logs
   - Update blocked IP list
   - Patch vulnerabilities

### User Education

1. Enforce strong passwords
2. Enable 2FA for all users
3. Educate about phishing
4. Provide security best practices guide

## Incident Response

### Detection

Security events are logged and can trigger alerts:
- Multiple failed login attempts
- High-risk transactions
- Unusual geolocation
- Rate limit violations

### Response Steps

1. **Identify**: Review security logs
2. **Contain**: Block suspicious IPs, lock accounts
3. **Investigate**: Analyze audit trail
4. **Remediate**: Fix vulnerability, notify users
5. **Document**: Record incident details
6. **Review**: Update security measures

### Emergency Contacts

Maintain a list of:
- Security team contacts
- Incident response team
- Legal/compliance team
- External security consultants

## Security Features Not Yet Implemented

The following features are designed but require additional integration:

### Ready to Enable (with minor configuration)

1. **Enhanced Middleware**: Uncomment middleware in routes to enable:
   - Per-route rate limiting
   - Input validation
   - Audit logging on specific routes
   - Fraud detection on transactions

2. **Redis Integration**: For production environments:
   - Session storage
   - Rate limiting backend
   - Distributed caching

### Requires Additional Development

1. **OAuth2 & Social Login**: Google, Facebook, Apple Sign-In
2. **WebAuthn/FIDO2**: Biometric authentication
3. **Device Fingerprinting**: Advanced device tracking
4. **IP Whitelisting**: Admin-configurable IP access control
5. **RBAC System**: Advanced role-based access control
6. **API Key Management**: For third-party integrations
7. **WAF Configuration**: Web Application Firewall setup
8. **Security Dashboard**: Real-time security monitoring UI

## Compliance

### GDPR Compliance

Implemented features:
- Audit logging for data access
- Data encryption at rest
- Configurable data retention
- Security event logging

Required additions:
- User consent management
- Data export functionality
- Right to be forgotten
- Privacy policy tracking

### PCI DSS Compliance

Implemented features:
- Encryption of sensitive data
- Audit logging
- Access controls
- Secure transmission (HTTPS)

Required additions:
- Network segmentation
- Regular security testing
- Cardholder data tokenization
- Compliance documentation

## Support & Resources

- **Security Issues**: Report to security@yourcompany.com
- **Documentation**: See `/docs` directory
- **OWASP Guidelines**: https://owasp.org/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/

## Version History

- **v1.0.0** (2024-01-28): Initial security implementation
  - Security headers
  - Rate limiting
  - Session management
  - Encryption service
  - Fraud detection
  - Audit logging
  - Password security
  - 2FA support
