# Banking Portal - Node/Express Application

Node/Express Pluralsight Project Sample Application with Enterprise-Grade Security

## 🔒 Security Features

This Banking Portal includes comprehensive security features:
- **Security Headers** (Helmet.js) - CSP, HSTS, XSS Protection
- **Rate Limiting** - Prevent abuse and brute-force attacks
- **Session Management** - Secure sessions with timeouts
- **Two-Factor Authentication (2FA)** - TOTP-based authentication
- **Password Security** - Argon2 hashing with strength validation
- **Encryption Service** - AES-256-GCM for sensitive data
- **Fraud Detection** - Real-time risk scoring for transactions
- **Audit Logging** - Comprehensive activity tracking
- **Input Validation** - Prevent injection attacks

📖 **[Full Security Documentation](./SECURITY.md)** | **[Security Implementation Guide](./SECURITY_GUIDE.md)**

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Generate secure keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run the Application

```bash
npm start
```

Visit `http://localhost:3000`

### Run Tests

```bash
npm test
```

All 70 tests should pass (53 application + 17 security tests).

## Features

- Account management (Savings, Checking, Credit)
- Fund transfers between accounts
- Credit card payments
- User profile management
- **Comprehensive security features** (see above)

## Project Structure

```
Banking-Portal/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── routes/          # Route definitions
│   ├── views/           # EJS templates
│   └── app.js          # Main application
├── test/               # Test files
│   └── security/       # Security tests
├── SECURITY.md         # Security documentation
└── SECURITY_GUIDE.md   # Implementation guide
```

## Documentation

- **[tasks.md](./tasks.md)** - Original project tasks and setup
- **[SECURITY.md](./SECURITY.md)** - Comprehensive security documentation
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - Security implementation guide

## License

MIT
