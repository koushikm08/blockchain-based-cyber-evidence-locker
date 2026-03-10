# Blockchain-Based Cyber Evidence Locker

A secure, decentralized evidence management system using blockchain technology, IPFS, and role-based access control.

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js v18+
- MongoDB
- IPFS
- npm/yarn

### Windows Users 🪟

**For Windows systems, we provide automated IPFS installation scripts:**

- **PowerShell (Recommended)**: Run `setup-ipfs-windows.ps1` as Administrator
- **Batch File**: Run `setup-ipfs-windows.bat` as Administrator
- **Full Guide**: See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed instructions

The scripts automatically handle:
- IPFS download and installation
- PATH configuration
- Repository initialization
- Daemon startup with retry logic


### Run with VS Code Tasks

1. Install dependencies: `Tasks: Run Task` → `📦 Install All Dependencies`
2. Start all services: `Tasks: Run Task` → `🚀 Start All Services`
3. Access the app at `http://localhost:3000`

## 🎯 Features

- **Blockchain Integration**: Ethereum smart contracts for immutable evidence records
- **IPFS Storage**: Decentralized file storage with content addressing
- **Hash Verification**: SHA-256 cryptographic integrity checks
- **Role-Based Access Control**: Admin, Investigator, Law Enforcement, Public roles
- **Tamper Detection**: Automatic detection of file modifications
- **Audit Trail**: Complete transaction history on blockchain

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  MongoDB    │
│  (Next.js)  │     │  (Express)   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├────▶ IPFS (File Storage)
                           │
                           └────▶ Ganache (Blockchain)
```

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete installation and configuration
- [Windows Setup](./WINDOWS_SETUP.md) - Automated IPFS setup for Windows
- [IPFS Installation](./INSTALL_IPFS.md) - IPFS installation for all platforms
- [API Documentation](.`${process.env.NEXT_PUBLIC_API_URL}/api.md) - REST API endpoints (coming soon)
- [Smart Contract](./backend/blockchain/contracts/EvidenceLocker.sol) - Solidity contract


## 🔐 Security

This project implements multiple layers of security:
- JWT authentication
- Role-based authorization
- Cryptographic hashing (SHA-256)
- Blockchain immutability
- Decentralized storage

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 🐛 Issues

Found a bug? Please open an issue with detailed reproduction steps.
