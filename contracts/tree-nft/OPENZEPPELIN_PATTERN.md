# OpenZeppelin Pattern for Stellar NFTs

## Overview

This document explains the OpenZeppelin pattern for NFT contracts on Stellar, as demonstrated in the example code you provided.

## The OpenZeppelin Pattern

The code you referenced follows this structure:

```rust
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.4.1
#![no_std]

use soroban_sdk::{contract, contractimpl, Env, String};
use stellar_macros::default_impl;
use stellar_tokens::non_fungible::{Base, NonFungibleToken};

#[contract]
pub struct MyToken;

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env) {
        let uri = String::from_str(e, "www.mytoken.com");
        let name = String::from_str(e, "MyToken");
        let symbol = String::from_str(e, "MTK");
        Base::set_metadata(e, uri, name, symbol);
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for MyToken {
    type ContractType = Base;
}
```

## Key Concepts

### 1. Constructor Pattern: `__constructor`
- OpenZeppelin uses `__constructor` as the initialization function
- Sets basic NFT metadata: URI, name, and symbol
- Called once when deploying the contract

### 2. Base Implementation
- `stellar_tokens::non_fungible::Base` provides standard NFT functionality
- Handles ownership, transfers, approvals, etc.
- Similar to OpenZeppelin's ERC721 on Ethereum

### 3. Trait Implementation
- `NonFungibleToken` trait defines the standard interface
- `#[default_impl]` macro generates default implementations
- You can override specific functions for custom behavior

## EcoStellar Implementation Comparison

### Current Implementation (`lib.rs`)
Our current implementation is **custom-built** with:
- ✅ Full control over storage layout
- ✅ Tree-specific metadata (species, GPS, planting date)
- ✅ Soulbound (non-transferable) NFTs
- ✅ Admin-only minting
- ❌ Not using OpenZeppelin standard (doesn't exist on crates.io yet)

### OpenZeppelin Pattern (`lib_openzeppelin_pattern.rs`)
We created a **pattern-compatible** version with:
- ✅ OpenZeppelin naming conventions (`__constructor`, `name()`, `symbol()`, `total_supply()`)
- ✅ Standard NFT interface (owner_of, balance_of, token_uri)
- ✅ Extended tree metadata
- ✅ Same functionality as custom implementation
- ⚠️ Manual implementation (since `stellar-tokens` crate isn't published yet)

## Which One to Use?

### Use Current Implementation (`lib.rs`) if:
- You want a working contract **right now**
- You need custom, tree-specific logic
- You're okay with a non-standard interface

### Use OpenZeppelin Pattern (`lib_openzeppelin_pattern.rs`) if:
- You want **future compatibility** with OpenZeppelin standards
- You need **interoperability** with other NFT tools/marketplaces
- You prefer **standard naming conventions** (name, symbol, totalSupply)

## Migration Path

When OpenZeppelin Stellar contracts are officially released:

1. **Update Cargo.toml:**
```toml
[dependencies]
soroban-sdk = "21.7.0"
stellar-tokens = "0.4"
stellar-macros = "0.4"
```

2. **Update lib.rs:**
```rust
use stellar_macros::default_impl;
use stellar_tokens::non_fungible::{Base, NonFungibleToken};

#[default_impl]
#[contractimpl]
impl NonFungibleToken for TreeNFT {
    type ContractType = Base;
}
```

3. **Keep custom functions:**
```rust
pub fn mint_tree(...) -> u64 {
    // Your tree-specific logic
}

pub fn get_tree_data(...) -> TreeMetadata {
    // Tree metadata
}
```

## Differences from Ethereum ERC721

| Feature | Ethereum ERC721 | Stellar NFT |
|---------|----------------|-------------|
| Standard | EIP-721 | Not yet standardized |
| Transfer | `transferFrom()` | Would be `transfer()` |
| Approval | `approve()`, `setApprovalForAll()` | Similar in Base implementation |
| Metadata | `tokenURI()` | `token_uri()` (snake_case) |
| Events | Solidity events | Soroban events (`env.events().publish()`) |
| Constructor | `constructor()` | `__constructor()` |

## Testing Both Implementations

Both implementations include the same test suite in `test.rs`:

```bash
# Test custom implementation
cargo test

# To test OpenZeppelin pattern (when ready):
# 1. Rename lib_openzeppelin_pattern.rs to lib.rs
# 2. cargo test
```

## Recommendation

**For EcoStellar, I recommend using the OpenZeppelin pattern implementation** (`lib_openzeppelin_pattern.rs`) because:

1. ✅ **Future-proof**: Ready for when OpenZeppelin releases official contracts
2. ✅ **Standard interface**: Easier integration with wallets and explorers
3. ✅ **Professional**: Follows industry best practices
4. ✅ **Familiar**: Developers know `name()`, `symbol()`, `totalSupply()` from Ethereum
5. ✅ **Same functionality**: All tree-specific features are preserved

## Next Steps

1. **Replace current implementation:**
```bash
cd contracts/tree-nft/src
mv lib.rs lib_custom.rs
mv lib_openzeppelin_pattern.rs lib.rs
```

2. **Update tests if needed** (test.rs should work with both)

3. **Rebuild:**
```bash
cargo build --target wasm32-unknown-unknown --release
```

4. **Test:**
```bash
cargo test
```

## References

- **OpenZeppelin Contracts Wizard**: [wizard.openzeppelin.com](https://wizard.openzeppelin.com)
- **Stellar Soroban Docs**: [developers.stellar.org/docs/smart-contracts](https://developers.stellar.org/docs/smart-contracts)
- **ERC721 Standard**: [eips.ethereum.org/EIPS/eip-721](https://eips.ethereum.org/EIPS/eip-721)

## Questions?

The OpenZeppelin pattern is more industry-standard and will make your NFTs compatible with future tooling, wallets, and marketplaces on Stellar. Both implementations work today, but the OpenZeppelin pattern is the better long-term choice.
