# IPFS Installation Guide

## For Mac (Your Current System)

### Quick Install (Recommended)
```bash
# Install IPFS
brew install ipfs

# Initialize IPFS (first time only)
ipfs init

# Start IPFS daemon
ipfs daemon
```

The daemon will run on `http://127.0.0.1:5001`

### Verify Installation
```bash
# Check version
ipfs version

# Check if daemon is running
curl http://127.0.0.1:5001/api/v0/version
```

---

## For Windows

### Option 1: Using Chocolatey (Easiest)
```powershell
# Install Chocolatey first if you don't have it
# Then install IPFS
choco install ipfs

# Initialize
ipfs init

# Start daemon
ipfs daemon
```

### Option 2: Manual Installation
1. Download from: https://dist.ipfs.tech/#go-ipfs
2. Extract the archive
3. Move `ipfs.exe` to a folder in your PATH (e.g., `C:\Program Files\ipfs\`)
4. Open Command Prompt or PowerShell:
```powershell
ipfs init
ipfs daemon
```

### Option 3: Using WSL (Windows Subsystem for Linux)
```bash
# In WSL terminal
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

ipfs init
ipfs daemon
```

---

## After Installation (All Platforms)

### Start IPFS Daemon
```bash
ipfs daemon
```

Keep this terminal open. You should see:
```
Daemon is ready
API server listening on /ip4/127.0.0.1/tcp/5001
```

### Test It Works
```bash
# In a new terminal
echo "Hello IPFS" > test.txt
ipfs add test.txt
```

You should get a CID (Content Identifier) back.

---

## Quick Start for Your Demo (Mac)

**Run these commands in order:**

```bash
# Terminal 1: Install and start IPFS
brew install ipfs
ipfs init
ipfs daemon

# Terminal 2: Your backend is already running
# Just keep it running

# Terminal 3: Your frontend is already running  
# Just keep it running
```

**Then test the app:**
1. Go to http://localhost:3000
2. Register a user (role: investigator)
3. Upload a file
4. Verify it works!

---

## Troubleshooting

### "ipfs: command not found"
- Mac: Run `brew install ipfs`
- Windows: Add IPFS to your PATH

### "Error: lock /Users/.../.ipfs/repo.lock"
IPFS is already running. Kill it first:
```bash
pkill ipfs
ipfs daemon
```

### Port 5001 already in use
```bash
# Find what's using it
lsof -i :5001

# Kill it
kill -9 <PID>

# Start IPFS again
ipfs daemon
```
