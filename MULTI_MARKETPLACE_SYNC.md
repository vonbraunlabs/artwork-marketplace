# Multi-Marketplace Synchronization Strategy

## 🎯 Problem Statement

In a multi-marketplace ecosystem, **multiple marketplaces can list the same NFT simultaneously**. When an NFT is sold on one marketplace, all other marketplaces must be notified to cancel their listings.

## 🔍 Scenarios

### Scenario 1: NFT Listed on Multiple Marketplaces
```
Marketplace A: Lists NFT #123 for $1,000
Marketplace B: Lists NFT #123 for $1,100
Marketplace C: Lists NFT #123 for $900

→ All listings are valid (same owner)
→ Buyer will likely purchase from Marketplace C (lowest price)
```

### Scenario 2: NFT Sold on One Marketplace
```
Buyer purchases NFT #123 from Marketplace C
→ Smart Contract emits: ArtworkSold(tokenId=123, ...)
→ NFT ownership transfers to buyer
→ Marketplace A & B must cancel their listings
```

### Scenario 3: Owner Changes Without Sale
```
Owner transfers NFT #123 directly (not via marketplace)
→ No ArtworkSold event
→ Marketplaces must detect ownership change via periodic validation
```

## ✅ Solution: Dual Synchronization Strategy

### 1. Event-Based Synchronization (Real-Time)

**Service**: `MarketplaceEventListenerService`

**What it does**:
- Listens to `ArtworkSold` events from the smart contract
- Processes **ALL** events, not just our marketplace's listings
- Automatically cancels local listings when NFT is sold

**How it works**:
```csharp
// Listen to ALL ArtworkSold events
var events = await artworkSoldEvent.GetAllChangesAsync<ArtworkSoldEventDto>(filterInput);

foreach (var evt in events)
{
    var tokenId = evt.Event.TokenId.ToString();
    
    // Find OUR active listing for this tokenId
    var activeListing = await dbContext.Listings
        .FirstOrDefaultAsync(l => l.TokenId == tokenId && l.IsActive);
    
    if (activeListing != null)
    {
        // Cancel it - NFT was sold (possibly by another marketplace)
        activeListing.IsActive = false;
        activeListing.SoldAt = DateTime.UtcNow;
    }
}
```

**Frequency**: Every 10 seconds

**Advantages**:
- ✅ Near real-time synchronization
- ✅ Catches sales from any marketplace
- ✅ Low latency (10s max)

**Limitations**:
- ❌ Doesn't catch direct transfers (no sale event)
- ❌ Requires blockchain node access

### 2. Ownership Validation (Periodic)

**Service**: `ListingValidationService`

**What it does**:
- Periodically checks if sellers still own their listed NFTs
- Calls `ownerOf(tokenId)` on the NFT contract
- Cancels listings where ownership has changed

**How it works**:
```csharp
var activeListings = await dbContext.Listings
    .Where(l => l.IsActive)
    .ToListAsync();

foreach (var listing in activeListings)
{
    var currentOwner = await nftContract.ownerOf(listing.TokenId);
    
    if (currentOwner != listing.SellerWalletAddress)
    {
        // Seller no longer owns NFT - cancel listing
        listing.IsActive = false;
        listing.CancelledAt = DateTime.UtcNow;
    }
}
```

**Frequency**: Every 5 minutes

**Advantages**:
- ✅ Catches direct transfers (no sale)
- ✅ Catches any ownership change
- ✅ Self-healing (fixes missed events)

**Limitations**:
- ❌ Higher latency (5 min max)
- ❌ More RPC calls (one per listing)

## 🔐 Smart Contract Protection

The smart contract also validates ownership at purchase time:

```solidity
function purchaseArtwork(uint256 tokenId) external {
    Listing storage listing = _listings[tokenId];
    
    // Verify seller still owns the NFT
    require(artworkNFT.ownerOf(tokenId) == listing.seller, "Seller no longer owns the NFT");
    
    // ... proceed with purchase
}
```

This is the **final safety net** - even if both background services fail, the purchase will revert if ownership is invalid.

## 📊 Complete Flow

