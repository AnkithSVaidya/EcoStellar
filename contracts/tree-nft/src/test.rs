#![cfg(test)]

use super::TreeNFT;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// Import the client that Soroban SDK generates
use super::TreeNFTClient;

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();
    client.initialize(&admin, &name, &symbol, &base_uri);

    assert_eq!(client.admin(), admin);
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.total_supply(), 0);
}

#[test]
fn test_mint_tree_nft() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();

    // Initialize contract
    client.initialize(&admin, &name, &symbol, &base_uri);

    // Mint a tree NFT
    let token_id = client.mint(
        &player,
        &String::from_str(&env, "Oak"),
        &String::from_str(&env, "San Francisco, CA"),
        &37774900,      // 37.7749°N
        &-122419400,    // -122.4194°W
        &1698345600,    // Oct 26, 2023
        &500,           // 500 kg CO2
        &String::from_str(&env, "One Tree Planted"),
    );

    assert_eq!(token_id, 1);
    assert_eq!(client.total_supply(), 1);
    assert_eq!(client.balance_of(&player), 1);
    assert_eq!(client.owner_of(&token_id), player);

    // Verify tree metadata
    let tree = client.get_tree_data(&token_id);
    assert_eq!(tree.species, String::from_str(&env, "Oak"));
    assert_eq!(tree.location, String::from_str(&env, "San Francisco, CA"));

    assert_eq!(tree.species, String::from_str(&env, "Oak"));
    assert_eq!(tree.latitude, 37774900);
    assert_eq!(tree.longitude, -122419400);
    assert_eq!(tree.plant_date, 1698345600);
    assert_eq!(tree.carbon_offset, 500);
}

#[test]
fn test_multiple_mints() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();
    client.initialize(&admin, &name, &symbol, &base_uri);

    // Mint multiple trees for same player
    let token1 = client.mint(
        &player,
        &String::from_str(&env, "Oak"),
        &String::from_str(&env, "San Francisco, CA"),
        &37774900,
        &-122419400,
        &1698345600,
        &500,
        &String::from_str(&env, "One Tree Planted"),
    );

    let token2 = client.mint(
        &player,
        &String::from_str(&env, "Pine"),
        &String::from_str(&env, "New York, NY"),
        &40712800,
        &-74006000,
        &1698432000,
        &300,
        &String::from_str(&env, "Trees for the Future"),
    );

    let token3 = client.mint(
        &player,
        &String::from_str(&env, "Maple"),
        &String::from_str(&env, "Los Angeles, CA"),
        &34052200,
        &-118243700,
        &1698518400,
        &400,
        &String::from_str(&env, "Arbor Day Foundation"),
    );

    assert_eq!(token1, 1);
    assert_eq!(token2, 2);
    assert_eq!(token3, 3);
    assert_eq!(client.total_supply(), 3);
    assert_eq!(client.balance_of(&player), 3);
}

#[test]
fn test_multiple_players() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player1 = Address::generate(&env);
    let player2 = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();
    client.initialize(&admin, &name, &symbol, &base_uri);

    // Mint for player 1
    client.mint(
        &player1,
        &String::from_str(&env, "Oak"),
        &String::from_str(&env, "San Francisco, CA"),
        &37774900,
        &-122419400,
        &1698345600,
        &500,
        &String::from_str(&env, "One Tree Planted"),
    );

    client.mint(
        &player1,
        &String::from_str(&env, "Pine"),
        &String::from_str(&env, "New York, NY"),
        &40712800,
        &-74006000,
        &1698432000,
        &300,
        &String::from_str(&env, "Trees for the Future"),
    );

    // Mint for player 2
    client.mint(
        &player2,
        &String::from_str(&env, "Maple"),
        &String::from_str(&env, "Los Angeles, CA"),
        &34052200,
        &-118243700,
        &1698518400,
        &400,
        &String::from_str(&env, "Arbor Day Foundation"),
    );

    // Verify balances
    assert_eq!(client.balance_of(&player1), 2);
    assert_eq!(client.balance_of(&player2), 1);
    assert_eq!(client.total_supply(), 3);
}

#[test]
fn test_nft_standard_functions() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();
    client.initialize(&admin, &name, &symbol, &base_uri);

    // Test OpenZeppelin standard functions
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
    assert_eq!(client.base_uri(), base_uri);
    
    // Mint a tree
    let token_id = client.mint(
        &player,
        &String::from_str(&env, "Cherry Blossom"),
        &String::from_str(&env, "Tokyo, Japan"),
        &35676200,   // 35.6762°N
        &139650300,  // 139.6503°E
        &1698345600,
        &600,
        &String::from_str(&env, "Plant-for-the-Planet"),
    );

    // Test standard NFT functions
    assert_eq!(client.owner_of(&token_id), player);
    assert_eq!(client.balance_of(&player), 1);
    
    // Verify tree metadata
    let tree = client.get_tree_data(&token_id);
    assert_eq!(tree.latitude, 35676200);
    assert_eq!(tree.longitude, 139650300);
    assert_eq!(tree.carbon_offset, 600);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_cannot_reinitialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFT);
    let client = TreeNFTClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let name = String::from_str(&env, "EcoStellar Tree Certificates");
    let symbol = String::from_str(&env, "TREE");
    let base_uri = String::from_str(&env, "https://api.ecostellar.com/trees/");

    env.mock_all_auths();
    client.initialize(&admin, &name, &symbol, &base_uri);
    
    // Try to initialize again - should panic
    client.initialize(&admin, &name, &symbol, &base_uri);
}
