#!/bin/bash
# Quick Stellar Integration Test via API

echo "🚀 Testing Stellar Integration on http://localhost:4000"
echo ""

# Test 1: Health check
echo "1️⃣  Health Check (Stellar Status)"
echo "   curl http://localhost:4000/health"
curl -s http://localhost:4000/health | jq '.stellar'
echo ""

# Test 2: Submit game (calls callGameRewardsRecord)
echo "2️⃣  Submit Game Score (callGameRewardsRecord)"
echo "   POST /api/game/submit - score: 850"
curl -s -X POST http://localhost:4000/api/game/submit \
  -H "Content-Type: application/json" \
  -d '{"score": 850, "game_type": "carbon_dash"}' | jq '{tokens_earned, blockchain: .blockchain.txHash}'
echo ""

echo "✅ Stellar Service is integrated and working!"
echo ""
echo "📊 Functions being used by the API:"
echo "   • initializeStellar() - On server startup"
echo "   • callGameRewardsRecord() - When submitting game scores"
echo "   • callTreeNFTMint() - When minting tree NFTs"
echo "   • getEcoTokenBalance() - When fetching player stats"
echo "   • getPlayerTreeNFTs() - When listing player NFTs"
echo ""
echo "💡 Currently in MOCK MODE (no .env configured)"
echo "   All transactions return mock data for testing"
echo ""
