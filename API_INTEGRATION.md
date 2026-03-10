# B-CEL API Integration Guide

This document provides the expected API endpoints and response formats for the B-CEL backend Node.js server.

---

## 🔌 Base Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001`${process.env.NEXT_PUBLIC_API_URL}/api
NEXT_PUBLIC_BLOCKCHAIN_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_IPFS_API=https://ipfs.io
IPFS_API_KEY=your_ipfs_key (backend only)
DATABASE_URL=postgresql://user:password@localhost/b_cel
JWT_SECRET=your_jwt_secret_key
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**Endpoint:** `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "investigator@agency.gov",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "organization": "Federal Law Enforcement Agency"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-123",
    "email": "investigator@agency.gov",
    "fullName": "John Doe",
    "organization": "Federal Law Enforcement Agency",
    "createdAt": "2024-01-20T14:30:45Z"
  }
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Sign In User
**Endpoint:** `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`

**Request:**
```json
{
  "email": "investigator@agency.gov",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-123",
    "email": "investigator@agency.gov",
    "fullName": "John Doe",
    "organization": "Federal Law Enforcement Agency"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 📤 Evidence Upload Endpoint

### Upload Evidence File
**Endpoint:** `POST `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/upload`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
- Form data with file field: `file` (binary)

**Process (Backend):**
1. Receive file from client
2. Calculate SHA-256 hash of file
3. Upload file to IPFS
4. Store metadata in database
5. Record on Ethereum blockchain via smart contract
6. Generate unique Evidence ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "evidenceId": "EV-2024-000001",
  "hash": "a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6",
  "cid": "QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8dX1eF4gH7jK9mN0o",
  "timestamp": "2024-01-20T14:30:45.123Z",
  "blockchainTx": "0x3f7d2a8b9c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
  "blockNumber": 18523482
}
```

**Error (413 Payload Too Large):**
```json
{
  "success": false,
  "message": "File size exceeds maximum limit (5GB)"
}
```

---

## ✅ Evidence Verification Endpoint

### Verify Evidence
**Endpoint:** `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/:evidenceId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence verified successfully",
  "evidenceId": "EV-2024-000001",
  "fileName": "evidence-photo.jpg",
  "uploadedBy": "investigator@agency.gov",
  "uploadedByName": "John Doe",
  "hash": "a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6",
  "cid": "QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8dX1eF4gH7jK9mN0o",
  "timestamp": "2024-01-20T14:30:45.123Z",
  "status": "verified",
  "blockchainVerified": true,
  "ipfsAvailable": true,
  "hashMatch": true,
  "verificationDetails": {
    "blockNumber": 18523482,
    "blockchainTx": "0x3f7d2a8b9c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    "lastVerified": "2024-01-20T15:45:30Z",
    "verificationCount": 12
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Evidence not found",
  "evidenceId": "EV-2024-999999"
}
```

**Error (422 Unprocessable Entity - Compromised):**
```json
{
  "success": false,
  "message": "Evidence integrity check failed - possible tampering detected",
  "evidenceId": "EV-2024-000001",
  "status": "compromised",
  "issues": [
    "Hash mismatch: stored hash does not match IPFS file"
  ]
}
```

---

## 📊 Evidence List Endpoint

### Get User's Evidence List
**Endpoint:** `GET `${process.env.NEXT_PUBLIC_API_URL}/api/evidence/list`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?page=1&limit=20&status=all&sort=timestamp
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence list retrieved",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  },
  "evidence": [
    {
      "id": "ev-uuid-001",
      "evidenceId": "EV-2024-000001",
      "fileName": "evidence-photo.jpg",
      "hash": "a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f...",
      "cid": "QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8dX1eF4...",
      "timestamp": "2024-01-20T14:30:45.123Z",
      "status": "verified",
      "fileSize": 2560000,
      "uploadedBy": "investigator@agency.gov"
    },
    {
      "id": "ev-uuid-002",
      "evidenceId": "EV-2024-000002",
      "fileName": "video-recording.mp4",
      "hash": "b3g54e7d9f2c4a5e6b7c8d9e0f1a2b3c...",
      "cid": "QmY8wG0h3nLzg5e8r0s2t3u4v5w6x7y8z...",
      "timestamp": "2024-01-20T13:15:20.456Z",
      "status": "verified",
      "fileSize": 524288000,
      "uploadedBy": "investigator@agency.gov"
    }
  ]
}
```

---

## 🔒 Error Response Format

All endpoints should return errors in this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional technical details",
    "timestamp": "2024-01-20T14:30:45.123Z"
  }
}
```

---

## 🛡️ Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user-uuid-123",
  "email": "investigator@agency.gov",
  "organization": "Federal Law Enforcement Agency",
  "iat": 1705774245,
  "exp": 1705860645,
  "role": "investigator"
}
```

