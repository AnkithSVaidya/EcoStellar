#!/bin/bash
# EcoToken Deployment Script
# This script helps deploy and interact with the EcoToken contract using Docker

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}EcoToken Deployment Script${NC}"
echo "================================"

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Use Stellar CLI via Docker
STELLAR="docker run --rm -it -v $(pwd):/workspace -w /workspace stellar/quickstart:testing stellar"

# Function to show usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       - Build the contract"
    echo "  optimize    - Optimize the WASM file"
    echo "  network     - Configure testnet network"
    echo "  keys        - Generate admin keys"
    echo "  fund        - Fund the admin account"
    echo "  deploy      - Deploy the contract"
    echo "  init        - Initialize the contract"
    echo "  mint        - Mint tokens"
    echo "  balance     - Check balance"
    echo "  help        - Show this help"
    exit 1
}

# Build the contract
build() {
    echo -e "${BLUE}Building contract...${NC}"
    cargo build --target wasm32-unknown-unknown --release
    echo -e "${GREEN}✓ Build complete!${NC}"
}

# Optimize WASM
optimize() {
    echo -e "${BLUE}Optimizing WASM...${NC}"
    if [ ! -f "target/wasm32-unknown-unknown/release/eco_token.wasm" ]; then
        echo -e "${RED}WASM file not found. Run 'build' first.${NC}"
        exit 1
    fi
    
    $STELLAR contract optimize \
        --wasm target/wasm32-unknown-unknown/release/eco_token.wasm
    
    echo -e "${GREEN}✓ Optimization complete!${NC}"
}

# Configure network
configure_network() {
    echo -e "${BLUE}Configuring testnet network...${NC}"
    $STELLAR network add \
        --global testnet \
        --rpc-url https://soroban-testnet.stellar.org:443 \
        --network-passphrase "Test SDF Network ; September 2015"
    echo -e "${GREEN}✓ Network configured!${NC}"
}

# Generate keys
generate_keys() {
    echo -e "${BLUE}Generating admin keys...${NC}"
    $STELLAR keys generate --global admin --network testnet
    
    ADMIN_ADDRESS=$($STELLAR keys address admin)
    echo -e "${GREEN}✓ Keys generated!${NC}"
    echo -e "Admin address: ${GREEN}${ADMIN_ADDRESS}${NC}"
}

# Fund account
fund_account() {
    echo -e "${BLUE}Funding admin account...${NC}"
    $STELLAR keys fund admin --network testnet
    echo -e "${GREEN}✓ Account funded!${NC}"
}

# Deploy contract
deploy_contract() {
    echo -e "${BLUE}Deploying contract...${NC}"
    
    if [ ! -f "target/wasm32-unknown-unknown/release/eco_token.optimized.wasm" ]; then
        echo -e "${RED}Optimized WASM not found. Run 'optimize' first.${NC}"
        exit 1
    fi
    
    CONTRACT_ID=$($STELLAR contract deploy \
        --wasm target/wasm32-unknown-unknown/release/eco_token.optimized.wasm \
        --source admin \
        --network testnet)
    
    echo -e "${GREEN}✓ Contract deployed!${NC}"
    echo -e "Contract ID: ${GREEN}${CONTRACT_ID}${NC}"
    echo ""
    echo "Save this contract ID! Add it to your environment:"
    echo "export CONTRACT_ID=${CONTRACT_ID}"
}

# Main script
case "$1" in
    build)
        build
        ;;
    optimize)
        optimize
        ;;
    network)
        configure_network
        ;;
    keys)
        generate_keys
        ;;
    fund)
        fund_account
        ;;
    deploy)
        deploy_contract
        ;;
    help|*)
        usage
        ;;
esac
