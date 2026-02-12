using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ArtMarketplace.Api.Data;
using ArtMarketplace.Api.Models;
using Microsoft.EntityFrameworkCore;
using ArtTokenization.Shared.Client;

namespace ArtMarketplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListingsController : ControllerBase
{
    private readonly MarketplaceDbContext _context;
    private readonly ITokenizationApiClient _tokenizationClient;

    public ListingsController(MarketplaceDbContext context, ITokenizationApiClient tokenizationClient)
    {
        _context = context;
        _tokenizationClient = tokenizationClient;
    }

    [HttpPost]
    public async Task<IActionResult> CreateListing([FromBody] CreateListingRequest request)
    {
        var userId = User.FindFirst("userId")!.Value;
        var walletAddress = User.FindFirst("wallet")!.Value;

        // Verify artwork exists in tokenization platform
        var artwork = await _tokenizationClient.GetArtworkAsync(request.ArtworkId);
        if (artwork == null) return NotFound("Artwork not found");

        var listing = new MarketplaceListing
        {
            ListingId = Guid.NewGuid().ToString(),
            ArtworkId = request.ArtworkId,
            TokenId = request.TokenId,
            SellerUserId = userId,
            SellerWalletAddress = walletAddress,
            Price = request.Price,
            PaymentToken = request.PaymentToken,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        return Ok(listing);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetListings(
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Listings.Where(l => l.IsActive);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(l => l.Category == category);

        if (minPrice.HasValue)
            query = query.Where(l => l.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(l => l.Price <= maxPrice.Value);

        var total = await query.CountAsync();
        var listings = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, listings });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetListing(string id)
    {
        var listing = await _context.Listings.FindAsync(id);
        if (listing == null) return NotFound();
        return Ok(listing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelListing(string id)
    {
        var userId = User.FindFirst("userId")!.Value;
        var listing = await _context.Listings.FindAsync(id);
        
        if (listing == null) return NotFound();
        if (listing.SellerUserId != userId) return Forbid();

        listing.IsActive = false;
        listing.CancelledAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Listing cancelled successfully" });
    }
}

public record CreateListingRequest(
    string ArtworkId,
    string TokenId,
    decimal Price,
    string PaymentToken
);
