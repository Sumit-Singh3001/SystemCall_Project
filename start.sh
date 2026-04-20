#!/bin/bash

# ─────────────────────────────────────────────────────────────
#  SysCall App — Quick Start Script
#  Usage: bash start.sh
# ─────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║   SysCall — Secure System Call Interface  ║${NC}"
echo -e "${CYAN}  ║            by Arvika Tech                 ║${NC}"
echo -e "${CYAN}  ╚══════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"

if [ "$NODE_VER" -ge 22 ]; then
  echo -e "${YELLOW}⚠️  Node 22+ detected — setting openssl-legacy-provider${NC}"
  export NODE_OPTIONS=--openssl-legacy-provider
fi

# Install backend deps
echo ""
echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
cd backend && npm install --silent
echo -e "${GREEN}✓ Backend ready${NC}"

# Install frontend deps
echo ""
echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
cd ../frontend && npm install --legacy-peer-deps --silent
echo -e "${GREEN}✓ Frontend ready${NC}"

echo ""
echo -e "${GREEN}🚀 Starting servers...${NC}"
echo -e "   Backend  → ${CYAN}http://localhost:5000${NC}"
echo -e "   Frontend → ${CYAN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}👤 Demo: admin/password (admin) | user/password (user)${NC}"
echo ""

# Start backend in background
cd ../backend && node server.js &
BACKEND_PID=$!

# Small delay then start frontend
sleep 2
cd ../frontend && npm start

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
