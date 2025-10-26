#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// Mock EcoToken contract client for testing
mod eco_token {
    soroban_sdk::contractimport!(
        file = "../eco-token/target/wasm32-unknown-unknown/release/eco_token.wasm"
    );
}

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, GameRewards);
    let client = GameRewardsClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let eco_token = Address::generate(&env);

    env.mock_all_auths();

    client.initialize(&admin, &eco_token);

    // Verify EcoToken contract address is stored
    assert_eq!(client.get_eco_token_contract(), eco_token);
}

#[test]
fn test_record_game_session() {
    let env = Env::default();
    
    // Deploy EcoToken contract
    let eco_token_id = env.register_contract_wasm(None, eco_token::WASM);
    let eco_token_client = eco_token::Client::new(&env, &eco_token_id);
    
    // Deploy GameRewards contract
    let game_rewards_id = env.register_contract(None, GameRewards);
    let game_rewards_client = GameRewardsClient::new(&env, &game_rewards_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    // Initialize EcoToken with GameRewards contract as admin
    eco_token_client.initialize(&game_rewards_id);

    // Initialize GameRewards
    game_rewards_client.initialize(&admin, &eco_token_id);

    // Record a game session (score = 500 -> 50 ECO tokens)
    let result = game_rewards_client.record_game_session(
        &player,
        &500,
        &String::from_str(&env, "quest"),
    );

    // Verify session result
    assert_eq!(result.session_id, 1);
    assert_eq!(result.tokens_earned, 50 * 10_000_000); // 50 ECO with 7 decimals

    // Verify player stats
    let stats = game_rewards_client.get_player_stats(&player);
    assert_eq!(stats.total_games_played, 1);
    assert_eq!(stats.total_score, 500);
    assert_eq!(stats.total_tokens_earned, 50 * 10_000_000);

    // Verify player received tokens
    let balance = eco_token_client.balance(&player);
    assert_eq!(balance, 50 * 10_000_000);
}

#[test]
fn test_minimum_score_requirement() {
    let env = Env::default();
    
    let eco_token_id = env.register_contract_wasm(None, eco_token::WASM);
    let eco_token_client = eco_token::Client::new(&env, &eco_token_id);
    
    let game_rewards_id = env.register_contract(None, GameRewards);
    let game_rewards_client = GameRewardsClient::new(&env, &game_rewards_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    eco_token_client.initialize(&game_rewards_id);
    game_rewards_client.initialize(&admin, &eco_token_id);

    // Score below minimum (< 50)
    let result = game_rewards_client.record_game_session(
        &player,
        &40,
        &String::from_str(&env, "puzzle"),
    );

    // Should earn 0 tokens
    assert_eq!(result.tokens_earned, 0);

    // Player should have 0 balance
    let balance = eco_token_client.balance(&player);
    assert_eq!(balance, 0);
}

#[test]
fn test_maximum_reward_cap() {
    let env = Env::default();
    
    let eco_token_id = env.register_contract_wasm(None, eco_token::WASM);
    let eco_token_client = eco_token::Client::new(&env, &eco_token_id);
    
    let game_rewards_id = env.register_contract(None, GameRewards);
    let game_rewards_client = GameRewardsClient::new(&env, &game_rewards_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    eco_token_client.initialize(&game_rewards_id);
    game_rewards_client.initialize(&admin, &eco_token_id);

    // Very high score (20000 would normally give 2000 tokens)
    let result = game_rewards_client.record_game_session(
        &player,
        &20000,
        &String::from_str(&env, "boss_battle"),
    );

    // Should be capped at 1000 ECO
    assert_eq!(result.tokens_earned, 1000 * 10_000_000);
}

#[test]
fn test_multiple_sessions() {
    let env = Env::default();
    
    let eco_token_id = env.register_contract_wasm(None, eco_token::WASM);
    let eco_token_client = eco_token::Client::new(&env, &eco_token_id);
    
    let game_rewards_id = env.register_contract(None, GameRewards);
    let game_rewards_client = GameRewardsClient::new(&env, &game_rewards_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    eco_token_client.initialize(&game_rewards_id);
    game_rewards_client.initialize(&admin, &eco_token_id);

    // Play 3 games
    game_rewards_client.record_game_session(
        &player,
        &100,
        &String::from_str(&env, "quest"),
    );
    game_rewards_client.record_game_session(
        &player,
        &200,
        &String::from_str(&env, "puzzle"),
    );
    game_rewards_client.record_game_session(
        &player,
        &300,
        &String::from_str(&env, "battle"),
    );

    // Verify stats
    let stats = game_rewards_client.get_player_stats(&player);
    assert_eq!(stats.total_games_played, 3);
    assert_eq!(stats.total_score, 600);
    // 10 + 20 + 30 = 60 ECO
    assert_eq!(stats.total_tokens_earned, 60 * 10_000_000);

    // Verify total sessions
    assert_eq!(game_rewards_client.get_total_sessions(), 3);
}

#[test]
fn test_get_game_session() {
    let env = Env::default();
    
    let eco_token_id = env.register_contract_wasm(None, eco_token::WASM);
    let eco_token_client = eco_token::Client::new(&env, &eco_token_id);
    
    let game_rewards_id = env.register_contract(None, GameRewards);
    let game_rewards_client = GameRewardsClient::new(&env, &game_rewards_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    env.mock_all_auths();

    eco_token_client.initialize(&game_rewards_id);
    game_rewards_client.initialize(&admin, &eco_token_id);

    // Record session
    let game_type = String::from_str(&env, "adventure");
    game_rewards_client.record_game_session(&player, &750, &game_type);

    // Retrieve session
    let session = game_rewards_client.get_game_session(&1);

    assert_eq!(session.session_id, 1);
    assert_eq!(session.player, player);
    assert_eq!(session.score, 750);
    assert_eq!(session.game_type, game_type);
    assert_eq!(session.tokens_earned, 75 * 10_000_000);
}
