#!/bin/bash
# EcoToken CLI Helper
# Quick commands for interacting with your EcoToken contract

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if CONTRACT_ID is set
check_contract_id() {
    if [ -z "$CONTRACT_ID" ]; then
        echo -e "${RED}Error: CONTRACT_ID not set${NC}"
        echo "Please set your contract ID:"
        echo "  export CONTRACT_ID=CXXXXXXXXX..."
        exit 1
    fi
}

# Show usage
usage() {
    echo -e "${BLUE}EcoToken CLI Helper${NC}"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  ${GREEN}setup${NC}           - Initial setup (network, keys, fund)"
    echo "  ${GREEN}deploy${NC}          - Deploy the contract"
    echo "  ${GREEN}init${NC}            - Initialize contract with admin"
    echo "  ${GREEN}mint${NC} <to> <amt> - Mint tokens (amount in ECO, not raw)"
    echo "  ${GREEN}balance${NC} <addr>  - Check balance"
    echo "  ${GREEN}supply${NC}          - Get total supply"
    echo "  ${GREEN}transfer${NC} <from> <to> <amt> - Transfer tokens"
    echo "  ${GREEN}info${NC}            - Show token info (name, symbol, decimals)"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 deploy"
    echo "  $0 mint \$(stellar keys address admin) 1000"
    echo "  $0 balance GXXXXXXX..."
    echo ""
}

# Convert ECO amount to contract amount (multiply by 10^7)
to_contract_amount() {
    echo $(($1 * 10000000))
}

# Convert contract amount to ECO (divide by 10^7)
to_eco_amount() {
    python3 -c "print($1 / 10000000)"
}

# Setup: network, keys, fund
cmd_setup() {
    echo -e "${BLUE}Setting up EcoToken environment...${NC}"
    
    echo -e "\n${YELLOW}1. Adding testnet network...${NC}"
    stellar network add \
        --global testnet \
        --rpc-url https://soroban-testnet.stellar.org:443 \
        --network-passphrase "Test SDF Network ; September 2015" || true
    
    echo -e "\n${YELLOW}2. Generating admin keys...${NC}"
    stellar keys generate --global admin --network testnet || true
    
    ADMIN_ADDR=$(stellar keys address admin)
    echo -e "${GREEN}Admin address: ${ADMIN_ADDR}${NC}"
    
    echo -e "\n${YELLOW}3. Funding admin account...${NC}"
    stellar keys fund admin --network testnet
    
    echo -e "\n${GREEN}✓ Setup complete!${NC}"
    echo -e "Next step: Run '${YELLOW}$0 deploy${NC}' to deploy the contract"
}

# Deploy contract
cmd_deploy() {
    echo -e "${BLUE}Deploying EcoToken contract...${NC}"
    
    WASM="target/wasm32-unknown-unknown/release/eco_token.optimized.wasm"
    if [ ! -f "$WASM" ]; then
        echo -e "${RED}Error: Optimized WASM not found${NC}"
        echo "Run: stellar contract optimize --wasm target/wasm32-unknown-unknown/release/eco_token.wasm"
        exit 1
    fi
    
    CONTRACT_ID=$(stellar contract deploy \
        --wasm "$WASM" \
        --source admin \
        --network testnet)
    
    echo -e "\n${GREEN}✓ Contract deployed!${NC}"
    echo -e "Contract ID: ${GREEN}${CONTRACT_ID}${NC}"
    echo ""
    echo "Save this to your environment:"
    echo -e "${YELLOW}export CONTRACT_ID=${CONTRACT_ID}${NC}"
    echo ""
    echo "Next step: Run '${YELLOW}$0 init${NC}' to initialize the contract"
}

# Initialize contract
cmd_init() {
    check_contract_id
    
    echo -e "${BLUE}Initializing contract...${NC}"
    
    ADMIN_ADDR=$(stellar keys address admin)
    
    stellar contract invoke \
        --id "$CONTRACT_ID" \
        --source admin \
        --network testnet \
        -- \
        initialize \
        --admin "$ADMIN_ADDR"
    
    echo -e "${GREEN}✓ Contract initialized with admin: ${ADMIN_ADDR}${NC}"
    echo "Next step: Mint some tokens with '${YELLOW}$0 mint <address> <amount>${NC}'"
}

