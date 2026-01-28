# Developer Guide: Using Security Features

This guide shows developers how to use the security features in their code.

## Table of Contents

1. [Password Security](#password-security)
2. [Two-Factor Authentication](#two-factor-authentication)
3. [Encryption](#encryption)
4. [Fraud Detection](#fraud-detection)
5. [Audit Logging](#audit-logging)
6. [Input Validation](#input-validation)
7. [Rate Limiting](#rate-limiting)
8. [Session Management](#session-management)

## Password Security

### Hashing Passwords

```javascript
const PasswordService = require('./src/services/PasswordService');

// Hash a password
const password = 'UserPassword123!';
const hashedPassword = await PasswordService.hashPassword(password);
// Store hashedPassword in database

// Verify a password
const isValid = await PasswordService.verifyPassword(hashedPassword, password);
if (isValid) {
  console.log('Password is correct');
}
```

### Validating Password Strength

```javascript
// Validate password meets requirements
const validation = PasswordService.validatePasswordStrength('MyP@ssw0rd');

if (validation.valid) {
  console.log(`Password is valid! Strength: ${validation.strength}/100`);
} else {
  console.log('Password validation failed:');
  validation.errors.forEach(error => console.log(`- ${error}`));
}

// Example output:
// {
//   valid: true,
//   strength: 85,
//   errors: []
// }
```

### Generating Secure Passwords

```javascript
// Generate a secure random password
const newPassword = PasswordService.generateSecurePassword(16);
console.log(`Generated password: ${newPassword}`);
// Example: "K9#mP$2wQ@7nX!4z"
```

### Checking Password History

```javascript
// Prevent password reuse
const passwordHistory = [
  '$argon2id$v=19$m=65536,t=3,p=4$...',  // old password hash
  '$argon2id$v=19$m=65536,t=3,p=4$...'   // older password hash
];

const isInHistory = await PasswordService.isPasswordInHistory(
  newPassword,
  passwordHistory
);

if (isInHistory) {
  return res.status(400).json({
    error: 'Cannot reuse recent passwords'
  });
}
```

## Two-Factor Authentication

### Setting Up 2FA for a User

```javascript
const TwoFactorAuthService = require('./src/services/TwoFactorAuthService');

// 1. Generate secret and QR code
const setup = await TwoFactorAuthService.setupTwoFactor('user@example.com');

// 2. Display QR code to user
// setup.qrCode is a data URL that can be used in <img> tag
res.render('2fa-setup', {
  qrCode: setup.qrCode,
  secret: setup.secret, // Show once for manual entry
  backupCodes: setup.backupCodes // Show once, user must save
});

// 3. Store encrypted backup codes in database
// setup.encryptedBackupCodes
```

### Verifying 2FA Setup

```javascript
// User scans QR code and enters their first token
const token = req.body.token; // e.g., "123456"
const secret = req.session.tempSecret; // from setup

const isValid = TwoFactorAuthService.verifySetup(secret, token);

if (isValid) {
  // Save secret to user's database record
  // Enable 2FA for user
  res.json({ success: true, message: '2FA enabled' });
} else {
  res.status(400).json({ error: 'Invalid token' });
}
```

### Verifying 2FA During Login

```javascript
// After username/password verified, check 2FA
const user = await User.findById(userId);

if (user.twoFactorEnabled) {
  const token = req.body.token;
  const isValid = TwoFactorAuthService.verifyToken(
    user.twoFactorSecret,
    token
  );
  
  if (isValid) {
    // Complete login
    req.session.userId = user.id;
    res.json({ success: true });
  } else {
    // Try backup codes
    const backupCodeValid = TwoFactorAuthService.verifyBackupCode(
      user.backupCodes,
      token
    );
    
    if (backupCodeValid) {
      // Update user's backup codes (one was used)
      // Complete login
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  }
}
```

## Encryption

### Encrypting Sensitive Data

```javascript
const EncryptionService = require('./src/services/EncryptionService');

// Encrypt before storing in database
const ssn = '123-45-6789';
const encrypted = EncryptionService.encrypt(ssn);

// Store these fields in database
await User.update(userId, {
  ssn_encrypted: encrypted.encryptedData,
  ssn_iv: encrypted.iv,
  ssn_authTag: encrypted.authTag
});
```

### Decrypting Data

```javascript
// Retrieve encrypted data from database
const user = await User.findById(userId);

const encryptedData = {
  encryptedData: user.ssn_encrypted,
  iv: user.ssn_iv,
  authTag: user.ssn_authTag
};

const ssn = EncryptionService.decrypt(encryptedData);
console.log(`SSN: ${ssn}`); // "123-45-6789"
```

### Masking Data for Display

```javascript
// Mask account number
const accountNumber = '1234567890';
const masked = EncryptionService.maskAccountNumber(accountNumber);
console.log(masked); // "****7890"

// Mask email
const email = 'john.doe@example.com';
const maskedEmail = EncryptionService.maskEmail(email);
console.log(maskedEmail); // "j***e@example.com"

// Mask phone
const phone = '5551234567';
const maskedPhone = EncryptionService.maskPhone(phone);
console.log(maskedPhone); // "***-***-4567"
```

### Hashing Data

```javascript
// One-way hashing (cannot be decrypted)
const data = 'sensitive information';
const hash = EncryptionService.hash(data);
console.log(hash); // "a3f8b9c2..." (64 hex characters)

// Useful for checksums or unique identifiers
```

## Fraud Detection

### Checking Transaction Risk

```javascript
const FraudDetectionService = require('./src/services/FraudDetectionService');

// In transfer/payment route
router.post('/transfer', async (req, res) => {
  // Calculate risk score
  const riskAssessment = FraudDetectionService.calculateRiskScore(
    req.body,
    req
  );
  
  console.log(`Risk Score: ${riskAssessment.score}`);
  console.log(`Risk Level: ${riskAssessment.level}`);
  console.log(`Factors: ${riskAssessment.factors.join(', ')}`);
  
  // Handle based on risk level
  const decision = FraudDetectionService.handleRiskyTransaction(
    riskAssessment,
    req
  );
  
  if (!decision.allowed) {
    return res.status(403).json({
      error: decision.message
    });
  }
  
  // Process transaction
  // ...
  
  // Include warning if medium risk
  if (decision.warning) {
    return res.json({
      success: true,
      warning: decision.warning
    });
  }
  
  res.json({ success: true });
});
```

### Flagging Suspicious IPs

```javascript
// Flag an IP as suspicious
FraudDetectionService.flagSuspiciousIP('192.168.1.100', 'Multiple failed logins');

// Future transactions from this IP will have higher risk score
```

### Custom Risk Factors

```javascript
// You can extend the fraud detection service
// Add your own risk factors based on business logic

// Example: Flag transaction if user location changed dramatically
if (user.lastKnownCountry !== currentCountry) {
  riskScore += 20;
  factors.push('location_change');
}

// Example: Flag if transaction is to new recipient
if (!user.previousRecipients.includes(req.body.to)) {
  riskScore += 10;
  factors.push('new_recipient');
}
```

## Audit Logging

### Using Audit Middleware

```javascript
const { auditLogMiddleware } = require('./src/middleware/auditLogMiddleware');

// Add to specific routes
router.get('/sensitive-data', 
  auditLogMiddleware('view_sensitive_data'),
  (req, res) => {
    // Your route handler
  }
);

router.post('/transaction',
  auditLogMiddleware('create_transaction'),
  (req, res) => {
    // Your route handler
  }
);
```

### Manual Security Event Logging

```javascript
const { logSecurityEvent } = require('./src/middleware/auditLogMiddleware');

// Log a security event
logSecurityEvent('password_changed', 'info', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date().toISOString()
});

// Log a warning
logSecurityEvent('suspicious_activity', 'warn', {
  userId: user.id,
  activity: 'Multiple failed login attempts',
  ip: req.ip
});

// Log an error
logSecurityEvent('data_breach_attempt', 'error', {
  details: 'Unauthorized data access attempt',
  ip: req.ip
});
```

### Accessing Audit Information

```javascript
// Audit info is attached to request by middleware
router.post('/action', auditLogMiddleware('action'), (req, res) => {
  console.log('Audit Info:', req.auditInfo);
  // {
  //   action: 'action',
  //   ip: '192.168.1.1',
  //   timestamp: '2024-01-28T12:00:00.000Z',
  //   userAgent: { browser: 'Chrome', os: 'Windows', device: 'desktop' },
  //   location: { country: 'US', region: 'CA', city: 'San Francisco' }
  // }
});
```

## Input Validation

### Using Validation Middleware

```javascript
const { 
  validateTransfer, 
  validatePayment,
  handleValidationErrors 
} = require('./src/middleware/inputValidationMiddleware');

// Apply to routes
router.post('/transfer',
  validateTransfer,
  handleValidationErrors,
  (req, res) => {
    // If we get here, input is valid
    const { from, to, amount } = req.body;
    // Process transfer
  }
);
```

### Creating Custom Validation

```javascript
const { body, validationResult } = require('express-validator');

// Custom validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 alphanumeric characters'),
  body('password')
    .custom((value) => {
      const validation = PasswordService.validatePasswordStrength(value);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    })
];

// Use in route
router.post('/register',
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    // Input is validated and sanitized
    const { email, username, password } = req.body;
    // Create user
  }
);
```

### Manual Input Sanitization

```javascript
const validator = require('validator');

// Sanitize string input
const cleanInput = validator.escape(userInput);

// Validate and sanitize email
if (validator.isEmail(email)) {
  const cleanEmail = validator.normalizeEmail(email);
}

// Check for SQL injection patterns
if (validator.contains(input, 'DROP TABLE')) {
  // Block request
}
```

## Rate Limiting

### Applying Rate Limiters

```javascript
const { 
  generalLimiter, 
  authLimiter, 
  transactionLimiter 
} = require('./src/middleware/rateLimitMiddleware');

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Apply auth rate limiter to login
router.post('/login', authLimiter, (req, res) => {
  // Login logic
});

// Apply transaction rate limiter
router.post('/transfer', transactionLimiter, (req, res) => {
  // Transfer logic
});
```

### Creating Custom Rate Limiters

```javascript
const rateLimit = require('express-rate-limit');

// Custom limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'API rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use('/api', apiLimiter);

// Custom limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 uploads per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful uploads
});

router.post('/upload', uploadLimiter, (req, res) => {
  // Upload logic
});
```

### Rate Limiter with Custom Key

```javascript
// Rate limit by user ID instead of IP
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    return req.session.userId || req.ip; // Use user ID if logged in
  }
});
```

## Session Management

### Using Session Middleware

```javascript
// Sessions are automatically configured in app.js
// Access session data:

router.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body);
  
  if (user) {
    // Set session data
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.lastActivity = Date.now();
    
    res.json({ success: true });
  }
});

// Access session in other routes
router.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.session.userId;
  // Load and return user data
});
```

### Session Regeneration

```javascript
// Regenerate session ID after privilege escalation
router.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body);
  
  if (user) {
    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }
      
      req.session.userId = user.id;
      res.json({ success: true });
    });
  }
});
```

### Destroying Sessions

```javascript
// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});
```

### Session Timeout Middleware

```javascript
// Session timeout is automatically handled by sessionTimeoutMiddleware
// But you can also check manually:

const checkSession = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  const now = Date.now();
  const lastActivity = req.session.lastActivity || now;
  const idleTime = now - lastActivity;
  const maxIdleTime = 15 * 60 * 1000; // 15 minutes
  
  if (idleTime > maxIdleTime) {
    req.session.destroy();
    return res.status(401).json({ error: 'Session timeout' });
  }
  
  req.session.lastActivity = now;
  next();
};
```

## Complete Example: Secure User Registration

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const PasswordService = require('../services/PasswordService');
const TwoFactorAuthService = require('../services/TwoFactorAuthService');
const { handleValidationErrors } = require('../middleware/inputValidationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { auditLogMiddleware, logSecurityEvent } = require('../middleware/auditLogMiddleware');

// Registration validation
const registrationValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 20 }).isAlphanumeric(),
  body('password').custom((value) => {
    const validation = PasswordService.validatePasswordStrength(value);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return true;
  })
];

// Registration route
router.post('/register',
  authLimiter,
  registrationValidation,
  handleValidationErrors,
  auditLogMiddleware('user_registration'),
  async (req, res) => {
    try {
      const { email, username, password } = req.body;
      
      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        logSecurityEvent('duplicate_registration_attempt', 'warn', {
          email,
          ip: req.ip
        });
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);
      
      // Create user
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        passwordLastChanged: new Date()
      });
      
      // Setup 2FA (optional)
      const twoFactorSetup = await TwoFactorAuthService.setupTwoFactor(email);
      
      // Log successful registration
      logSecurityEvent('user_registered', 'info', {
        userId: user.id,
        email,
        ip: req.ip
      });
      
      // Create session
      req.session.userId = user.id;
      
      res.json({
        success: true,
        userId: user.id,
        twoFactorSetup: {
          qrCode: twoFactorSetup.qrCode,
          backupCodes: twoFactorSetup.backupCodes
        }
      });
      
    } catch (error) {
      logSecurityEvent('registration_error', 'error', {
        error: error.message,
        ip: req.ip
      });
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

module.exports = router;
```

## Testing Security Features

```javascript
const { expect } = require('chai');
const PasswordService = require('../src/services/PasswordService');

describe('Security Tests', () => {
  it('should enforce password requirements', () => {
    const weak = PasswordService.validatePasswordStrength('weak');
    expect(weak.valid).to.be.false;
    expect(weak.errors).to.have.length.greaterThan(0);
    
    const strong = PasswordService.validatePasswordStrength('Str0ng!P@ss');
    expect(strong.valid).to.be.true;
  });
  
  it('should hash passwords securely', async () => {
    const password = 'MyPassword123!';
    const hash = await PasswordService.hashPassword(password);
    
    expect(hash).to.not.equal(password);
    expect(hash).to.include('$argon2');
    
    const isValid = await PasswordService.verifyPassword(hash, password);
    expect(isValid).to.be.true;
  });
});
```

## Environment Configuration

```bash
# .env file
ENCRYPTION_KEY=your-64-character-hex-key
SESSION_SECRET=your-session-secret
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_EXPIRY_DAYS=90
```

```javascript
// Access configuration
const securityConfig = require('./config/security');

console.log(securityConfig.password.minLength); // 8
console.log(securityConfig.accountLockout.maxAttempts); // 5
console.log(securityConfig.session.maxAge); // 7200000
```

## Best Practices

1. **Always hash passwords** - Never store plaintext passwords
2. **Validate all inputs** - Never trust user input
3. **Use audit logging** - Track all security-relevant actions
4. **Apply rate limiting** - Prevent abuse
5. **Enable 2FA** - Add extra layer of security
6. **Encrypt sensitive data** - Protect PII
7. **Check for fraud** - Monitor transactions
8. **Use secure sessions** - Protect session data
9. **Keep dependencies updated** - Patch vulnerabilities
10. **Test security features** - Verify they work correctly

## Need Help?

- See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for implementation details
- See [SECURITY.md](./SECURITY.md) for comprehensive documentation
- See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for verification
