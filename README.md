# Banking Portal Application

A comprehensive, production-ready banking portal built with modern web technologies.

## 🏗️ Tech Stack

### Frontend
- **React.js** 18.x with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Redux Toolkit** for state management
- **Axios** for API calls
- **React Hook Form** with validation
- **Chart.js** for data visualization

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation

### DevOps
- **Docker** and **Docker Compose** for containerization
- **ESLint** and **Prettier** for code quality

## 🚀 Features

### Implemented
- ✅ User Authentication (Register/Login with JWT)
- ✅ User Dashboard with account overview
- ✅ Account Management (Create, View accounts)
- ✅ Transaction History
- ✅ Internal Fund Transfers
- ✅ Role-based Access Control
- ✅ Secure Password Hashing
- ✅ Rate Limiting
- ✅ Audit Logging
- ✅ Notifications System

### Database Schema
- Users (with roles, authentication)
- Accounts (Checking, Savings, Credit Card)
- Transactions (with status tracking)
- Cards (Debit, Credit, Virtual)
- Beneficiaries (for external transfers)
- Loans (with payment schedules)
- Notifications (in-app alerts)
- Audit Logs (security tracking)

## 📋 Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x or higher
- Docker and Docker Compose (optional)

## 🛠️ Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd Banking-Portal
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

4. Start all services:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Manual Installation

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp ../.env.example .env
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the development server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### Account Endpoints
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id/balance` - Get account balance

### Transaction Endpoints
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details

### Transfer Endpoints
- `POST /api/transfers/internal` - Internal transfer
- `GET /api/transfers/:id/status` - Get transfer status

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Monitor all transactions
- `GET /api/admin/analytics` - View analytics

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Audit logging for all actions
- Account lockout after failed login attempts

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Project Structure

```
banking-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── config/           # Configuration
│   │   └── server.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   └── App.tsx           # Main app component
│   └── package.json
├── docker-compose.yml        # Docker configuration
├── .env.example              # Environment template
└── README.md
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `BACKEND_PORT` - Backend server port (default: 5000)
- `FRONTEND_PORT` - Frontend server port (default: 3001)

## 🚦 Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email support@bankingportal.com or open an issue in the repository.

## 🎯 Roadmap

- [ ] Two-factor authentication (2FA)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Bill payments
- [ ] Loan applications
- [ ] Investment portfolio
- [ ] Mobile app
- [ ] Card management
- [ ] Scheduled transfers
- [ ] PDF statement generation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## ⚠️ Security Notice

This is a demonstration project. For production use, ensure you:
- Use strong, unique secrets for JWT tokens
- Enable HTTPS
- Implement additional security measures
- Regular security audits
- Comply with financial regulations
- Implement proper backup strategies

---

**Built with ❤️ using modern web technologies**
