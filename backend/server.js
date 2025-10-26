require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const { db, initializeDatabase } = require('./database');
const stellarService = require('./stellar-service');

/**
 * EcoStellar Backend API Server
 * 
 * Provides REST API endpoints for:
 * - Game session management
 * - Player stats and profiles
 * - Tree NFT minting
 * - Blockchain integration with Stellar
 */

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== Middleware ====================

// Security headers
app.use(helmet());

// CORS configuration
// In development allow the Vite dev server(s). You can set CORS_ORIGIN in .env to restrict in production.
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV !== 'production' ? true : 'http://localhost:3000'),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==================== Validation Schemas ====================

const schemas = {
  submitGame: Joi.object({
    wallet_address: Joi.string().min(3).max(100).optional().default('guest'),
    score: Joi.number().integer().min(0).max(1000000).required(),
    game_type: Joi.string().valid('carbon_dash').default('carbon_dash')
  }),
  
  mintTree: Joi.object({
    wallet_address: Joi.string().min(3).max(100).optional().default('guest'),
    species: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(200).required(),
    latitude: Joi.number().integer().min(-90000000).max(90000000).required(),
    longitude: Joi.number().integer().min(-180000000).max(180000000).required(),
    carbon_offset: Joi.number().integer().min(0).default(500),
    partner_org: Joi.string().max(200).default('EcoStellar'),
    image_url: Joi.string().uri().optional()
  }),
  
  walletAddress: Joi.string().min(3).max(100).optional().default('guest')
};

// ==================== Helper Functions ====================

/**
 * Calculate player level based on total score
 */
const calculateLevel = (totalScore) => {
  return Math.floor(Math.sqrt(totalScore / 100)) + 1;
};

/**
 * Ensure player exists in database
 */
const ensurePlayerExists = (walletAddress) => {
  const player = db.prepare('SELECT * FROM players WHERE wallet_address = ?').get(walletAddress);
  
  if (!player) {
    db.prepare(`
      INSERT INTO players (wallet_address)
      VALUES (?)
    `).run(walletAddress);
    
    return db.prepare('SELECT * FROM players WHERE wallet_address = ?').get(walletAddress);
  }
  
  return player;
};

// ==================== API Routes ====================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stellar: {
      network: process.env.STELLAR_NETWORK || 'testnet',
      mockMode: stellarService.mockMode
    }
  });
});

/**
 * POST /api/game/submit
 * Submit a game session and earn tokens
 */
app.post('/api/game/submit', async (req, res) => {
  try {
    // Validate request
    const { error, value } = schemas.submitGame.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { wallet_address, score, game_type } = value;
    
    // Allow guest users (for hackathon/demo purposes)
    // If no wallet or invalid format, treat as guest
    const isGuest = !wallet_address || wallet_address === 'guest' || !stellarService.isValidAddress(wallet_address);
    const playerWallet = isGuest ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : wallet_address;
    
    // Calculate tokens earned (1 token per 10 points)
    const tokensEarned = Math.floor(score / 10);
    
    // Ensure player exists
    ensurePlayerExists(playerWallet);
    
    // Record session on blockchain (skip if guest)
    let blockchainResult = { success: true, mock: true };
    if (!isGuest) {
      blockchainResult = await stellarService.callGameRewardsRecord(
        playerWallet,
        score,
        game_type
      );
    }
    
    // Save session to database
    const session = db.prepare(`
      INSERT INTO game_sessions (player_wallet, score, tokens_earned, game_type)
      VALUES (?, ?, ?, ?)
    `).run(playerWallet, score, tokensEarned, game_type);
    
    // Update player stats
    db.prepare(`
      UPDATE players 
      SET total_games_played = total_games_played + 1,
          total_score = total_score + ?,
          total_eco_tokens = total_eco_tokens + ?,
          level = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE wallet_address = ?
    `).run(
      score,
      tokensEarned,
      calculateLevel(db.prepare('SELECT total_score FROM players WHERE wallet_address = ?').get(wallet_address).total_score + score),
      wallet_address
    );
    
    // Get updated player stats
    const player = db.prepare('SELECT * FROM players WHERE wallet_address = ?').get(wallet_address);
    
    res.json({
      success: true,
      session_id: session.lastInsertRowid,
      tokens_earned: tokensEarned,
      new_balance: player.total_eco_tokens,
      level: player.level,
      blockchain: blockchainResult
    });
    
  } catch (error) {
    console.error('Error submitting game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit game session'
    });
  }
});

