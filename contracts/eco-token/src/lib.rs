#![no_std]

//! # EcoToken Smart Contract
//! 
//! A Soroban-based token contract for the EcoQuest gaming platform.
//! This contract implements a basic fungible token with minting capabilities.
//! 
//! ## Features
//! - Admin-controlled minting
//! - Token transfers between accounts
//! - Balance queries
//! - Total supply tracking
//! - Event logging for mints and transfers

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

/// Storage keys used to persist data in the contract
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Stores the admin address who can mint tokens
    Admin,
    /// Stores individual account balances (Address -> i128)
    Balance(Address),
    /// Stores the total supply of tokens
    TotalSupply,
    /// Flag to check if contract is initialized
    Initialized,
}

/// Custom error codes for the contract
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet
    NotInitialized = 2,
    /// Caller is not the admin
    NotAuthorized = 3,
    /// Insufficient balance for transfer
    InsufficientBalance = 4,
    /// Invalid amount (negative or zero where positive required)
    InvalidAmount = 5,
}

#[contract]
pub struct EcoToken;

#[contractimpl]
impl EcoToken {
    /// Initialize the contract with an admin address
    /// 
    /// This function sets up the contract and designates an admin who will have
    /// exclusive rights to mint new tokens.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `admin` - The address that will have admin privileges
    /// 
    /// # Panics
    /// Panics if the contract has already been initialized
    /// 
    /// # Example
    /// ```
    /// token.initialize(&admin_address);
    /// ```
    pub fn initialize(env: Env, admin: Address) {
        // Verify the admin address (required for auth)
        admin.require_auth();

        // Check if already initialized
        assert!(
            !env.storage().instance().has(&DataKey::Initialized),
            "Contract already initialized"
        );

        // Store admin address
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize total supply to 0
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
        
        // Mark as initialized
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    /// Mint new tokens to a specified address
    /// 
    /// Only the admin can mint tokens. This increases both the recipient's balance
    /// and the total supply.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `to` - The address to receive the minted tokens
    /// * `amount` - The amount of tokens to mint (must be positive)
    /// 
    /// # Panics
    /// - If contract is not initialized
    /// - If caller is not the admin
    /// - If amount is not positive
    /// 
    /// # Events
    /// Emits a "mint" event with the recipient and amount
    /// 
    /// # Example
    /// ```
    /// token.mint(&env, &recipient_address, &1000_0000000); // 1000 tokens with 7 decimals
    /// ```
    pub fn mint(env: Env, to: Address, amount: i128) {
        // Check initialization
        assert!(
            env.storage().instance().has(&DataKey::Initialized),
            "Contract not initialized"
        );

        // Get admin and require their authorization
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Validate amount
        assert!(amount > 0, "Amount must be positive");

        // Get current balance of recipient (default to 0 if new address)
        let balance: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        // Add minted amount to balance
        let new_balance = balance.checked_add(amount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &new_balance);

        // Update total supply
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        let new_total_supply = total_supply.checked_add(amount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_total_supply);

        // Emit mint event
        env.events().publish((symbol_short!("mint"), to.clone()), amount);
    }

    /// Get the balance of a specific address
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `address` - The address to query
    /// 
    /// # Returns
    /// The token balance as i128 (with 7 decimal places)
    /// 
    /// # Example
    /// ```
    /// let balance = token.balance(&env, &user_address);
    /// ```
    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    /// Transfer tokens from one address to another
    /// 
    /// The caller must be the `from` address and must have sufficient balance.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `from` - The address sending tokens (must be the caller)
    /// * `to` - The address receiving tokens
    /// * `amount` - The amount of tokens to transfer (must be positive)
    /// 
    /// # Panics
    /// - If contract is not initialized
    /// - If amount is not positive
    /// - If sender has insufficient balance
    /// 
    /// # Events
    /// Emits a "transfer" event with from, to, and amount
    /// 
    /// # Example
    /// ```
    /// token.transfer(&env, &from_address, &to_address, &100_0000000); // 100 tokens
    /// ```
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // Check initialization
        assert!(
            env.storage().instance().has(&DataKey::Initialized),
            "Contract not initialized"
        );

        // Require authorization from sender
        from.require_auth();

        // Validate amount
        assert!(amount > 0, "Amount must be positive");

        // Get sender's balance
        let from_balance: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);

        // Check sufficient balance
        assert!(from_balance >= amount, "Insufficient balance");

        // Deduct from sender
        let new_from_balance = from_balance.checked_sub(amount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &new_from_balance);

        // Add to recipient
        let to_balance: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        let new_to_balance = to_balance.checked_add(amount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &new_to_balance);

        // Emit transfer event
        env.events()
            .publish((symbol_short!("transfer"), from.clone(), to.clone()), amount);
    }

    /// Get the total supply of tokens
    /// 
    /// Returns the total amount of tokens that have been minted.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// The total supply as i128 (with 7 decimal places)
    /// 
    /// # Example
    /// ```
    /// let supply = token.get_total_supply(&env);
    /// ```
    pub fn get_total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get token metadata - name
    /// 
    /// # Returns
    /// The token name "EcoToken"
    pub fn name(_env: Env) -> String {
        String::from_str(&_env, "EcoToken")
    }

    /// Get token metadata - symbol
    /// 
    /// # Returns
    /// The token symbol "ECO"
    pub fn symbol(_env: Env) -> String {
        String::from_str(&_env, "ECO")
    }

    /// Get token metadata - decimals
    /// 
    /// # Returns
    /// The number of decimals (7, following Stellar standard)
    pub fn decimals(_env: Env) -> u32 {
        7
    }
}

#[cfg(test)]
mod test;
