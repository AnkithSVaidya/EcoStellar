#![no_std]

//! # GameRewards Smart Contract
//! 
//! A Soroban contract for the EcoQuest gaming platform that records game sessions
//! and distributes EcoToken rewards based on player scores.
//! 
//! ## Features
//! - Record game sessions on-chain
//! - Calculate rewards based on score (10 points = 1 ECO)
//! - Automatically mint EcoTokens via cross-contract call
//! - Track player statistics
//! - Query game session history

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, IntoVal, String, Vec,
};

/// Storage keys for persisting contract data
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Admin address who can manage the contract
    Admin,
    /// EcoToken contract address for minting rewards
    EcoTokenContract,
    /// Game session counter for generating unique IDs
    SessionCounter,
    /// Individual game session data (session_id -> GameSession)
    GameSession(u64),
    /// Player statistics (player_address -> PlayerStats)
    PlayerStats(Address),
    /// Contract initialization flag
    Initialized,
}

/// Represents a single game session
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct GameSession {
    /// Unique session identifier
    pub session_id: u64,
    /// Player who played this session
    pub player: Address,
    /// Score achieved in the game
    pub score: u32,
    /// Type/category of game played
    pub game_type: String,
    /// EcoTokens earned from this session
    pub tokens_earned: i128,
    /// Ledger number when session was recorded
    pub timestamp: u64,
}

/// Player statistics aggregated across all sessions
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct PlayerStats {
    /// Total number of games played
    pub total_games_played: u32,
    /// Cumulative score across all games
    pub total_score: u64,
    /// Total EcoTokens earned from all games
    pub total_tokens_earned: i128,
}

/// Return type for recording a game session
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct SessionResult {
    /// The session ID that was created
    pub session_id: u64,
    /// Tokens earned and minted
    pub tokens_earned: i128,
}

#[contract]
pub struct GameRewards;

#[contractimpl]
impl GameRewards {
    /// Initialize the GameRewards contract
    /// 
    /// Sets up the contract with an admin and links it to the EcoToken contract
    /// for minting rewards.
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `admin` - Admin address with management privileges
    /// * `eco_token_contract` - Address of the deployed EcoToken contract
    /// 
    /// # Panics
    /// Panics if contract is already initialized
    /// 
    /// # Example
    /// ```
    /// game_rewards.initialize(&admin_address, &eco_token_address);
    /// ```
    pub fn initialize(env: Env, admin: Address, eco_token_contract: Address) {
        // Require admin authorization
        admin.require_auth();

        // Ensure not already initialized
        assert!(
            !env.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );

        // Store configuration
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::EcoTokenContract, &eco_token_contract);
        env.storage().instance().set(&DataKey::SessionCounter, &0u64);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    /// Record a game session and distribute rewards
    /// 
    /// Stores the game session data on-chain, calculates rewards based on score,
    /// and automatically mints EcoTokens to the player via cross-contract call.
    /// 
    /// # Reward Formula
    /// - Base: score / 10 = tokens (e.g., 500 points = 50 ECO)
    /// - Minimum score: 50 (below this, no rewards)
    /// - Maximum reward: 1000 ECO per session
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `player` - Player's address to receive rewards
    /// * `score` - Score achieved (0-10000+ range)
    /// * `game_type` - Type of game played (e.g., "quest", "puzzle")
    /// 
    /// # Returns
    /// SessionResult containing session_id and tokens_earned
    /// 
    /// # Panics
    /// - If contract not initialized
    /// - If score is 0
    /// 
    /// # Events
    /// Emits "game_complete" event with session details
    /// 
    /// # Example
    /// ```
    /// let result = game_rewards.record_game_session(
    ///     &env,
    ///     &player_address,
    ///     &750, // 750 points
    ///     &String::from_str(&env, "quest")
    /// );
    /// // result.tokens_earned = 75 ECO (750 / 10)
    /// ```
    pub fn record_game_session(
        env: Env,
        player: Address,
        score: u32,
        game_type: String,
    ) -> SessionResult {
        // Verify initialization
        assert!(
            env.storage().instance().has(&DataKey::Initialized),
            "Contract not initialized"
        );

        // Validate score
        assert!(score > 0, "Score must be positive");

        // Only admin (game server) can record sessions
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not configured");
        admin.require_auth();

        // Calculate rewards based on score
        let tokens_earned = Self::calculate_rewards(score);

        // Get and increment session counter
        let session_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::SessionCounter)
            .unwrap_or(0);
        let new_session_id = session_id + 1;
        env.storage()
            .instance()
            .set(&DataKey::SessionCounter, &new_session_id);