/**
 * GET /api/player/:wallet
 * Get player profile and stats
 */
app.get('/api/player/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Validate wallet address
    const { error } = schemas.walletAddress.validate(wallet);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }
    
    // Ensure player exists
    const player = ensurePlayerExists(wallet);
    
    // Get blockchain data
    let blockchainBalance = player.total_eco_tokens;
    let nftCount = 0;
    
    try {
      if (!stellarService.mockMode) {
        const balRes = await stellarService.getEcoTokenBalance(wallet);
        blockchainBalance = balRes.success ? balRes.balance : player.total_eco_tokens;

        const nftRes = await stellarService.getPlayerTreeNFTs(wallet);
        nftCount = nftRes.success ? nftRes.nfts.length : db.prepare('SELECT COUNT(*) as count FROM tree_nfts WHERE player_wallet = ?').get(wallet).count;
      } else {
        nftCount = db.prepare('SELECT COUNT(*) as count FROM tree_nfts WHERE player_wallet = ?').get(wallet).count;
      }
    } catch (error) {
      console.warn('Could not fetch blockchain data, using database values');
    }
    
    // Get recent sessions
    const recentSessions = db.prepare(`
      SELECT * FROM game_sessions 
      WHERE player_wallet = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all(wallet);
    
    res.json({
      success: true,
      player: {
        wallet_address: player.wallet_address,
        games_played: player.total_games_played,
        total_score: player.total_score,
        eco_tokens_balance: blockchainBalance,
        level: player.level,
        trees_planted: nftCount,
        created_at: player.created_at,
        recent_sessions: recentSessions
      }
    });
    
  } catch (error) {
    console.error('Error getting player data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player data'
    });
  }
});

/**
 * GET /api/player/:wallet/nfts
 * Get player's Tree NFTs
 */
app.get('/api/player/:wallet/nfts', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Validate wallet address
    const { error } = schemas.walletAddress.validate(wallet);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }
    
    // Get NFTs from database
    const nfts = db.prepare(`
      SELECT * FROM tree_nfts 
      WHERE player_wallet = ? 
      ORDER BY created_at DESC
    `).all(wallet);
    
    // Format NFT data
    const formattedNFTs = nfts.map(nft => ({
      nft_id: nft.nft_id,
      token_id: nft.stellar_token_id,
      species: nft.species,
      location: nft.location,
      coordinates: {
        latitude: nft.latitude / 1000000,
        longitude: nft.longitude / 1000000
      },
      plant_date: nft.plant_date,
      carbon_offset: nft.carbon_offset,
      partner_org: nft.partner_org,
      image_url: nft.image_url,
      minted_at: nft.created_at,
      explorer_link: nft.stellar_tx_hash 
        ? stellarService.getExplorerLink(nft.stellar_tx_hash)
        : null
    }));
    
    res.json({
      success: true,
      count: formattedNFTs.length,
      nfts: formattedNFTs
    });
    
  } catch (error) {
    console.error('Error getting NFTs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFTs'
    });
  }
});

/**
 * POST /api/tree/mint
 * Mint a new Tree NFT
 */
app.post('/api/tree/mint', async (req, res) => {
  try {
    // Validate request
    const { error, value } = schemas.mintTree.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { 
      wallet_address, 
      species, 
      location, 
      latitude, 
      longitude,
      carbon_offset,
      partner_org,
      image_url 
    } = value;
    
    // Validate Stellar address
    if (!stellarService.isValidAddress(wallet_address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar wallet address'
      });
    }
    
    // Check player exists and has enough tokens
    const player = ensurePlayerExists(wallet_address);
    const requiredTokens = parseInt(process.env.TREE_NFT_COST) || 100;
    
    if (player.total_eco_tokens < requiredTokens) {
      return res.status(400).json({
        success: false,
        error: `Insufficient tokens. Required: ${requiredTokens}, Available: ${player.total_eco_tokens}`
      });
    }
    
    // Prepare tree data for blockchain
    const treeData = {
      species,
      location,
      latitude,
      longitude,
      plantDate: Math.floor(Date.now() / 1000),
      carbonOffset: carbon_offset,
      partnerOrg: partner_org
    };
    
    // Mint NFT on blockchain
  const mintResult = await stellarService.callTreeNFTMint(wallet_address, treeData);
    
    // Save to database
    const nft = db.prepare(`
      INSERT INTO tree_nfts (
        player_wallet, species, location, latitude, longitude,
        plant_date, carbon_offset, partner_org, image_url,
        stellar_token_id, stellar_tx_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      wallet_address,
      species,
      location,
      latitude,
      longitude,
      treeData.plantDate,
      carbon_offset,
      partner_org,
      image_url || null,
        mintResult.tokenId,
        mintResult.txHash
    );
    
    // Deduct tokens from player
    db.prepare(`
      UPDATE players 
      SET total_eco_tokens = total_eco_tokens - ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE wallet_address = ?
    `).run(requiredTokens, wallet_address);
    
    res.json({
      success: true,
      nft_id: nft.lastInsertRowid,
      token_id: mintResult.tokenId,
      explorer_link: mintResult.explorerLink,
      tokens_spent: requiredTokens,
      remaining_tokens: player.total_eco_tokens - requiredTokens
    });
    
  } catch (error) {
    console.error('Error minting tree NFT:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint Tree NFT'
    });
  }
});

