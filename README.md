# the-aussie-outfit-authentican-service

A secure, production-ready authentication service for The Aussie Outfit e-commerce platform. This service provides user registration, login, token management, password reset, and session management with advanced security features including JWT-based authentication, bcrypt password hashing, and refresh token rotation.

## Features

- **User Registration & Login** — Create new user accounts and authenticate with email and password
- **JWT-based Authentication** — Secure token-based authentication with configurable expiration
- **Password Security** — Bcrypt password hashing with automatic encryption on save
- **Refresh Token Rotation** — Automatic token rotation with family-based tracking and revocation
- **Role-Based Access Control** — Support for multiple user roles (customer, admin, seller, support)
- **User Status Management** — Track user states (active, inactive, blocked, pendingVerification)
- **Multi-Session Management** — Track and manage multiple active sessions per user with device identification
- **Password Reset** — Secure password reset flow with token expiration (15 minutes)
- **Email & Phone Verification Tracking** — Fields for tracking email and phone verification status
- **Session Security** — Store device ID, user agent, and IP address for session tracking
- **Token Revocation** — Logout functionality including single session and all-sessions logout
- **CORS Support** — Pre-configured for cross-origin requests

## Tech Stack

- **Node.js** 18+
- **Express.js** 5.2.1 — Web framework
- **MongoDB** with **Mongoose** 9.6.1 — Database and ODM
- **JWT** (jsonwebtoken 9.0.3) — Token management
- **Bcrypt** 6.0.0 — Password hashing
- **Nodemon** 3.1.14 — Development auto-reload
- **Vitest** 4.1.4 — Testing framework

## Project Structure

```
src/
├── index.js                 # Application entry point
├── app.js                   # Express app configuration with CORS and middleware
├── config/
│   ├── database.js          # MongoDB connection and database management
│   └── constant.js          # Application constants (e.g., DB_NAME)
├── models/
│   ├── user.js              # User schema with password hashing and comparison
│   └── refreshToken.js      # Refresh token schema with revocation tracking
├── controller/
│   └── auth.js              # Authentication logic (register, login, token refresh, etc.)
├── middleware/
│   └── auth.js              # JWT verification middleware (verifyJWT)
└── route/
    └── auth.js              # Route definitions for all auth endpoints
```

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB instance (local or cloud-based, e.g., MongoDB Atlas)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pradyumna106-ship-it/the-aussie-outfit-authentican-service.git
cd the-aussie-outfit-authentican-service
```

2. Install dependencies:
```bash
npm install
```

or

```bash
yarn install
```

## Configuration

Create a `.env` file in the project root directory with the following variables:

```env
# Server Configuration
PORT=4000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=7

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/
```

### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `JWT_SECRET` | Secret key for JWT signing (required) | - |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiration time (e.g., 15m, 1h) | 15m |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Refresh token validity in days | 7 |
| `MONGODB_URI` | MongoDB connection string | - |

## Running the Service

### Development Mode
```bash
npm run dev
```
Runs the service with Nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Testing
```bash
npm test
```

Watch mode for tests:
```bash
npm run test:watch
```

## API Endpoints

All endpoints are prefixed with `/` (root path).

### Authentication Endpoints

#### Register a New User
```
POST /register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "phone": "0412345678",
  "password": "securePassword123",
  "roles": ["customer"]
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "phone": "0412345678",
      "roles": ["customer"],
      "status": "active",
      "isEmailVerified": false,
      "isPhoneVerified": false
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login User
```
POST /login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Refresh Access Token
```
POST /refresh-token
Content-Type: application/json

Request Body:
{
  "refreshToken": "refresh_token"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### Verify Token
```
GET /verify-token
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "roles": ["customer"]
  }
}
```

#### Get Current User
```
GET /:id
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "phone": "0412345678",
    "roles": ["customer"],
    "status": "active",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-14T09:20:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update User
```
PUT /:id
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "email": "newemail@example.com",
  "phone": "0498765432",
  "password": "newPassword123",
  "roles": ["customer"]
}

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Logout User (Single Session)
```
POST /logout
Content-Type: application/json

Request Body:
{
  "refreshToken": "refresh_token"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Logout All Sessions
```
POST /logout-all
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "userId": "user_id"
}

Response:
{
  "success": true,
  "message": "All sessions logged out successfully"
}
```

#### Forgot Password
```
POST /forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "reset_token_value"
}
```

#### Reset Password
```
POST /reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token_value",
  "password": "newPassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Get All Users
```
GET /
Response:
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

## Database Schema

### User Model
- `email` — Unique, lowercase, indexed
- `phone` — Optional, indexed
- `password` — Hashed with bcrypt, not selected by default
- `roles` — Array of roles (customer, admin, seller, support)
- `status` — User status (active, inactive, blocked, pendingVerification)
- `isEmailVerified` — Boolean flag
- `isPhoneVerified` — Boolean flag
- `lastLoginAt` — Timestamp of last login
- `passwordChangedAt` — Timestamp of last password change
- `failedLoginAttempts` — Counter for failed login attempts
- `lockedUntil` — Account lock expiration date
- `passwordResetToken` — Hashed password reset token
- `passwordResetExpires` — Password reset token expiration (15 minutes)
- `timestamps` — Automatically managed createdAt and updatedAt

### Refresh Token Model
- `user` — Reference to User (indexed)
- `tokenHash` — Hashed token value (unique, not selected by default)
- `familyId` — Family identifier for token rotation tracking (indexed)
- `deviceId` — Device identifier from request headers
- `userAgent` — User agent from request
- `ipAddress` — IP address from request
- `expiresAt` — Token expiration date (indexed)
- `revokedAt` — Revocation timestamp (null if active)
- `replacedByTokenHash` — Hash of the token that replaced this one (token rotation)
- `timestamps` — Automatically managed createdAt and updatedAt

## Security Features

- **Password Hashing** — Passwords are automatically hashed using bcrypt (10 salt rounds) before storage
- **JWT Tokens** — Stateless authentication with configurable expiration times
- **Refresh Token Rotation** — Old refresh tokens are revoked when new ones are issued
- **Token Family Tracking** — Track related refresh tokens to detect potential token reuse attacks
- **Session Tracking** — Store device, user agent, and IP information for security audits
- **Account Locking** — Configurable account locking after failed login attempts
- **Password Reset Tokens** — Secure, time-limited password reset flow
- **CORS** — Configurable cross-origin request handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a clear description of the changes

## Testing

Run tests with:
```bash
npm test
```

Tests are written using **Vitest** and can be run in watch mode for development:
```bash
npm run test:watch
```

## Error Handling

The API follows RESTful conventions for error responses:

- **400** — Bad Request (missing/invalid parameters)
- **401** — Unauthorized (invalid/expired token)
- **403** — Forbidden (insufficient permissions)
- **404** — Not Found (user not found)
- **409** — Conflict (user already exists)
- **500** — Internal Server Error

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## License

This project is provided as-is. Add a license file if needed.

## Support

For issues and questions, please open an issue on the GitHub repository.