        // Create game session record
        let game_session = GameSession {
            session_id: new_session_id,
            player: player.clone(),
            score,
            game_type: game_type.clone(),
            tokens_earned,
            timestamp: env.ledger().sequence() as u64,
        };

        // Store session
        env.storage()
            .instance()
            .set(&DataKey::GameSession(new_session_id), &game_session);

        // Update player stats
        Self::update_player_stats(&env, &player, score, tokens_earned);

        // Mint rewards if earned any tokens
        if tokens_earned > 0 {
            Self::mint_rewards(&env, &player, tokens_earned);
        }

        // Emit event
        env.events().publish(
            (symbol_short!("game_done"), player.clone()),
            (new_session_id, score, tokens_earned),
        );

        SessionResult {
            session_id: new_session_id,
            tokens_earned,
        }
    }

    /// Get aggregated statistics for a player
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `player` - Player address to query
    /// 
    /// # Returns
    /// PlayerStats with total games, score, and tokens earned
    /// 
    /// # Example
    /// ```
    /// let stats = game_rewards.get_player_stats(&env, &player_address);
    /// println!("Games: {}", stats.total_games_played);
    /// ```
    pub fn get_player_stats(env: Env, player: Address) -> PlayerStats {
        env.storage()
            .instance()
            .get(&DataKey::PlayerStats(player))
            .unwrap_or(PlayerStats {
                total_games_played: 0,
                total_score: 0,
                total_tokens_earned: 0,
            })
    }

    /// Get details of a specific game session
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `session_id` - Unique session identifier
    /// 
    /// # Returns
    /// GameSession data or panics if session doesn't exist
    /// 
    /// # Example
    /// ```
    /// let session = game_rewards.get_game_session(&env, &1);
    /// println!("Score: {}", session.score);
    /// ```
    pub fn get_game_session(env: Env, session_id: u64) -> GameSession {
        env.storage()
            .instance()
            .get(&DataKey::GameSession(session_id))
            .expect("Session not found")
    }

    /// Get the total number of sessions recorded
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// 
    /// # Returns
    /// Total count of game sessions
    pub fn get_total_sessions(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::SessionCounter)
            .unwrap_or(0)
    }

    /// Get the EcoToken contract address
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// 
    /// # Returns
    /// Address of the linked EcoToken contract
    pub fn get_eco_token_contract(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::EcoTokenContract)
            .expect("EcoToken contract not set")
    }

    // ==================== Internal Helper Functions ====================

    /// Calculate reward tokens based on score
    /// 
    /// Formula: score / 10 = tokens
    /// Minimum: 50 score required (< 50 = 0 tokens)
    /// Maximum: 1000 tokens per session
    fn calculate_rewards(score: u32) -> i128 {
        // Minimum score check
        if score < 50 {
            return 0;
        }

        // Base calculation: 10 points = 1 token
        let base_tokens = (score / 10) as i128;

        // Apply maximum cap (1000 tokens per session)
        let tokens = if base_tokens > 1000 {
            1000
        } else {
            base_tokens
        };

        // Convert to token amount with 7 decimals (Stellar standard)
        tokens * 10_000_000
    }

    /// Update player statistics
    fn update_player_stats(env: &Env, player: &Address, score: u32, tokens: i128) {
        let mut stats = env
            .storage()
            .instance()
            .get(&DataKey::PlayerStats(player.clone()))
            .unwrap_or(PlayerStats {
                total_games_played: 0,
                total_score: 0,
                total_tokens_earned: 0,
            });

        stats.total_games_played += 1;
        stats.total_score += score as u64;
        stats.total_tokens_earned += tokens;

        env.storage()
            .instance()
            .set(&DataKey::PlayerStats(player.clone()), &stats);
    }

    /// Mint rewards by calling EcoToken contract
    /// 
    /// Performs cross-contract call to mint tokens to the player
    fn mint_rewards(env: &Env, player: &Address, amount: i128) {
        let eco_token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::EcoTokenContract)
            .expect("EcoToken contract not configured");

        // Cross-contract call to EcoToken's mint function
        // The admin auth from record_game_session will carry through
        env.invoke_contract::<()>(
            &eco_token_contract,
            &symbol_short!("mint"),
            Vec::from_array(&env, [player.to_val(), amount.into_val(env)]),
        );
    }
}

#[cfg(test)]
mod test;
