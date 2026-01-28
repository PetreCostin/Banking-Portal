# 🏦 Banking Portal

A comprehensive, secure banking portal application built with modern technologies.

## 🚀 Features

- **User Authentication** - Secure login and registration
- **Account Management** - Multiple account types support
- **Transaction History** - Detailed transaction records
- **Fund Transfers** - Internal and external transfers
- **Security** - Advanced security features including 2FA
- **Real-time Updates** - Live transaction notifications
- **Responsive Design** - Mobile-first approach

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Security**: JWT, Helmet, Rate Limiting
- **Deployment**: Docker, Docker Compose

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/PetreCostin/Banking-Portal.git

# Navigate to project directory
cd Banking-Portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

## 🔧 Environment Variables

```
env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/banking
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**PetreCostin**

---

Built with ❤️ using TypeScript and React
