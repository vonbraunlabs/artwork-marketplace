namespace ArtMarketplace.Api.Models;

public class MarketplaceListing
{
    public string ListingId { get; set; } = Guid.NewGuid().ToString();
    public string ArtworkId { get; set; } = string.Empty;
    public string TokenId { get; set; } = string.Empty;
    public string SellerUserId { get; set; } = string.Empty;
    public string SellerWalletAddress { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PaymentToken { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? MarketplacePartnerId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public DateTime? SoldAt { get; set; }
}
