#!/bin/bash

# Blockchain Evidence Locker - Quick Start Script for macOS
# This script helps you start all services in the correct order

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check if MongoDB is running
check_mongodb() {
    if brew services list | grep -q "mongodb-community.*started"; then
        print_success "MongoDB is running"
        return 0
    else
        print_warning "MongoDB is not running. Starting MongoDB..."
        brew services start mongodb-community
        sleep 2
        print_success "MongoDB started"
        return 0
    fi
}

# Check if IPFS daemon is running
check_ipfs() {
    if lsof -i :5001 >/dev/null 2>&1; then
        print_success "IPFS daemon is running"
        return 0
    else
        print_warning "IPFS daemon is not running!"
        echo ""
        echo "  Please start IPFS in a new terminal:"
        echo "  ${GREEN}ipfs daemon${NC}"
        echo ""
        read -p "Press Enter once IPFS daemon is running..."
        return 0
    fi
}

# Check if Ganache is running
check_ganache() {
    if lsof -i :8545 >/dev/null 2>&1; then
        print_success "Ganache is running"
        return 0
    else
        print_warning "Ganache is not running!"
        echo ""
        echo "  Please start Ganache in a new terminal:"
        echo "  ${GREEN}cd backend/blockchain && npx ganache --port 8545${NC}"
        echo ""
        read -p "Press Enter once Ganache is running..."
        return 0
    fi
}

# Main
print_header "🚀 Starting Blockchain Evidence Locker"

# Check prerequisites
print_info "Checking prerequisites..."
check_mongodb
check_ipfs
check_ganache

# Check if smart contract is deployed
if [ ! -f "backend/blockchain/deployment-info.json" ]; then
    print_warning "Smart contract not deployed yet!"
    echo ""
    echo "  Please deploy the smart contract in a new terminal:"
    echo "  ${GREEN}cd backend/blockchain && node scripts/deploy_manual.js${NC}"
    echo ""
    read -p "Press Enter once smart contract is deployed..."
fi

print_success "All prerequisites are ready!"
echo ""

# Ask what to start
echo "What would you like to start?"
echo ""
echo "  1) Backend only"
echo "  2) Frontend only"
echo "  3) Both Backend and Frontend (in separate terminals)"
echo "  4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Starting Backend..."
        cd backend
        node server.js
        ;;
    2)
        print_info "Starting Frontend..."
        npm run dev
        ;;
    3)
        print_info "Starting Backend and Frontend in separate terminals..."
        
        # Start backend in new terminal
        osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'/backend\" && node server.js"'
        
        # Wait a bit for backend to start
        sleep 3
        
        # Start frontend in new terminal
        osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'\" && npm run dev"'
        
        print_success "Backend and Frontend started in new terminals!"
        echo ""
        print_info "Access the application at: ${GREEN}http://localhost:3000${NC}"
        ;;
    4)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_warning "Invalid choice. Exiting..."
        exit 1
        ;;
esac
