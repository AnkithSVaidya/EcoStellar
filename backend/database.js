const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Initialize SQLite Database for EcoStellar
 * 
 * Creates three main tables:
 * 1. players - Player profile and stats
 * 2. game_sessions - Individual game session records
 * 3. tree_nfts - Tree NFT records with blockchain references
 */

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'data/ecostellar.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Create Players Table
 * Stores player profile and cumulative stats
 */
const createPlayersTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        wallet_address TEXT PRIMARY KEY,
        total_games_played INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        total_eco_tokens INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        is_guest INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Created players table');
        resolve();
      }
    });
  });
};

/**
 * Create Game Sessions Table
 * Records individual game sessions with scores and rewards
 */
const createGameSessionsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_wallet TEXT NOT NULL,
        score INTEGER NOT NULL,
        tokens_earned INTEGER NOT NULL,
        game_type TEXT DEFAULT 'carbon_dash',
        stellar_tx_hash TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_wallet) REFERENCES players(wallet_address)
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Created game_sessions table');
        resolve();
      }
    });
  });
};

/**
 * Create Tree NFTs Table
 * Stores tree NFT metadata and blockchain references
 */
const createTreeNFTsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tree_nfts (
        nft_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_wallet TEXT NOT NULL,
        species TEXT NOT NULL,
        location TEXT,
        latitude INTEGER NOT NULL,
        longitude INTEGER NOT NULL,
        plant_date INTEGER NOT NULL,
        carbon_offset INTEGER DEFAULT 500,
        partner_org TEXT DEFAULT 'EcoStellar',
        image_url TEXT,
        stellar_token_id INTEGER,
        stellar_tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_wallet) REFERENCES players(wallet_address)
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Created tree_nfts table');
        resolve();
      }
    });
  });
};

/**
 * Initialize all database tables
 */
const initializeDatabase = async () => {
  try {
    await createPlayersTable();
    await createGameSessionsTable();
    await createTreeNFTsTable();
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// ==================== Player Operations ====================

/**
 * Get or create a player record
 */
const getOrCreatePlayer = (walletAddress) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM players WHERE wallet_address = ?',
      [walletAddress],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row);
        } else {
          // Create new player
          db.run(
            'INSERT INTO players (wallet_address) VALUES (?)',
            [walletAddress],
            function(err) {
              if (err) reject(err);
              else {
                db.get(
                  'SELECT * FROM players WHERE wallet_address = ?',
                  [walletAddress],
                  (err, newRow) => {
                    if (err) reject(err);
                    else resolve(newRow);
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};

/**
 * Update player stats after a game session
 */
const updatePlayerStats = (walletAddress, scoreToAdd, tokensToAdd) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE players 
       SET total_games_played = total_games_played + 1,
           total_score = total_score + ?,
           total_eco_tokens = total_eco_tokens + ?,
           level = (total_score + ?) / 1000 + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE wallet_address = ?`,
      [scoreToAdd, tokensToAdd, scoreToAdd, walletAddress],
      function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

/**
 * Get player by wallet address
 */
const getPlayer = (walletAddress) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM players WHERE wallet_address = ?',
      [walletAddress],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

// ==================== Game Session Operations ====================

/**
 * Record a game session
 */
const recordGameSession = (playerWallet, score, tokensEarned, gameType = 'carbon_dash', txHash = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO game_sessions (player_wallet, score, tokens_earned, game_type, stellar_tx_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [playerWallet, score, tokensEarned, gameType, txHash],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
};

/**
 * Get player's game sessions
 */
const getPlayerSessions = (walletAddress, limit = 10) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM game_sessions 
       WHERE player_wallet = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [walletAddress, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// ==================== Tree NFT Operations ====================

/**
 * Record a minted tree NFT
 */
const recordTreeNFT = (playerWallet, species, location, latitude, longitude, plantDate, carbonOffset, partnerOrg, imageUrl, stellarTokenId = null, txHash = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO tree_nfts (player_wallet, species, location, latitude, longitude, plant_date, carbon_offset, partner_org, image_url, stellar_token_id, stellar_tx_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [playerWallet, species, location, latitude, longitude, plantDate, carbonOffset, partnerOrg, imageUrl, stellarTokenId, txHash],
      function(err) {
        if (err) reject(err);
        else resolve({ nft_id: this.lastID });
      }
    );
  });
};

/**
 * Get player's tree NFTs
 */
const getPlayerNFTs = (walletAddress) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM tree_nfts 
       WHERE player_wallet = ? 
       ORDER BY created_at DESC`,
      [walletAddress],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

/**
 * Get total number of trees planted
 */
const getTotalTrees = () => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM tree_nfts',
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      }
    );
  });
};

// ==================== Global Stats ====================

/**
 * Get global platform statistics
 */
const getGlobalStats = () => {
  return new Promise((resolve, reject) => {
    const stats = {};
    
    // Get total players
    db.get('SELECT COUNT(*) as count FROM players', (err, row) => {
      if (err) return reject(err);
      stats.total_players = row.count;
      
      // Get total games
      db.get('SELECT COUNT(*) as count FROM game_sessions', (err, row) => {
        if (err) return reject(err);
        stats.total_games = row.count;
        
        // Get total score
        db.get('SELECT SUM(total_score) as sum FROM players', (err, row) => {
          if (err) return reject(err);
          stats.total_score = row.sum || 0;
          
          // Get total trees
          db.get('SELECT COUNT(*) as count FROM tree_nfts', (err, row) => {
            if (err) return reject(err);
            stats.total_trees = row.count;
            stats.total_co2_offset = row.count * 5; // 5kg CO2 per tree average
            
            resolve(stats);
          });
        });
      });
    });
  });
};

/**
 * Close database connection
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  getOrCreatePlayer,
  updatePlayerStats,
  getPlayer,
  recordGameSession,
  getPlayerSessions,
  recordTreeNFT,
  getPlayerNFTs,
  getTotalTrees,
  getGlobalStats,
  closeDatabase
};
