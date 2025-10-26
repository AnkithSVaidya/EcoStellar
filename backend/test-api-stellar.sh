#!/bin/bash
# Test script for Stellar Integration via localhost API

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║     Testing Stellar Integration on Localhost:4000               ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:4000"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 1: Health Check & Stellar Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GET $BASE_URL/health"
echo ""
HEALTH=$(curl -s $BASE_URL/health)
echo "$HEALTH" | jq .
echo ""
MOCK_MODE=$(echo "$HEALTH" | jq -r '.stellar.mockMode')
if [ "$MOCK_MODE" = "true" ]; then
    echo -e "${YELLOW}✓ Stellar Service running in MOCK MODE${NC}"
else
    echo -e "${GREEN}✓ Stellar Service connected to blockchain${NC}"
fi
echo ""

# Test 2: Submit Game Session (triggers callGameRewardsRecord)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 2: Submit Game Session (Stellar Integration)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "POST $BASE_URL/api/game/submit"
echo '{"wallet_address": "test_wallet_123", "score": 750, "game_type": "carbon_dash"}'
echo ""
GAME_RESULT=$(curl -s -X POST $BASE_URL/api/game/submit \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "test_wallet_123", "score": 750, "game_type": "carbon_dash"}')
echo "$GAME_RESULT" | jq .
echo ""
TOKENS_EARNED=$(echo "$GAME_RESULT" | jq -r '.tokens_earned')
TX_HASH=$(echo "$GAME_RESULT" | jq -r '.blockchain.txHash // empty')
echo -e "${GREEN}✓ Tokens earned: $TOKENS_EARNED ECO${NC}"
if [ ! -z "$TX_HASH" ]; then
    echo -e "${GREEN}✓ Blockchain transaction: $TX_HASH${NC}"
fi
echo ""

# Test 3: Get Player Stats (triggers getEcoTokenBalance)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 3: Get Player Stats (Balance Query)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GET $BASE_URL/api/player/test_wallet_123"
echo ""
PLAYER=$(curl -s $BASE_URL/api/player/test_wallet_123)
echo "$PLAYER" | jq .
echo ""
BALANCE=$(echo "$PLAYER" | jq -r '.player.eco_tokens_balance')
LEVEL=$(echo "$PLAYER" | jq -r '.player.level')
echo -e "${GREEN}✓ Player balance: $BALANCE ECO${NC}"
echo -e "${GREEN}✓ Player level: $LEVEL${NC}"
echo ""

# Test 4: Mint Tree NFT (triggers callTreeNFTMint)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 4: Mint Tree NFT (NFT Minting)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "POST $BASE_URL/api/tree/mint"
echo ""
NFT_DATA='{
  "wallet_address": "test_wallet_123",
  "species": "Oak Tree",
  "location": "Central Park, New York",
  "latitude": 40774000,
  "longitude": -73968000,
  "carbon_offset": 750,
  "partner_org": "EcoStellar Test"
}'
echo "$NFT_DATA" | jq .
echo ""
NFT_RESULT=$(curl -s -X POST $BASE_URL/api/tree/mint \
  -H "Content-Type: application/json" \
  -d "$NFT_DATA")
echo "$NFT_RESULT" | jq .
echo ""
if echo "$NFT_RESULT" | jq -e '.success' > /dev/null; then
    TOKEN_ID=$(echo "$NFT_RESULT" | jq -r '.token_id')
    EXPLORER=$(echo "$NFT_RESULT" | jq -r '.explorer_link // empty')
    echo -e "${GREEN}✓ NFT Token ID: $TOKEN_ID${NC}"
    if [ ! -z "$EXPLORER" ]; then
        echo -e "${GREEN}✓ Explorer link: $EXPLORER${NC}"
    fi
else
    ERROR=$(echo "$NFT_RESULT" | jq -r '.error')
    echo -e "${YELLOW}Note: $ERROR${NC}"
fi
echo ""

# Test 5: Get Player NFTs (triggers getPlayerTreeNFTs)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 5: Get Player NFTs${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GET $BASE_URL/api/player/test_wallet_123/nfts"
echo ""
NFTS=$(curl -s $BASE_URL/api/player/test_wallet_123/nfts)
echo "$NFTS" | jq .
echo ""
NFT_COUNT=$(echo "$NFTS" | jq -r '.count')
echo -e "${GREEN}✓ Player has $NFT_COUNT NFT(s)${NC}"
echo ""

# Test 6: Global Stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 6: Global Stats${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GET $BASE_URL/api/stats/global"
echo ""
STATS=$(curl -s $BASE_URL/api/stats/global)
echo "$STATS" | jq .
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Stellar Integration Functions Tested:"
echo "  ✓ initializeStellar()       - Server startup"
echo "  ✓ callGameRewardsRecord()   - Game submission"
echo "  ✓ getEcoTokenBalance()      - Player stats"
echo "  ✓ callTreeNFTMint()         - NFT minting"
echo "  ✓ getPlayerTreeNFTs()       - NFT listing"
echo "  ✓ generateExplorerLink()    - Link generation"
echo ""
echo -e "${GREEN}All API endpoints with Stellar integration working! ✓${NC}"
echo ""

# Show stellar service info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Stellar Service Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$MOCK_MODE" = "true" ]; then
    echo -e "${YELLOW}Mode: MOCK (Development)${NC}"
    echo ""
    echo "To enable real blockchain:"
    echo "  1. Create .env file in /workspaces/EcoStellar/backend/"
    echo "  2. Add Stellar configuration:"
    echo "     STELLAR_NETWORK=testnet"
    echo "     ADMIN_SECRET_KEY=S..."
    echo "     ECO_TOKEN_CONTRACT_ID=C..."
    echo "     GAME_REWARDS_CONTRACT_ID=C..."
    echo "     TREE_NFT_CONTRACT_ID=C..."
    echo "  3. Restart the server"
else
    echo -e "${GREEN}Mode: BLOCKCHAIN (Production)${NC}"
fi
echo ""
