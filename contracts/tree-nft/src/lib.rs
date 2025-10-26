// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts pattern
// This demonstrates the OpenZeppelin pattern for NFTs on Stellar
// Note: stellar-tokens crate is not yet on crates.io, so this is a pattern demonstration

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};

// ==================== NFT Metadata Storage ====================

/// Storage keys following OpenZeppelin pattern
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    // Base NFT metadata (OpenZeppelin pattern)
    Name,           // Collection name
    Symbol,         // Collection symbol
    BaseURI,        // Base URI for token metadata
    
    // NFT ownership tracking
    TotalSupply,    // Total number of NFTs minted
    OwnerOf(u64),   // token_id -> owner address
    TokenURI(u64),  // token_id -> metadata URI
    
    // Balances
    Balance(Address),  // owner -> token count
    
    // Extended metadata for Tree NFTs
    TreeData(u64),  // token_id -> TreeMetadata
    
    // Admin
    Admin,
    Initialized,
}

/// Extended metadata for Tree NFTs (beyond standard NFT metadata)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TreeMetadata {
    pub species: String,
    pub location: String,
    pub latitude: i32,
    pub longitude: i32,
    pub plant_date: u64,
    pub carbon_offset: u64,  // in kg CO2
    pub partner_org: String,
}

// ==================== Tree NFT Contract ====================

#[contract]
pub struct TreeNFT;

#[contractimpl]
impl TreeNFT {
    
    /// Constructor - Initialize the NFT collection
    /// Following OpenZeppelin pattern but using Soroban naming
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `admin` - Admin address
    /// * `name` - Collection name (e.g., "EcoStellar Tree Certificates")
    /// * `symbol` - Collection symbol (e.g., "TREE")
    /// * `base_uri` - Base URI for metadata (e.g., "https://api.ecostellar.com/trees/")
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        base_uri: String,
    ) {
        // Check if already initialized
        assert!(
            !env.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );

        admin.require_auth();

        // Set base metadata (OpenZeppelin pattern)
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::BaseURI, &base_uri);
        
        // Initialize counters
        env.storage().instance().set(&DataKey::TotalSupply, &0u64);
        
        // Set admin and mark initialized
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Emit initialization event
        env.events().publish(
            (symbol_short!("init"),),
            (name, symbol),
        );
    }

    // ==================== Standard NFT Functions (OpenZeppelin pattern) ====================

    /// Get the name of the NFT collection
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .expect("Collection not initialized")
    }

    /// Get the symbol of the NFT collection
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .expect("Collection not initialized")
    }

    /// Get the base URI for token metadata
    pub fn base_uri(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::BaseURI)
            .unwrap_or(String::from_str(&env, ""))
    }

    /// Get total number of NFTs minted
    pub fn total_supply(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get the number of NFTs owned by an address
    pub fn balance_of(env: Env, owner: Address) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(owner))
            .unwrap_or(0)
    }

    /// Get the owner of a specific NFT
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::OwnerOf(token_id))
            .expect("Token does not exist")
    }

    /// Get the metadata URI for a specific NFT
    pub fn token_uri(env: Env, token_id: u64) -> String {
        // Check if token exists
        assert!(
            env.storage().instance().has(&DataKey::OwnerOf(token_id)),
            "Token does not exist"
        );

        // Return stored URI or base URI
        // In practice, you would concatenate base_uri + token_id
        // For now, return the base URI
        env.storage()
            .instance()
            .get(&DataKey::TokenURI(token_id))
            .unwrap_or_else(|| Self::base_uri(env.clone()))
    }

    // ==================== Tree-Specific NFT Functions ====================

    /// Mint a new Tree NFT
    /// 
    /// # Arguments
    /// * `to` - Address to receive the NFT
    /// * `species` - Tree species
    /// * `location` - Location name
    /// * `latitude` - GPS latitude * 1,000,000
    /// * `longitude` - GPS longitude * 1,000,000
    /// * `plant_date` - Unix timestamp when planted
    /// * `carbon_offset` - Estimated kg CO2 offset
    /// * `partner_org` - Partner organization name
    /// 
    /// # Returns
    /// * `u64` - The newly minted token ID
    pub fn mint(
        env: Env,
        to: Address,
        species: String,
        location: String,
        latitude: i32,
        longitude: i32,
        plant_date: u64,
        carbon_offset: u64,
        partner_org: String,
    ) -> u64 {
        // Only admin can mint
        let admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        admin.require_auth();

        // Get next token ID
        let total_supply: u64 = env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        let token_id = total_supply + 1;

        // Set ownership
        env.storage().instance().set(&DataKey::OwnerOf(token_id), &to);

        // Update balances
        let current_balance: u64 = env.storage()
            .instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(current_balance + 1));

        // Update total supply
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &token_id);

        // Store tree-specific metadata
        let tree_data = TreeMetadata {
            species: species.clone(),
            location: location.clone(),
            latitude,
            longitude,
            plant_date,
            carbon_offset,
            partner_org: partner_org.clone(),
        };
        env.storage()
            .instance()
            .set(&DataKey::TreeData(token_id), &tree_data);

        // Emit mint event
        env.events().publish(
            (symbol_short!("mint"), to.clone()),
            (token_id, species, location),
        );

        token_id
    }

    /// Get extended tree metadata for a specific NFT
    pub fn get_tree_data(env: Env, token_id: u64) -> TreeMetadata {
        env.storage()
            .instance()
            .get(&DataKey::TreeData(token_id))
            .expect("Tree data not found")
    }

    /// Burn/destroy an NFT (admin only)
    /// Note: In a real implementation, you'd want to carefully consider burn mechanics
    pub fn burn(env: Env, token_id: u64) {
        let admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        admin.require_auth();

        // Get current owner
        let owner: Address = env.storage()
            .instance()
            .get(&DataKey::OwnerOf(token_id))
            .expect("Token does not exist");

        // Update balance
        let current_balance: u64 = env.storage()
            .instance()
            .get(&DataKey::Balance(owner.clone()))
            .unwrap_or(0);
        if current_balance > 0 {
            env.storage()
                .instance()
                .set(&DataKey::Balance(owner.clone()), &(current_balance - 1));
        }

        // Remove ownership
        env.storage().instance().remove(&DataKey::OwnerOf(token_id));
        env.storage().instance().remove(&DataKey::TreeData(token_id));
        env.storage().instance().remove(&DataKey::TokenURI(token_id));

        // Emit burn event
        env.events().publish(
            (symbol_short!("burn"),),
            token_id,
        );
    }

    /// Check if contract is initialized
    pub fn is_initialized(env: Env) -> bool {
        env.storage()
            .instance()
            .has(&DataKey::Initialized)
    }

    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set")
    }
}

// Note: In the actual OpenZeppelin pattern, you would implement traits like:
// impl NonFungibleToken for TreeNFT {
//     type ContractType = Base;
// }
// 
// But since stellar-tokens crate isn't published yet, this is a demonstration
// of the pattern with the same structure and naming conventions.

#[cfg(test)]
mod test;
