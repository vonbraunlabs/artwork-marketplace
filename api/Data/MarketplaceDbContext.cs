using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ArtMarketplace.Api.Models;

namespace ArtMarketplace.Api.Data;

public class MarketplaceDbContext : DbContext
{
    public MarketplaceDbContext(DbContextOptions<MarketplaceDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<MarketplaceListing> Listings { get; set; } = null!;
    public DbSet<MarketplacePartner> Partners { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.WalletAddress).IsUnique();
        });

        modelBuilder.Entity<MarketplaceListing>(entity =>
        {
            entity.HasKey(e => e.ListingId);
            entity.HasIndex(e => e.ArtworkId);
            entity.HasIndex(e => e.TokenId);
            entity.HasIndex(e => e.SellerId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.MarketplacePartnerId);
            entity.Property(e => e.Price).HasPrecision(20, 8);
        });

        modelBuilder.Entity<MarketplacePartner>(entity =>
        {
            entity.HasKey(e => e.PartnerId);
            entity.HasIndex(e => e.WalletAddress).IsUnique();
            entity.HasIndex(e => e.ApiKey).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.HasIndex(e => e.ListingId);
            entity.HasIndex(e => e.ArtworkId);
            entity.HasIndex(e => e.TokenId);
            entity.HasIndex(e => e.SellerId);
            entity.HasIndex(e => e.BuyerId);
            entity.HasIndex(e => e.BlockchainTransactionHash);
            entity.HasIndex(e => e.MarketplacePartnerId);
            entity.Property(e => e.SalePrice).HasPrecision(20, 8);
            entity.Property(e => e.SellerAmount).HasPrecision(20, 8);
            entity.Property(e => e.ArtistRoyalty).HasPrecision(20, 8);
            entity.Property(e => e.PlatformFee).HasPrecision(20, 8);
            entity.Property(e => e.PartnerFee).HasPrecision(20, 8);
        });
    }
}

public class MarketplaceDbContextFactory : IDesignTimeDbContextFactory<MarketplaceDbContext>
{
    public MarketplaceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MarketplaceDbContext>();
        var connectionString = "Server=localhost;Port=3307;Database=art_marketplace;User=root;Password=root_password;";
        optionsBuilder.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0)), mySqlOptions => mySqlOptions.EnableRetryOnFailure());
        return new MarketplaceDbContext(optionsBuilder.Options);
    }
}