# Mint tokens
cmd_mint() {
    check_contract_id
    
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Usage: $0 mint <to_address> <amount_in_eco>"
        echo "Example: $0 mint GXXXXXX... 1000"
        exit 1
    fi
    
    TO=$1
    AMOUNT_ECO=$2
    AMOUNT_RAW=$(to_contract_amount $AMOUNT_ECO)
    
    echo -e "${BLUE}Minting ${AMOUNT_ECO} ECO (${AMOUNT_RAW} raw) to ${TO}...${NC}"
    
    stellar contract invoke \
        --id "$CONTRACT_ID" \
        --source admin \
        --network testnet \
        -- \
        mint \
        --to "$TO" \
        --amount "$AMOUNT_RAW"
    
    echo -e "${GREEN}✓ Minted ${AMOUNT_ECO} ECO tokens${NC}"
}

# Check balance
cmd_balance() {
    check_contract_id
    
    if [ -z "$1" ]; then
        echo "Usage: $0 balance <address>"
        exit 1
    fi
    
    ADDR=$1
    
    BALANCE_RAW=$(stellar contract invoke \
        --id "$CONTRACT_ID" \
        --network testnet \
        -- \
        balance \
        --address "$ADDR")
    
    BALANCE_ECO=$(to_eco_amount $BALANCE_RAW)
    
    echo -e "${GREEN}Balance: ${BALANCE_ECO} ECO${NC} (${BALANCE_RAW} raw)"
}

# Get total supply
cmd_supply() {
    check_contract_id
    
    SUPPLY_RAW=$(stellar contract invoke \
        --id "$CONTRACT_ID" \
        --network testnet \
        -- \
        get_total_supply)
    
    SUPPLY_ECO=$(to_eco_amount $SUPPLY_RAW)
    
    echo -e "${GREEN}Total Supply: ${SUPPLY_ECO} ECO${NC} (${SUPPLY_RAW} raw)"
}

# Transfer tokens
cmd_transfer() {
    check_contract_id
    
    if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
        echo "Usage: $0 transfer <from_address> <to_address> <amount_in_eco>"
        exit 1
    fi
    
    FROM=$1
    TO=$2
    AMOUNT_ECO=$3
    AMOUNT_RAW=$(to_contract_amount $AMOUNT_ECO)
    
    echo -e "${BLUE}Transferring ${AMOUNT_ECO} ECO from ${FROM} to ${TO}...${NC}"
    
    stellar contract invoke \
        --id "$CONTRACT_ID" \
        --source admin \
        --network testnet \
        -- \
        transfer \
        --from "$FROM" \
        --to "$TO" \
        --amount "$AMOUNT_RAW"
    
    echo -e "${GREEN}✓ Transferred ${AMOUNT_ECO} ECO${NC}"
}

# Show token info
cmd_info() {
    check_contract_id
    
    echo -e "${BLUE}EcoToken Information${NC}"
    echo "===================="
    
    NAME=$(stellar contract invoke --id "$CONTRACT_ID" --network testnet -- name)
    SYMBOL=$(stellar contract invoke --id "$CONTRACT_ID" --network testnet -- symbol)
    DECIMALS=$(stellar contract invoke --id "$CONTRACT_ID" --network testnet -- decimals)
    
    echo -e "Name:     ${GREEN}${NAME}${NC}"
    echo -e "Symbol:   ${GREEN}${SYMBOL}${NC}"
    echo -e "Decimals: ${GREEN}${DECIMALS}${NC}"
    echo -e "Contract: ${GREEN}${CONTRACT_ID}${NC}"
}

# Main
case "$1" in
    setup)
        cmd_setup
        ;;
    deploy)
        cmd_deploy
        ;;
    init)
        cmd_init
        ;;
    mint)
        cmd_mint "$2" "$3"
        ;;
    balance)
        cmd_balance "$2"
        ;;
    supply)
        cmd_supply
        ;;
    transfer)
        cmd_transfer "$2" "$3" "$4"
        ;;
    info)
        cmd_info
        ;;
    *)
        usage
        ;;
esac
