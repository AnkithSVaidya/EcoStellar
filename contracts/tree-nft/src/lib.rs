#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

/// Tree Certificate NFT Contract
/// 
/// Each NFT represents a real tree planted, with metadata stored on-chain.
/// NFTs are soulbound (non-transferable) for this demo.

// ==================== Data Structures ====================

/// Storage keys for contract data
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Initialized,
    NFTCounter,
    TreeNFT(u64),           // nft_id -> TreeMetadata
    PlayerTrees(Address),   // player -> Vec<u64> of nft_ids
}

/// Metadata for each Tree NFT
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TreeMetadata {
    pub nft_id: u64,
    pub owner: Address,
    pub species: String,
    pub latitude: i32,       // Store as integer (multiply by 1,000,000 for precision)
    pub longitude: i32,      // Store as integer (multiply by 1,000,000 for precision)
    pub plant_date: u64,     // Unix timestamp
    pub image_url: String,
    pub mint_timestamp: u64, // When the NFT was minted
}

// ==================== Smart Contract ====================

#[contract]
pub struct TreeNFTContract;

#[contractimpl]
impl TreeNFTContract {
    
    /// Initialize the contract with an admin
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `admin` - Admin address for contract management
    /// 
    /// # Panics
    /// * If contract is already initialized
    /// 
    /// # Example
    /// ```
    /// initialize(admin_address)
    /// ```
    pub fn initialize(env: Env, admin: Address) {
        // Check if already initialized
        assert!(
            !env.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );

        // Require admin authorization
        admin.require_auth();

        // Store admin and mark as initialized
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage().instance().set(&DataKey::NFTCounter, &0u64);

        // Emit initialization event
        env.events().publish(
            (symbol_short!("init"), admin.clone()),
            symbol_short!("TreeNFT"),
        );
    }

    /// Mint a new Tree NFT
    /// 
    /// Creates a soulbound NFT representing a real-world tree.
    /// Only admin can mint NFTs.
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `player` - Address that will own the NFT
    /// * `species` - Tree species name (e.g., "Oak", "Pine")
    /// * `latitude` - GPS latitude * 1,000,000 (e.g., 37774900 = 37.7749°N)
    /// * `longitude` - GPS longitude * 1,000,000 (e.g., -122419400 = -122.4194°W)
    /// * `plant_date` - Unix timestamp when tree was planted
    /// * `image_url` - URL to tree photo/certificate image
    /// 
    /// # Returns
    /// * `u64` - The newly minted NFT ID
    /// 
    /// # Example
    /// ```
    /// let nft_id = mint_tree_nft(
    ///     player_address,
    ///     String::from_str(&env, "Oak"),
    ///     37774900,
    ///     -122419400,
    ///     1698345600,
    ///     String::from_str(&env, "https://example.com/tree1.jpg")
    /// );
    /// ```
    pub fn mint_tree_nft(
        env: Env,
        player: Address,
        species: String,
        latitude: i32,
        longitude: i32,
        plant_date: u64,
        image_url: String,
    ) -> u64 {
        // Verify contract is initialized
        assert!(
            env.storage().instance().has(&DataKey::Initialized),
            "Contract not initialized"
        );

        // Only admin can mint
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        admin.require_auth();

        // Get and increment NFT counter
        let nft_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NFTCounter)
            .unwrap_or(0);
        let new_nft_id = nft_id + 1;
        env.storage()
            .instance()
            .set(&DataKey::NFTCounter, &new_nft_id);

        // Create NFT metadata
        let tree_nft = TreeMetadata {
            nft_id: new_nft_id,
            owner: player.clone(),
            species: species.clone(),
            latitude,
            longitude,
            plant_date,
            image_url: image_url.clone(),
            mint_timestamp: env.ledger().timestamp(),
        };

        // Store NFT metadata
        env.storage()
            .instance()
            .set(&DataKey::TreeNFT(new_nft_id), &tree_nft);

        // Add NFT to player's collection
        let mut player_trees: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::PlayerTrees(player.clone()))
            .unwrap_or(Vec::new(&env));
        player_trees.push_back(new_nft_id);
        env.storage()
            .instance()
            .set(&DataKey::PlayerTrees(player.clone()), &player_trees);

        // Emit mint event
        env.events().publish(
            (symbol_short!("mint"), player.clone()),
            (new_nft_id, species),
        );

        new_nft_id
    }

    /// Get metadata for a specific Tree NFT
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `nft_id` - The NFT ID to query
    /// 
    /// # Returns
    /// * `TreeMetadata` - Complete metadata for the NFT
    /// 
    /// # Panics
    /// * If NFT ID doesn't exist
    /// 
    /// # Example
    /// ```
    /// let tree = get_tree_nft(1);
    /// // Returns: TreeMetadata { nft_id: 1, owner: ..., species: "Oak", ... }
    /// ```
    pub fn get_tree_nft(env: Env, nft_id: u64) -> TreeMetadata {
        env.storage()
            .instance()
            .get(&DataKey::TreeNFT(nft_id))
            .expect("NFT not found")
    }

    /// Get all Tree NFT IDs owned by a player
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `player` - Player address to query
    /// 
    /// # Returns
    /// * `Vec<u64>` - Array of NFT IDs owned by the player
    /// 
    /// # Example
    /// ```
    /// let nft_ids = get_player_trees(player_address);
    /// // Returns: [1, 3, 7] - player owns NFTs 1, 3, and 7
    /// ```
    pub fn get_player_trees(env: Env, player: Address) -> Vec<u64> {
        env.storage()
            .instance()
            .get(&DataKey::PlayerTrees(player))
            .unwrap_or(Vec::new(&env))
    }

    /// Get the total number of Tree NFTs minted
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// 
    /// # Returns
    /// * `u64` - Total count of NFTs minted
    /// 
    /// # Example
    /// ```
    /// let total = get_total_trees_minted();
    /// // Returns: 42 (42 trees have been minted)
    /// ```
    pub fn get_total_trees_minted(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::NFTCounter)
            .unwrap_or(0)
    }

    /// Get contract admin address
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// 
    /// # Returns
    /// * `Address` - The admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set")
    }
}

#[cfg(test)]
mod test;
