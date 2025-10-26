#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Mock auth for admin
    env.mock_all_auths();

    client.initialize(&admin);

    // Verify total supply is 0
    assert_eq!(client.get_total_supply(), 0);
}

#[test]
fn test_mint() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    env.mock_all_auths();

    // Initialize contract
    client.initialize(&admin);

    // Mint tokens
    let amount = 1000_0000000i128; // 1000 tokens with 7 decimals
    client.mint(&user, &amount);

    // Check balance
    assert_eq!(client.balance(&user), amount);
    assert_eq!(client.get_total_supply(), amount);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    env.mock_all_auths();

    // Initialize and mint
    client.initialize(&admin);
    client.mint(&user1, &1000_0000000);

    // Transfer
    let transfer_amount = 300_0000000i128;
    client.transfer(&user1, &user2, &transfer_amount);

    // Verify balances
    assert_eq!(client.balance(&user1), 700_0000000);
    assert_eq!(client.balance(&user2), 300_0000000);
    assert_eq!(client.get_total_supply(), 1000_0000000);
}

#[test]
fn test_metadata() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    assert_eq!(client.name(), String::from_str(&env, "EcoToken"));
    assert_eq!(client.symbol(), String::from_str(&env, "ECO"));
    assert_eq!(client.decimals(), 7);
}

#[test]
#[should_panic(expected = "Amount must be positive")]
fn test_transfer_zero_amount() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    env.mock_all_auths();

    client.initialize(&admin);
    client.mint(&user1, &1000_0000000);
    
    // This should panic
    client.transfer(&user1, &user2, &0);
}

#[test]
#[should_panic(expected = "Insufficient balance")]
fn test_transfer_insufficient_balance() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EcoToken);
    let client = EcoTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    env.mock_all_auths();

    client.initialize(&admin);
    client.mint(&user1, &100_0000000);
    
    // This should panic - trying to transfer more than balance
    client.transfer(&user1, &user2, &200_0000000);
}
