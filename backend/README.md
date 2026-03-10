# Cyber Evidence Locker - Backend API

Complete Node.js backend for blockchain-based cyber evidence management system with MongoDB integration.

## Features

✅ User Authentication (Register/Login with JWT)
✅ Evidence Upload & Management  
✅ Evidence Verification
✅ File Hash Calculation (SHA-256)
✅ Simulated IPFS & Blockchain Integration
✅ Auto-generated Evidence IDs
✅ Statistics Dashboard
✅ Protected Routes
✅ Role-based Access Control

## Installation

```bash
cd backend
npm install
```

## Configuration

Edit `.env` file:
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/evidence-locker
JWT_SECRET=evidence_locker_secret_key_2026_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Quick Start

```bash
# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

**Register** - `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`
```json
{
  "fullName": "John Doe",
  "email": "john@agency.gov",
  "password": "password123",
  "confirmPassword": "password123",
  "organization": "Law Enforcement Agency"
}
```

**Sign In** - `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`
```json
{
  "email": "john@agency.gov",
  "password": "password123"
}
```

**Get Profile** - `GET `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me` (Protected)

### Evidence Management

**Upload Evidence** - `POST `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/upload` (Protected)
- Form data with file field: `file`
- Returns: evidenceId, hash, IPFS CID, blockchain TX

**Verify Evidence** - `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/:evidenceId` (Protected)

**List Evidence** - `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/list` (Protected)
- Query params: `?page=1&limit=20&status=all`

**Get Evidence** - `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/:id` (Protected)

**Get Statistics** - `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/stats` (Protected)

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| john@lawenforcement.gov | password123 | Investigator |
| sarah@cybercrime.gov | password123 | Investigator |
| admin@evidence.gov | admin123 | Admin |

## Testing

```bash
./test-api.sh
```

## Database Models

### User
- fullName, email, password (hashed)
- organization, role
- JWT token generation

### Evidence  
- Auto-generated evidenceId (EV-YYYY-XXXXXX)
- fileName, fileSize, fileHash
- ipfsCid, blockchainTx, blockNumber
- status (pending/verified/compromised)
- verificationCount, lastVerified

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **File Upload**: Multer
- **Hash**: Crypto (SHA-256)

## Project Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── evidenceController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   └── Evidence.js
├── routes/
│   ├── auth.js
│   └── evidence.js
├── server.js
├── seed.js
└── test-api.sh
```

## Status

✅ Backend Complete and Running on Port 5002
✅ MongoDB Connected
✅ All Tests Passing
