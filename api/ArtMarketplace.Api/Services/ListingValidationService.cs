using Microsoft.EntityFrameworkCore;
using Nethereum.Web3;
using Nethereum.Contracts;
using ArtMarketplace.Api.Data;

namespace ArtMarketplace.Api.Services;

/// <summary>
/// Periodically validates that active listings still have valid ownership
/// Cancels listings where the seller no longer owns the NFT
/// </summary>
public class ListingValidationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ListingValidationService> _logger;

    public ListingValidationService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<ListingValidationService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Listing Validation Service starting...");

        // Wait 1 minute before first run
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ValidateActiveListings();
                
                // Run every 5 minutes
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating listings");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }

    private async Task ValidateActiveListings()
    {
        var networkUrl = _configuration["Blockchain:NetworkUrl"];
        var nftAddress = _configuration["Blockchain:NFTAddress"];

        if (string.IsNullOrEmpty(networkUrl) || string.IsNullOrEmpty(nftAddress))
        {
            _logger.LogWarning("Blockchain configuration missing. Validation skipped.");
            return;
        }

        var web3 = new Web3(networkUrl);
        var nftContract = web3.Eth.GetContract(GetNftAbi(), nftAddress);
        var ownerOfFunction = nftContract.GetFunction("ownerOf");

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MarketplaceDbContext>();

        var activeListings = await dbContext.Listings
            .Where(l => l.IsActive)
            .ToListAsync();

        var invalidCount = 0;

        foreach (var listing in activeListings)
        {
            try
            {
                var tokenId = System.Numerics.BigInteger.Parse(listing.TokenId);
                var currentOwner = await ownerOfFunction.CallAsync<string>(tokenId);

                // If seller no longer owns the NFT, cancel the listing
                if (!string.Equals(currentOwner, listing.SellerWalletAddress, StringComparison.OrdinalIgnoreCase))
                {
                    listing.IsActive = false;
                    listing.CancelledAt = DateTime.UtcNow;
                    invalidCount++;

                    _logger.LogWarning(
                        "Auto-cancelled listing {ListingId} for tokenId {TokenId} - Seller no longer owns NFT. Current owner: {CurrentOwner}",
                        listing.ListingId, listing.TokenId, currentOwner);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating listing {ListingId} for tokenId {TokenId}", 
                    listing.ListingId, listing.TokenId);
            }
        }

        if (invalidCount > 0)
        {
            await dbContext.SaveChangesAsync();
            _logger.LogInformation("Validated {Total} listings, cancelled {Invalid} invalid listings", 
                activeListings.Count, invalidCount);
        }
        else
        {
            _logger.LogDebug("Validated {Total} listings, all valid", activeListings.Count);
        }
    }

    private string GetNftAbi()
    {
        // Minimal ABI - only ownerOf function
        return @"[
            {
                ""inputs"": [{""name"": ""tokenId"", ""type"": ""uint256""}],
                ""name"": ""ownerOf"",
                ""outputs"": [{""name"": """", ""type"": ""address""}],
                ""stateMutability"": ""view"",
                ""type"": ""function""
            }
        ]";
    }
}