```
┌─────────────────────────────────────────────────────────┐
│  NFT #123 Listed on Multiple Marketplaces              │
│  - Marketplace A: $1,000                                │
│  - Marketplace B: $1,100                                │
│  - Marketplace C: $900                                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Buyer Purchases from Marketplace C                     │
│  → Smart Contract: purchaseArtwork(123)                 │
│  → Validates ownership ✅                               │
│  → Transfers NFT to buyer                               │
│  → Emits: ArtworkSold(tokenId=123, ...)                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Event Listener (All Marketplaces)                      │
│  → Marketplace A: Detects ArtworkSold(123)              │
│  → Marketplace B: Detects ArtworkSold(123)              │
│  → Both cancel their listings                           │
│  → Latency: ~10 seconds                                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Validation Service (Backup)                            │
│  → Runs every 5 minutes                                 │
│  → Checks ownerOf(123) for all active listings          │
│  → Cancels any with invalid ownership                   │
│  → Catches missed events or direct transfers            │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Configuration

### appsettings.json
```json
{
  "Blockchain": {
    "NetworkUrl": "https://polygon-rpc.com",
    "NFTAddress": "0x...",
    "MarketplaceAddress": "0x...",
    "DeploymentBlock": 12345678,
    "ChainId": 137
  }
}
```

**Important**:
- `DeploymentBlock`: Block number when marketplace contract was deployed (avoids scanning entire blockchain)
- `NetworkUrl`: RPC endpoint (use Infura, Alchemy, or own node)

## 🚀 Deployment

### 1. Enable Services
Services are automatically registered in `Program.cs`:
```csharp
builder.Services.AddHostedService<MarketplaceEventListenerService>();
builder.Services.AddHostedService<ListingValidationService>();
```

### 2. Configure Blockchain
Update `appsettings.json` with contract addresses after deployment.

### 3. Monitor Logs
```bash
# Watch for synchronization events
docker logs -f art_marketplace_api | grep "Auto-cancelled"
```

## 📈 Performance Considerations

### Event Listener
- **RPC Calls**: 1 per 10 seconds (getBlockNumber) + 1 per new block range (getLogs)
- **Database Queries**: 1 per ArtworkSold event
- **Scalability**: O(events) - scales with marketplace activity

### Validation Service
- **RPC Calls**: N per 5 minutes (where N = active listings)
- **Database Queries**: 1 (fetch all active) + 1 (update invalid)
- **Scalability**: O(listings) - consider batching for >1000 listings

### Optimization Tips
1. Use `DeploymentBlock` to avoid scanning old blocks
2. Increase validation interval if you have many listings
3. Use WebSocket RPC for real-time events (lower latency)
4. Batch `ownerOf` calls using multicall contract

## 🔍 Monitoring

### Key Metrics
- **Event Processing Lag**: Time between event emission and database update
- **Invalid Listings Detected**: Number of listings cancelled by validation
- **RPC Call Rate**: Requests per minute to blockchain node
- **Sync Errors**: Failed event processing or validation runs

### Alerts
- ⚠️ Event listener stopped (no events processed in 1 hour)
- ⚠️ Validation service stopped (no runs in 10 minutes)
- ⚠️ High invalid listing rate (>10% of active listings)
- ⚠️ RPC errors (connection issues)

## 🧪 Testing

### Test Scenario 1: Cross-Marketplace Sale
1. List NFT on Marketplace A
2. List same NFT on Marketplace B
3. Purchase from Marketplace A
4. Verify Marketplace B auto-cancels listing within 10s

### Test Scenario 2: Direct Transfer
1. List NFT on Marketplace A
2. Transfer NFT directly (not via marketplace)
3. Wait 5 minutes
4. Verify Marketplace A auto-cancels listing

### Test Scenario 3: Smart Contract Protection
1. List NFT on Marketplace A
2. Sell NFT on Marketplace B
3. Attempt to purchase from Marketplace A before sync
4. Verify transaction reverts with "Seller no longer owns the NFT"

## 📚 References

- Smart Contract: `contracts/ArtworkMarketplace.sol`
- Event Listener: `marketplace/api/Services/MarketplaceEventListenerService.cs`
- Validation Service: `marketplace/api/Services/ListingValidationService.cs`
- Architecture: `MULTI_MARKETPLACE_REFACTOR.md`

---

**Last Updated**: 2026-02-12  
**Version**: 1.0  
**Status**: ✅ Implemented
