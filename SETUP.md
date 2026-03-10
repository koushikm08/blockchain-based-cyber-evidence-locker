# Blockchain Evidence Locker - Setup Guide

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v18.20.8 or higher)
2. **MongoDB** (running on default port 27017)
3. **IPFS** (running on port 5001)
4. **npm** or **yarn**

## Quick Start

### Option 1: Using VS Code Tasks (Recommended)

1. Open the project in VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Tasks: Run Task"
4. Select "📦 Install All Dependencies" (first time only)
5. Select "🚀 Start All Services"

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install blockchain dependencies
cd blockchain
npm install
cd ../..
```

#### Step 2: Start MongoDB

```bash
# If using Homebrew on Mac
brew services start mongodb-community

# Or start manually
mongod --config /opt/homebrew/etc/mongod.conf
```

#### Step 3: Start IPFS Daemon

```bash
# Initialize IPFS (first time only)
ipfs init

# Start IPFS daemon
ipfs daemon
```

This will start IPFS on `http://127.0.0.1:5001`

#### Step 4: Start Ganache (Local Blockchain)

```bash
cd backend/blockchain
npx ganache --port 8545
```

Keep this terminal open. Ganache will provide you with:
- 10 test accounts with 100 ETH each
- RPC server on `http://127.0.0.1:8545`

#### Step 5: Deploy Smart Contract

Open a new terminal:

```bash
cd backend/blockchain
node scripts/deploy_manual.js
```

This will:
- Compile `EvidenceLocker.sol`
- Deploy to local Ganache network
- Save contract address and ABI to `deployment-info.json`

#### Step 6: Start Backend Server

```bash
cd backend
node server.js
```

Backend will run on `http://localhost:5002`

#### Step 7: Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Environment Configuration

### Backend (.env)

The backend uses the following configuration (already set in `backend/.env`):

```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/evidence-locker
JWT_SECRET=evidence_locker_secret_key_2026_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### IPFS Configuration

By default, the backend connects to IPFS at `http://127.0.0.1:5001`. You can change this by setting the `IPFS_URL` environment variable.

## Testing the Application

### 1. Register a User

1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form
3. Select a role:
   - `admin` - Full access
   - `investigator` - Can upload and verify evidence
   - `law_enforcement` - Can only verify evidence
   - `public` - Read-only access

### 2. Upload Evidence

1. Sign in with your credentials
2. Navigate to `/upload`
3. Select a file to upload
4. The system will:
   - Calculate SHA-256 hash
   - Upload file to IPFS
   - Store hash and CID on blockchain
   - Return Evidence ID

### 3. Verify Evidence

1. Navigate to `/verify`
2. Enter the Evidence ID
3. The system will:
   - Fetch file from IPFS
   - Recalculate hash
   - Compare with blockchain record
   - Display verification status

## Project Structure

```
blockchain-based-cyber-evidence-locker/
├── app/                          # Next.js frontend
│   ├── upload/                   # Upload page
│   ├── verify/                   # Verify page
│   ├── dashboard/                # Dashboard
│   └── signin/                   # Authentication
├── backend/
│   ├── server.js                 # Express server
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── evidenceController.js # Evidence upload/verify
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Evidence.js           # Evidence schema
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── checkRole.js          # RBAC middleware
│   ├── config/
│   │   └── contractConfig.js     # Smart contract config
│   └── blockchain/
│       ├── contracts/
│       │   └── EvidenceLocker.sol # Smart contract
│       ├── scripts/
│       │   └── deploy_manual.js   # Deployment script
│       └── deployment-info.json   # Contract address & ABI
└── .vscode/
    └── tasks.json                # VS Code tasks
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

### IPFS Connection Failed

```bash
# Check if IPFS daemon is running
ipfs swarm peers

# Start IPFS daemon
ipfs daemon
```

### Ganache Connection Failed

```bash
# Check if Ganache is running on port 8545
lsof -i :8545

# Kill existing process and restart
pkill -f ganache
cd backend/blockchain
npx ganache --port 8545
```

### Backend Port Already in Use

```bash
# Find process using port 5002
lsof -i :5002

# Kill the process
kill -9 <PID>
```

## Features Implemented

✅ **Smart Contract Integration**
- `EvidenceLocker.sol` deployed on local Ganache
- Event emission for evidence storage
- Blockchain-based integrity verification

✅ **IPFS Storage**
- Real file uploads to IPFS
- CID storage and retrieval
- Decentralized file storage

✅ **Verification Logic**
- Hash recalculation
- Blockchain comparison
- Tampering detection

✅ **Role-Based Access Control (RBAC)**
- User roles: admin, investigator, law_enforcement, public
- Protected API endpoints
- JWT-based authentication

✅ **Frontend Integration**
- Upload page with blockchain details
- Verify page with integrity checks
- Transaction hash and Smart Contract ID display

## API Endpoints

### Authentication
- `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register` - Register new user
- `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin` - Sign in
- `GET `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me` - Get current user

### Evidence
- `POST `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/upload` - Upload evidence (admin, investigator)
- `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/:evidenceId` - Verify evidence (admin, investigator, law_enforcement)
- `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/list` - List all evidence
- `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/:id` - Get evidence details
- `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/stats` - Get statistics

## Security Notes

⚠️ **Important**: This is a development setup. For production:

1. Change `JWT_SECRET` to a strong, random value
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Use a production-grade blockchain network
5. Implement rate limiting
6. Add input validation and sanitization
7. Use a pinning service for IPFS (e.g., Pinata, Infura)

## Next Steps

1. Test the full upload → verify flow
2. Implement frontend role-based UI visibility
3. Add file download from IPFS
4. Implement audit logs
5. Add email notifications
6. Deploy to production environment