/**
 * GET /api/stats/global
 * Get global platform statistics
 */
app.get('/api/stats/global', (req, res) => {
  try {
    const stats = {
      total_players: db.prepare('SELECT COUNT(*) as count FROM players').get().count,
      total_games: db.prepare('SELECT COUNT(*) as count FROM game_sessions').get().count,
      total_score: db.prepare('SELECT COALESCE(SUM(total_score), 0) as sum FROM players').get().sum,
      total_trees: db.prepare('SELECT COUNT(*) as count FROM tree_nfts').get().count,
      total_tokens_earned: db.prepare('SELECT COALESCE(SUM(tokens_earned), 0) as sum FROM game_sessions').get().sum,
    };
    
    // Calculate CO2 offset (assume 5kg per tree)
    stats.total_co2_offset = db.prepare('SELECT COALESCE(SUM(carbon_offset), 0) as sum FROM tree_nfts').get().sum;
    
    // Get active players (played in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    stats.active_players = db.prepare(`
      SELECT COUNT(DISTINCT player_wallet) as count 
      FROM game_sessions 
      WHERE timestamp > ?
    `).get(sevenDaysAgo).count;
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error getting global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global stats'
    });
  }
});

// ==================== Error Handling ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ==================== Server Initialization ====================

const startServer = async () => {
  try {
    // Initialize database
    console.log('🗄️  Initializing database...');
    initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 EcoStellar Backend API Server');
      console.log(`📍 Running on http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⭐ Stellar Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
      console.log(`${stellarService.mockMode ? '🔧 Mock Mode: ON (Configure .env for real blockchain)' : '✅ Blockchain: Connected'}`);
      console.log('\n📚 API Endpoints:');
      console.log('   POST   /api/game/submit');
      console.log('   GET    /api/player/:wallet');
      console.log('   GET    /api/player/:wallet/nfts');
      console.log('   POST   /api/tree/mint');
      console.log('   GET    /api/stats/global');
      console.log('   GET    /health\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  db.close();
  process.exit(0);
});

module.exports = app;
