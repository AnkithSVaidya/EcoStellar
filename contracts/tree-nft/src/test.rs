#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_total_trees_minted(), 0);
}

#[test]
fn test_mint_tree_nft() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    // Initialize contract
    client.initialize(&admin);

    // Mint a tree NFT
    let nft_id = client.mint_tree_nft(
        &player,
        &String::from_str(&env, "Oak"),
        &37774900,      // 37.7749°N (San Francisco)
        &-122419400,    // -122.4194°W
        &1698345600,    // Oct 26, 2023
        &String::from_str(&env, "https://example.com/oak1.jpg"),
    );

    assert_eq!(nft_id, 1);
    assert_eq!(client.get_total_trees_minted(), 1);

    // Verify NFT metadata
    let tree = client.get_tree_nft(&nft_id);
    assert_eq!(tree.nft_id, 1);
    assert_eq!(tree.owner, player);
    assert_eq!(tree.species, String::from_str(&env, "Oak"));
    assert_eq!(tree.latitude, 37774900);
    assert_eq!(tree.longitude, -122419400);
    assert_eq!(tree.plant_date, 1698345600);
}

#[test]
fn test_get_player_trees() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin);

    // Mint multiple trees for same player
    let nft1 = client.mint_tree_nft(
        &player,
        &String::from_str(&env, "Oak"),
        &37774900,
        &-122419400,
        &1698345600,
        &String::from_str(&env, "https://example.com/oak1.jpg"),
    );

    let nft2 = client.mint_tree_nft(
        &player,
        &String::from_str(&env, "Pine"),
        &40712800,      // New York
        &-74006000,
        &1698432000,
        &String::from_str(&env, "https://example.com/pine1.jpg"),
    );

    let nft3 = client.mint_tree_nft(
        &player,
        &String::from_str(&env, "Maple"),
        &34052200,      // Los Angeles
        &-118243700,
        &1698518400,
        &String::from_str(&env, "https://example.com/maple1.jpg"),
    );

    // Get player's trees
    let player_trees = client.get_player_trees(&player);
    assert_eq!(player_trees.len(), 3);
    assert_eq!(player_trees.get(0).unwrap(), nft1);
    assert_eq!(player_trees.get(1).unwrap(), nft2);
    assert_eq!(player_trees.get(2).unwrap(), nft3);
}

#[test]
fn test_multiple_players() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player1 = Address::generate(&env);
    let player2 = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin);

    // Mint for player 1
    client.mint_tree_nft(
        &player1,
        &String::from_str(&env, "Oak"),
        &37774900,
        &-122419400,
        &1698345600,
        &String::from_str(&env, "https://example.com/oak1.jpg"),
    );

    client.mint_tree_nft(
        &player1,
        &String::from_str(&env, "Pine"),
        &40712800,
        &-74006000,
        &1698432000,
        &String::from_str(&env, "https://example.com/pine1.jpg"),
    );

    // Mint for player 2
    client.mint_tree_nft(
        &player2,
        &String::from_str(&env, "Maple"),
        &34052200,
        &-118243700,
        &1698518400,
        &String::from_str(&env, "https://example.com/maple1.jpg"),
    );

    // Verify each player's trees
    assert_eq!(client.get_player_trees(&player1).len(), 2);
    assert_eq!(client.get_player_trees(&player2).len(), 1);
    assert_eq!(client.get_total_trees_minted(), 3);
}

#[test]
fn test_gps_coordinates() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin);

    // Test various GPS locations
    // Tokyo: 35.6762°N, 139.6503°E
    let nft_id = client.mint_tree_nft(
        &player,
        &String::from_str(&env, "Cherry Blossom"),
        &35676200,
        &139650300,
        &1698345600,
        &String::from_str(&env, "https://example.com/cherry.jpg"),
    );

    let tree = client.get_tree_nft(&nft_id);
    assert_eq!(tree.latitude, 35676200);   // 35.6762°N
    assert_eq!(tree.longitude, 139650300); // 139.6503°E
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_cannot_reinitialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreeNFTContract);
    let client = TreeNFTContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    env.mock_all_auths();
    client.initialize(&admin);
    
    // Try to initialize again - should panic
    client.initialize(&admin);
}
