# Art Marketplace - Reference Implementation

This is a **reference implementation** of a marketplace for tokenized artworks. It's designed to be used as a starting point for partners who want to build their own marketplace using the Art Tokenization Platform.

## 🌟 Features

- **NFT Marketplace**: List and purchase tokenized artworks
- **Multi-Currency Support**: Accept multiple ERC-20 stablecoins (USDC, USDT, DAI)
- **Partner Fee Sharing**: Automatic revenue split between platform and marketplace partner
- **Tokenization API Integration**: Verify artwork authenticity via the core platform
- **Separate Database**: Independent data storage for marketplace operations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Art Tokenization Platform (Private - Core)             │
│  - Artwork registration & verification                  │
│  - IoT device management                                │
│  - NFT minting                                          │
│  - Ownership history                                    │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP API
                            │
┌───────────────────────────┼─────────────────────────────┐
│  Art Marketplace (Public - This Repository)             │
│  - Listings management                                  │
│  - Search & filters                                     │
│  - Purchase tracking                                    │
│  - Partner integration                                  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK
- MySQL 8.0
- Access to Art Tokenization Platform API (contact us for API key)
- Ethereum node (local or remote)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace
   ```

2. **Configure database**
   ```bash
   docker-compose up -d mysql_marketplace
   ```

3. **Update configuration**
   
   Edit `ArtMarketplace.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Port=3307;Database=art_marketplace;User=app_user;Password=app_password;"
     },
     "TokenizationApi": {
       "BaseUrl": "https://api.arttokenization.com",
       "ApiKey": "your-api-key-here"
     },
     "Blockchain": {
       "NetworkUrl": "https://polygon-rpc.com",
       "MarketplaceAddress": "0x...",
       "ChainId": 137
     }
   }
   ```

4. **Run migrations**
   ```bash
   cd ArtMarketplace.Api
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:5002`.

## 📦 Smart Contract Integration

This marketplace uses the `ArtworkMarketplace.sol` smart contract. Key features:

- **Partner Fee Split**: 60% of marketplace fee goes to partner, 40% to platform
- **Automatic Distribution**: Seller, artist royalty, platform fee, and partner fee are distributed automatically
- **Multi-Currency**: Supports any ERC-20 token whitelisted by the platform

### Registering as a Partner

To receive fee sharing, you need to be registered as an approved partner:

1. Contact the platform team with your wallet address
2. They will call `setMarketplacePartner(yourAddress, true)` on the smart contract
3. When creating listings, pass your wallet address as `marketplacePartner` parameter

## 🔧 Customization

### Adding Custom Features

You can extend this marketplace with:

- Custom search filters
- Recommendation engine
- Social features (comments, likes)
- Auction functionality
- Bulk operations

### Branding

Update the frontend (not included in this repo) with your own:

- Logo and colors
- Domain name
- Terms of service
- Privacy policy

## 📚 API Documentation

### Endpoints

#### Create Listing
```http
POST /api/listings
Content-Type: application/json

{
  "artworkId": "uuid",
  "tokenId": "1",
  "price": "1000.00",
  "paymentTokenAddress": "0x...",
  "marketplacePartnerId": "uuid"
}
```

#### Get Listings
```http
GET /api/listings?page=1&pageSize=20&minPrice=0&maxPrice=10000
```

#### Purchase Artwork
```http
POST /api/listings/{listingId}/purchase
```

Full API documentation available at `/swagger` when running in development mode.

## 🤝 Integration with Tokenization Platform

### Verifying Artwork Authenticity

```csharp
var client = serviceProvider.GetRequiredService<ITokenizationApiClient>();
var artwork = await client.GetArtworkAsync(artworkId);

if (artwork == null || artwork.Status != "Verified")
{
    return BadRequest("Artwork not found or not verified");
}
```

### Getting Ownership History

```csharp
var history = await client.GetOwnershipHistoryAsync(tokenId);
```

## 💰 Revenue Model

As a marketplace partner, you earn:

- **60% of marketplace fee** (1.5% of sale price if platform fee is 2.5%)
- **100% of subscription fees** (if you implement your own subscription model)

Example: $10,000 artwork sale
- Marketplace fee: $250 (2.5%)
- Your share: $150 (60% of $250)
- Platform share: $100 (40% of $250)

## 🔒 Security

- Never store private keys in the backend
- All purchases are executed via MetaMask in the frontend
- Backend only tracks on-chain events
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🆘 Support

- **Documentation**: https://docs.arttokenization.com
- **API Reference**: https://api.arttokenization.com/docs
- **Discord**: https://discord.gg/arttokenization
- **Email**: partners@arttokenization.com

## 🎯 Roadmap

- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Advanced search with Elasticsearch
- [ ] Analytics dashboard
- [ ] Mobile app SDK

## 🙏 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ by the Art Tokenization Platform community**
