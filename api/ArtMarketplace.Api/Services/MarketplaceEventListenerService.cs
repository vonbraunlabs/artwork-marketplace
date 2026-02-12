using Microsoft.EntityFrameworkCore;
using Nethereum.Web3;
using Nethereum.Contracts;
using ArtMarketplace.Api.Data;
using ArtMarketplace.Api.Models;

namespace ArtMarketplace.Api.Services;

/// <summary>
/// Listens to ArtworkMarketplace smart contract events to sync marketplace state
/// CRITICAL: Listens to ALL marketplace events, not just our own listings
/// This ensures we cancel our listings when NFTs are sold by other marketplaces
/// </summary>
public class MarketplaceEventListenerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MarketplaceEventListenerService> _logger;
    private Web3? _web3;
    private Contract? _marketplaceContract;

    public MarketplaceEventListenerService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<MarketplaceEventListenerService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Marketplace Event Listener Service starting...");

        var networkUrl = _configuration["Blockchain:NetworkUrl"];
        var marketplaceAddress = _configuration["Blockchain:MarketplaceAddress"];

        if (string.IsNullOrEmpty(networkUrl) || string.IsNullOrEmpty(marketplaceAddress))
        {
            _logger.LogWarning("Blockchain configuration missing. Event listener disabled.");
            return;
        }

        _web3 = new Web3(networkUrl);
        _marketplaceContract = _web3.Eth.GetContract(GetMarketplaceAbi(), marketplaceAddress);

        var deploymentBlock = _configuration.GetValue<ulong>("Blockchain:DeploymentBlock", 0);
        var currentBlock = deploymentBlock;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var latestBlock = await _web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
                var toBlock = (ulong)latestBlock.Value;

                if (currentBlock < toBlock)
                {
                    await ProcessArtworkSoldEvents(currentBlock, toBlock);
                    currentBlock = toBlock;
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing blockchain events");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }

    private async Task ProcessArtworkSoldEvents(ulong fromBlock, ulong toBlock)
    {
        var artworkSoldEvent = _marketplaceContract!.GetEvent("ArtworkSold");
        var filterInput = artworkSoldEvent.CreateFilterInput(
            fromBlock: new Nethereum.RPC.Eth.DTOs.BlockParameter(fromBlock),
            toBlock: new Nethereum.RPC.Eth.DTOs.BlockParameter(toBlock)
        );

        var events = await artworkSoldEvent.GetAllChangesAsync<ArtworkSoldEventDto>(filterInput);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MarketplaceDbContext>();

        foreach (var evt in events)
        {
            try
            {
                var tokenId = evt.Event.TokenId.ToString();
                
                // Find any active listing for this tokenId (regardless of who created it)
                var activeListing = await dbContext.Listings
                    .FirstOrDefaultAsync(l => l.TokenId == tokenId && l.IsActive);

                if (activeListing != null)
                {
                    // Cancel our listing since the NFT was sold (possibly by another marketplace)
                    activeListing.IsActive = false;
                    activeListing.SoldAt = DateTime.UtcNow;
                    
                    _logger.LogInformation(
                        "Auto-cancelled listing {ListingId} for tokenId {TokenId} - NFT sold on blockchain",
                        activeListing.ListingId, tokenId);
                }

                // Record transaction if it was from our marketplace
                var isOurTransaction = await dbContext.Listings
                    .AnyAsync(l => l.TokenId == tokenId && !string.IsNullOrEmpty(l.MarketplacePartnerId));

                if (isOurTransaction)
                {
                    var transaction = new Transaction
                    {
                        TransactionId = Guid.NewGuid().ToString(),
                        ListingId = activeListing?.ListingId ?? string.Empty,
                        TokenId = tokenId,
                        SellerId = evt.Event.Seller,
                        BuyerId = evt.Event.Buyer,
                        SalePrice = (decimal)Web3.Convert.FromWei(evt.Event.Price),
                        SellerAmount = (decimal)Web3.Convert.FromWei(evt.Event.Price - evt.Event.RoyaltyPaid - evt.Event.PlatformFee - evt.Event.PartnerFee),
                        ArtistRoyalty = (decimal)Web3.Convert.FromWei(evt.Event.RoyaltyPaid),
                        PlatformFee = (decimal)Web3.Convert.FromWei(evt.Event.PlatformFee),
                        PartnerFee = evt.Event.PartnerFee > 0 ? (decimal)Web3.Convert.FromWei(evt.Event.PartnerFee) : null,
                        PaymentTokenAddress = evt.Event.PaymentToken,
                        BlockchainTransactionHash = evt.Log.TransactionHash,
                        Status = "Completed",
                        CreatedAt = DateTime.UtcNow,
                        CompletedAt = DateTime.UtcNow
                    };

                    dbContext.Transactions.Add(transaction);
                }

                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ArtworkSold event for tokenId {TokenId}", evt.Event.TokenId);
            }
        }
    }

    private string GetMarketplaceAbi()
    {
        // Minimal ABI - only ArtworkSold event
        return @"[
            {
                ""anonymous"": false,
                ""inputs"": [
                    {""indexed"": true, ""name"": ""tokenId"", ""type"": ""uint256""},
                    {""indexed"": true, ""name"": ""seller"", ""type"": ""address""},
                    {""indexed"": true, ""name"": ""buyer"", ""type"": ""address""},
                    {""indexed"": false, ""name"": ""price"", ""type"": ""uint256""},
                    {""indexed"": false, ""name"": ""paymentToken"", ""type"": ""address""},
                    {""indexed"": false, ""name"": ""royaltyPaid"", ""type"": ""uint256""},
                    {""indexed"": false, ""name"": ""platformFee"", ""type"": ""uint256""},
                    {""indexed"": false, ""name"": ""partnerFee"", ""type"": ""uint256""}
                ],
                ""name"": ""ArtworkSold"",
                ""type"": ""event""
            }
        ]";
    }
}

public class ArtworkSoldEventDto
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "tokenId", 1, true)]
    public System.Numerics.BigInteger TokenId { get; set; }

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "seller", 2, true)]
    public string Seller { get; set; } = string.Empty;

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "buyer", 3, true)]
    public string Buyer { get; set; } = string.Empty;

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "price", 4, false)]
    public System.Numerics.BigInteger Price { get; set; }

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "paymentToken", 5, false)]
    public string PaymentToken { get; set; } = string.Empty;

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "royaltyPaid", 6, false)]
    public System.Numerics.BigInteger RoyaltyPaid { get; set; }

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "platformFee", 7, false)]
    public System.Numerics.BigInteger PlatformFee { get; set; }

    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "partnerFee", 8, false)]
    public System.Numerics.BigInteger PartnerFee { get; set; }
}
