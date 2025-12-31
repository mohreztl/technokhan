#!/bin/bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== AutoLounge Docker Quick Start ===${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker version > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}.env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Please edit .env file and set these values:${NC}"
    echo -e "${NC}  - POSTGRES_PASSWORD${NC}"
    echo -e "${NC}  - JWT_SECRET${NC}"
    echo -e "${NC}  - SMS_API_KEY${NC}"
    echo -e "${NC}  - SMS_API_SECRET${NC}"
    echo ""
    
    read -p "Continue with default settings? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Please edit .env file and run this script again${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${CYAN}Building and starting containers...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"
echo ""

docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ AutoLounge started successfully!${NC}"
    echo ""
    echo -e "${CYAN}=== Access Links ===${NC}"
    echo -e "${NC}  Website:  http://localhost:3000${NC}"
    echo -e "${NC}  API:      http://localhost:5000${NC}"
    echo -e "${NC}  Database: localhost:5432${NC}"
    echo ""
    echo -e "${YELLOW}View logs: docker-compose logs -f${NC}"
    echo -e "${YELLOW}Stop services: docker-compose down${NC}"
    echo ""
    echo -e "${CYAN}For more commands: make help${NC}"
else
    echo ""
    echo -e "${RED}✗ Error starting Docker${NC}"
    echo -e "${YELLOW}Please check logs with:${NC}"
    echo -e "${NC}  docker-compose logs${NC}"
fi
