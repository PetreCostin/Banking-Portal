# Banking Portal API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2026-01-28T19:00:00Z"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Refresh Token
**POST** `/auth/refresh-token`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

### Logout
**POST** `/auth/logout`

Logout user (client should delete stored tokens).

**Response:** `200 OK`
```json
{
  "message": "Logout successful"
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`

Get authenticated user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "role": "CUSTOMER",
    "isEmailVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-28T19:00:00Z"
  }
}
```

### Update Profile
**PUT** `/users/profile`

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": "456 New St, City"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "address": "456 New St, City",
    "role": "CUSTOMER"
  }
}
```

### Change Password
**PUT** `/users/change-password`

Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Account Endpoints

### Get All Accounts
**GET** `/accounts`

Get all accounts for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "accounts": [
    {
      "id": "uuid",
      "accountNumber": "1234567890",
      "accountType": "CHECKING",
      "balance": "5000.00",
      "currency": "USD",
      "status": "ACTIVE",
      "createdAt": "2026-01-01T00:00:00Z",
      "cards": []
    }
  ]
}
```

### Get Account by ID
**GET** `/accounts/:id`

Get specific account details with recent transactions.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "account": {
    "id": "uuid",
    "accountNumber": "1234567890",
    "accountType": "CHECKING",
    "balance": "5000.00",
    "currency": "USD",
    "status": "ACTIVE",
    "cards": [],
    "fromTransactions": [],
    "toTransactions": []
  }
}
```

### Create Account
**POST** `/accounts`

Create a new account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "accountType": "SAVINGS",
  "currency": "USD"
}
```

**Response:** `201 Created`
```json
{
  "message": "Account created successfully",
  "account": {
    "id": "uuid",
    "accountNumber": "9876543210",
    "accountType": "SAVINGS",
    "balance": "0.00",
    "currency": "USD",
    "status": "ACTIVE"
  }
}
```

### Get Account Balance
**GET** `/accounts/:id/balance`

Get account balance.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "balance": {
    "id": "uuid",
    "accountNumber": "1234567890",
    "balance": "5000.00",
    "currency": "USD"
  }
}
```

---

## Transaction Endpoints

### Get Transactions
**GET** `/transactions`

Get transaction history with pagination and filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `accountId` (optional): Filter by account ID
- `type` (optional): Filter by transaction type (DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT, FEE, INTEREST)

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": "100.00",
      "type": "TRANSFER",
      "status": "COMPLETED",
      "description": "Transfer to savings",
      "reference": "TXN1234567890",
      "createdAt": "2026-01-28T19:00:00Z",
      "fromAccount": {
        "accountNumber": "1234567890",
        "accountType": "CHECKING"
      },
      "toAccount": {
        "accountNumber": "9876543210",
        "accountType": "SAVINGS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Get Transaction by ID
**GET** `/transactions/:id`

Get specific transaction details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "transaction": {
    "id": "uuid",
    "amount": "100.00",
    "type": "TRANSFER",
    "status": "COMPLETED",
    "description": "Transfer to savings",
    "reference": "TXN1234567890",
    "createdAt": "2026-01-28T19:00:00Z",
    "fromAccount": { },
    "toAccount": { }
  }
}
```

---

## Transfer Endpoints

### Internal Transfer
**POST** `/transfers/internal`

Transfer money between accounts.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 100.50,
  "description": "Transfer to savings"
}
```

**Response:** `200 OK`
```json
{
  "message": "Transfer completed successfully",
  "transaction": {
    "id": "uuid",
    "amount": "100.50",
    "type": "TRANSFER",
    "status": "COMPLETED",
    "reference": "TXN1234567890",
    "createdAt": "2026-01-28T19:00:00Z"
  }
}
```

### Get Transfer Status
**GET** `/transfers/:id/status`

Check transfer status.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "COMPLETED",
  "transaction": { }
}
```

---

## Admin Endpoints

All admin endpoints require `ADMIN` or `MANAGER` role.

### Get All Users
**GET** `/admin/users`

Get list of all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "users": []
}
```

### Get All Transactions
**GET** `/admin/transactions`

Monitor all transactions (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "transactions": []
}
```

### Get Analytics
**GET** `/admin/analytics`

Get system analytics (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "analytics": {}
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Notes

1. All monetary amounts are returned as strings to preserve precision
2. Dates are in ISO 8601 format (UTC)
3. All endpoints use JSON for request and response bodies
4. Account types: `CHECKING`, `SAVINGS`, `CREDIT_CARD`
5. Transaction types: `DEPOSIT`, `WITHDRAWAL`, `TRANSFER`, `PAYMENT`, `FEE`, `INTEREST`
6. Transaction statuses: `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`
7. User roles: `CUSTOMER`, `ADMIN`, `MANAGER`
