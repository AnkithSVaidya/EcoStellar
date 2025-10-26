#!/bin/bash
# GameRewards Deployment and Interaction Script

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}GameRewards Contract Helper${NC}"
echo "============================"
echo ""

# Check if CONTRACT_ID is set
check_contract_id() {
    if [ -z "$GAME_REWARDS_ID" ]; then
        echo -e "${RED}Error: GAME_REWARDS_ID not set${NC}"
        echo "Please set your contract ID:"
        echo "  export GAME_REWARDS_ID=CXXXXXXXXX..."
        exit 1
    fi
}

# Check if ECO_TOKEN_ID is set
check_eco_token_id() {
    if [ -z "$ECO_TOKEN_ID" ]; then
        echo -e "${RED}Error: ECO_TOKEN_ID not set${NC}"
        echo "Please set your EcoToken contract ID:"
        echo "  export ECO_TOKEN_ID=CXXXXXXXXX..."
        exit 1
    fi
}

# Show usage
usage() {
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  ${GREEN}deploy${NC}                - Deploy GameRewards contract"
    echo "  ${GREEN}init${NC}                  - Initialize contract"
    echo "  ${GREEN}record${NC} <player> <score> <type> - Record game session"
    echo "  ${GREEN}stats${NC} <player>        - Get player statistics"
    echo "  ${GREEN}session${NC} <id>          - Get session details"
    echo "  ${GREEN}total${NC}                 - Get total sessions"
    echo "  ${GREEN}link${NC}                  - Get linked EcoToken contract"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 init"
    echo "  $0 record \$(stellar keys address player1) 750 quest"
    echo "  $0 stats GXXXXXXX..."
    echo "  $0 session 1"
    echo ""
}

# Deploy contract
cmd_deploy() {
    echo -e "${BLUE}Deploying GameRewards contract...${NC}"
    
    WASM="target/wasm32-unknown-unknown/release/game_rewards.optimized.wasm"
    if [ ! -f "$WASM" ]; then
        echo -e "${RED}Error: Optimized WASM not found${NC}"
        echo "Run: stellar contract optimize --wasm target/wasm32-unknown-unknown/release/game_rewards.wasm"
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
    echo -e "${YELLOW}export GAME_REWARDS_ID=${CONTRACT_ID}${NC}"
    echo ""
    echo "Next step: Run '${YELLOW}$0 init${NC}' to initialize the contract"
}

# Initialize contract
cmd_init() {
    check_contract_id
    check_eco_token_id
    
    echo -e "${BLUE}Initializing GameRewards contract...${NC}"
    echo -e "EcoToken: ${ECO_TOKEN_ID}"
    
    ADMIN_ADDR=$(stellar keys address admin)
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        initialize \
        --admin "$ADMIN_ADDR" \
        --eco_token_contract "$ECO_TOKEN_ID"
    
    echo -e "${GREEN}✓ Contract initialized!${NC}"
    echo -e "Admin: ${ADMIN_ADDR}"
    echo -e "Linked to EcoToken: ${ECO_TOKEN_ID}"
}

# Record game session
cmd_record() {
    check_contract_id
    
    if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
        echo "Usage: $0 record <player_address> <score> <game_type>"
        echo "Example: $0 record GXXXXXX... 750 quest"
        exit 1
    fi
    
    PLAYER=$1
    SCORE=$2
    GAME_TYPE=$3
    
    echo -e "${BLUE}Recording game session...${NC}"
    echo -e "Player: ${PLAYER}"
    echo -e "Score: ${SCORE}"
    echo -e "Game Type: ${GAME_TYPE}"
    
    # Calculate expected tokens (score / 10)
    EXPECTED_TOKENS=$((SCORE / 10))
    if [ $SCORE -lt 50 ]; then
        EXPECTED_TOKENS=0
    elif [ $EXPECTED_TOKENS -gt 1000 ]; then
        EXPECTED_TOKENS=1000
    fi
    
    echo -e "Expected reward: ${YELLOW}${EXPECTED_TOKENS} ECO${NC}"
    echo ""
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        record_game_session \
        --player "$PLAYER" \
        --score "$SCORE" \
        --game_type "$GAME_TYPE"
    
    echo -e "${GREEN}✓ Game session recorded!${NC}"
}

# Get player stats
cmd_stats() {
    check_contract_id
    
    if [ -z "$1" ]; then
        echo "Usage: $0 stats <player_address>"
        exit 1
    fi
    
    PLAYER=$1
    
    echo -e "${BLUE}Player Statistics for ${PLAYER}${NC}"
    echo ""
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        get_player_stats \
        --player "$PLAYER"
}

# Get session details
cmd_session() {
    check_contract_id
    
    if [ -z "$1" ]; then
        echo "Usage: $0 session <session_id>"
        exit 1
    fi
    
    SESSION_ID=$1
    
    echo -e "${BLUE}Session #${SESSION_ID} Details${NC}"
    echo ""
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        get_game_session \
        --session_id "$SESSION_ID"
}

# Get total sessions
cmd_total() {
    check_contract_id
    
    echo -e "${BLUE}Total Sessions Recorded${NC}"
    echo ""
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        get_total_sessions
}

# Get linked EcoToken contract
cmd_link() {
    check_contract_id
    
    echo -e "${BLUE}Linked EcoToken Contract${NC}"
    echo ""
    
    stellar contract invoke \
        --id "$GAME_REWARDS_ID" \
        --source admin \
        --network testnet \
        -- \
        get_eco_token_contract
}

# Main
case "$1" in
    deploy)
        cmd_deploy
        ;;
    init)
        cmd_init
        ;;
    record)
        cmd_record "$2" "$3" "$4"
        ;;
    stats)
        cmd_stats "$2"
        ;;
    session)
        cmd_session "$2"
        ;;
    total)
        cmd_total
        ;;
    link)
        cmd_link
        ;;
    help|*)
        usage
        ;;
esac
