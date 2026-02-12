namespace ArtMarketplace.Api.Models;

public class Transaction
{
    public string TransactionId { get; set; } = Guid.NewGuid().ToString();
    public string ListingId { get; set; } = string.Empty;
    public string ArtworkId { get; set; } = string.Empty;
    public string TokenId { get; set; } = string.Empty;
    public string SellerId { get; set; } = string.Empty;
    public string BuyerId { get; set; } = string.Empty;
    public decimal SalePrice { get; set; }
    public decimal SellerAmount { get; set; }
    public decimal ArtistRoyalty { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal? PartnerFee { get; set; }
    public string? MarketplacePartnerId { get; set; }
    public string PaymentTokenAddress { get; set; } = string.Empty;
    public string BlockchainTransactionHash { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