### Token Refresh Endpoint (Recommended)
**Endpoint:** `POST `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`

**Headers:**
```
Authorization: Bearer {expiredToken}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📡 WebSocket Events (Optional - Real-time Updates)

For live verification status updates, consider implementing WebSocket support:

```javascript
// Client connection
const ws = new WebSocket('ws://localhost:3001/evidence');

// Subscribe to evidence updates
ws.send(JSON.stringify({
  type: 'subscribe',
  evidenceId: 'EV-2024-000001',
  token: 'bearer_token'
}));

// Receive updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // {
  //   type: 'status_updated',
  //   evidenceId: 'EV-2024-000001',
  //   status: 'verified',
  //   timestamp: '2024-01-20T14:30:45Z'
  // }
};
```

---

## 🔗 Blockchain Integration

### Smart Contract Methods

**Record Evidence:**
```solidity
function recordEvidence(
  string calldata evidenceId,
  bytes32 fileHash,
  string calldata ipfsCID,
  uint256 timestamp
) external returns (bytes32 txHash)
```

**Verify Evidence:**
```solidity
function verifyEvidence(
  string calldata evidenceId
) external view returns (
  bytes32 fileHash,
  string calldata ipfsCID,
  uint256 timestamp,
  address uploader,
  bool exists
)
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  fullName VARCHAR(255),
  organization VARCHAR(255),
  passwordHash VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Evidence Table
```sql
CREATE TABLE evidence (
  id UUID PRIMARY KEY,
  evidenceId VARCHAR(20) UNIQUE NOT NULL,
  userId UUID NOT NULL REFERENCES users(id),
  fileName VARCHAR(255),
  fileSize BIGINT,
  hash VARCHAR(64) NOT NULL,
  cid VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  blockchainTx VARCHAR(255),
  blockNumber BIGINT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evidenceId (evidenceId),
  INDEX idx_userId (userId),
  INDEX idx_status (status)
);
```

---

## 🧪 Testing the API

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3001`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "test@agency.gov",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "organization": "Test Agency"
  }'
```

**Upload:**
```bash
curl -X POST http://localhost:3001`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/evidence.jpg"
```

**Verify:**
```bash
curl -X GET http://localhost:3001`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/EV-2024-000001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Rate Limiting (Recommended)

Implement rate limiting to prevent abuse:
- 5 requests per minute for authentication endpoints
- 10 requests per minute for upload endpoint
- 30 requests per minute for verification endpoint
- 50 requests per minute for list endpoint

---

## 🔐 Security Best Practices

1. **Use HTTPS** in production
2. **Validate all inputs** server-side
3. **Implement CORS** appropriately
4. **Use secure JWT secrets** (min 32 characters)
5. **Hash passwords** with bcrypt or similar
6. **Implement rate limiting** to prevent brute force
7. **Log all API requests** for auditing
8. **Use parameterized queries** to prevent SQL injection
9. **Validate file uploads** (size, type, content)
10. **Implement timeout** for long operations

---

**B-CEL Backend API Specification v1.0**
