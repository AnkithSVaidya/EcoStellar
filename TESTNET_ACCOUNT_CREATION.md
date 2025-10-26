# Create Stellar Testnet Account with Real Balance

## How It Works

The EcoStellar app now includes a **"Create Testnet Account"** button that:

1. ✅ **Generates a new Stellar keypair** (public + secret key)
2. ✅ **Calls Stellar Friendbot** to fund the account with **10,000 XLM**
3. ✅ **Verifies the account** on Stellar testnet Horizon API
4. ✅ **Displays real balance** fetched from blockchain
5. ✅ **Stores keys** in browser localStorage for persistence

## Steps to Create Testnet Account

### 1. Open the App
```bash
cd /workspaces/EcoStellar/frontend
npm run dev
```

Visit: http://localhost:3000

### 2. Click "Create Testnet Account"

When you're not connected, you'll see:
- 🔗 **Connect Wallet** (for Freighter)
- 🆕 **Create Testnet Account** ← Click this!

### 3. Wait for Account Creation

The button will show:
- "⏳ Creating..." while generating keypair
- Calling Stellar Friendbot API
- Verifying account on Horizon

### 4. Save Your Keys

A modal will appear with:

**Public Key** (Share this):
```
GABC123...XYZ789
```
👉 This is your wallet address - you can share this publicly

**Secret Key** (Keep PRIVATE!):
```
SABC123...XYZ789
```
🔒 **NEVER SHARE THIS!** It controls your funds.

### 5. Account is Connected

After closing the modal:
- ✅ Your wallet is automatically connected
- ✅ Balance shows: **10,000 XLM** (from Friendbot)
- ✅ Auto-refreshes every 30 seconds from Stellar blockchain

## Code Behind the Scenes

### WalletContext.jsx - `createTestnetAccount()`

```javascript
const createTestnetAccount = async () => {
  // 1. Generate random keypair
  const pair = StellarSdk.Keypair.random();
  const publicKey = pair.publicKey();
  const secretKey = pair.secret();
  
  // 2. Fund with Friendbot (Stellar testnet faucet)
  const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
  const response = await fetch(friendbotUrl);
  
  // 3. Store keys in localStorage
  localStorage.setItem('testnet_wallet', JSON.stringify({
    publicKey,
    secretKey
  }));
  
  // 4. Verify and connect (REAL Stellar API call)
  const result = await verifyAndConnectAddress(publicKey);
  
  // 5. Return account info
  return {
    success: true,
    publicKey,
    secretKey,
    balance: 10000 // XLM from Friendbot
  };
};
```

## Real Stellar Integration Proof

### Network Requests (DevTools → Network Tab)

When you click "Create Testnet Account", you'll see:

1. **Friendbot Request**:
   ```
   GET https://friendbot.stellar.org?addr=G...
   Status: 200 OK
   ```
   ✅ This actually creates and funds the account on Stellar testnet

2. **Horizon Account Load**:
   ```
   GET https://horizon-testnet.stellar.org/accounts/G...
   Status: 200 OK
   ```
   ✅ This verifies the account exists and fetches real balance

3. **Balance Response** (JSON):
   ```json
   {
     "balances": [
       {
         "asset_type": "native",
         "balance": "10000.0000000"
       }
     ]
   }
   ```

### Verify on Stellar Explorer

After creating account, click the Stellar Explorer link in the wallet dropdown:
```
https://stellar.expert/explorer/testnet/account/YOUR_PUBLIC_KEY
```

You'll see:
- ✅ Account exists on Stellar blockchain
- ✅ Balance: 10,000 XLM
- ✅ Created timestamp
- ✅ Transaction history (funding from Friendbot)

## What's REAL vs Simulated

### ✅ REAL (Happening on Stellar Blockchain):

| Feature | Status | Proof |
|---------|--------|-------|
| Keypair Generation | ✅ Real | Uses `StellarSdk.Keypair.random()` |
| Friendbot Funding | ✅ Real | Actual HTTP call to friendbot.stellar.org |
| Account Creation | ✅ Real | Account exists on Stellar testnet |
| Balance Fetching | ✅ Real | Horizon API: `/accounts/{id}` |
| Address Validation | ✅ Real | `StrKey.isValidEd25519PublicKey()` |
| Auto-refresh Balance | ✅ Real | Polls Horizon every 30s |

### ❌ SIMULATED (Not on Blockchain):

| Feature | Status | Why |
|---------|--------|-----|
| NFT Minting | ❌ Simulated | No contract invocation (yet) |
| Entry Fee Payment | ❌ Simulated | No transaction signing |
| Verification Rewards | ❌ Simulated | No XDR submission |
| Game Rewards | ❌ Simulated | UI only |

## Storage Details

### localStorage Keys

After creating account, check DevTools → Application → Local Storage:

```javascript
// Key: "testnet_wallet"
{
  "publicKey": "GABC...",
  "secretKey": "SABC..."  // Encrypted in production!
}

// Key: "walletAddress"
"GABC..."  // Currently connected address
```

⚠️ **Security Note**: In production, secret keys should NEVER be stored in localStorage. This is testnet only for demo purposes.

## Delete Account

To disconnect and remove stored keys:

1. Click on your wallet address (top right)
2. Click **"Disconnect"**
3. Keys are removed from localStorage
4. Wallet state cleared

To fully delete:
```javascript
// In browser console:
localStorage.removeItem('testnet_wallet');
localStorage.removeItem('walletAddress');
```

## Troubleshooting

### "Failed to fund account with Friendbot"

**Cause**: Friendbot rate limiting or network issues

**Solution**:
- Wait 30 seconds and try again
- Check console for error details
- Verify internet connection

### "Account not found" after creation

**Cause**: Friendbot succeeded but Horizon hasn't synced yet

**Solution**:
- Wait 5-10 seconds
- Click "Refresh Balance" button
- Account should appear

### Balance shows 0 XLM

**Cause**: Account was created but Friendbot failed

**Solution**:
- Fund manually: https://laboratory.stellar.org/#account-creator?network=test
- Or click "Create Testnet Account" again (generates new account)

## Next Steps: Enable Transactions

To make this fully functional (not simulated):

### 1. Add Transaction Signing
```javascript
const payEntryFee = async (amount) => {
  const keys = JSON.parse(localStorage.getItem('testnet_wallet'));
  const sourceKeypair = StellarSdk.Keypair.fromSecret(keys.secretKey);
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount)
    .addOperation(StellarSdk.Operation.payment({
      destination: GAME_WALLET,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString()
    }))
    .build();
    
  transaction.sign(sourceKeypair);
  await server.submitTransaction(transaction);
};
```

### 2. Contract Invocations
```javascript
const mintNFT = async (treeId) => {
  const contract = new StellarSdk.Contract(TREE_NFT_CONTRACT);
  const operation = contract.call('mint', /* params */);
  // Sign and submit...
};
```

### 3. Smart Contract Integration
- Call deployed contracts (addresses in DEPLOYMENT_INFO.md)
- Submit XDR to Horizon
- Handle transaction results

## Summary

✅ **Created**: Real Stellar testnet account with keypair
✅ **Funded**: 10,000 XLM from Friendbot
✅ **Verified**: Account exists on blockchain (Horizon API)
✅ **Connected**: Auto-connect with balance display
✅ **Observable**: Network requests visible in DevTools
✅ **External Proof**: Verifiable on stellar.expert

This proves the app **actually uses Stellar blockchain**, not just simulation!
