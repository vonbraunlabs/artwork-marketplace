-- Art Marketplace Database Schema
-- Database: art_marketplace
-- Port: 3307

CREATE DATABASE IF NOT EXISTS art_marketplace;
USE art_marketplace;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    UserId CHAR(36) PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    WalletAddress VARCHAR(42) NOT NULL UNIQUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME,
    INDEX idx_email (Email),
    INDEX idx_wallet (WalletAddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MarketplaceListings table
CREATE TABLE IF NOT EXISTS MarketplaceListings (
    ListingId CHAR(36) PRIMARY KEY,
    ArtworkId CHAR(36) NOT NULL,
    TokenId VARCHAR(100) NOT NULL,
    SellerId CHAR(36) NOT NULL,
    SellerWalletAddress VARCHAR(42) NOT NULL,
    Price DECIMAL(20, 8) NOT NULL,
    PaymentTokenAddress VARCHAR(42) NOT NULL,
    MarketplacePartnerId CHAR(36),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CancelledAt DATETIME,
    SoldAt DATETIME,
    INDEX idx_artwork (ArtworkId),
    INDEX idx_token (TokenId),
    INDEX idx_seller (SellerId),
    INDEX idx_active (IsActive),
    INDEX idx_partner (MarketplacePartnerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MarketplacePartners table
CREATE TABLE IF NOT EXISTS MarketplacePartners (
    PartnerId CHAR(36) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    WalletAddress VARCHAR(42) NOT NULL UNIQUE,
    ApiKey VARCHAR(255) UNIQUE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet (WalletAddress),
    INDEX idx_active (IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS Transactions (
    TransactionId CHAR(36) PRIMARY KEY,
    ListingId CHAR(36) NOT NULL,
    ArtworkId CHAR(36) NOT NULL,
    TokenId VARCHAR(100) NOT NULL,
    SellerId CHAR(36) NOT NULL,
    BuyerId CHAR(36) NOT NULL,
    SalePrice DECIMAL(20, 8) NOT NULL,
    SellerAmount DECIMAL(20, 8) NOT NULL,
    ArtistRoyalty DECIMAL(20, 8) NOT NULL,
    PlatformFee DECIMAL(20, 8) NOT NULL,
    PartnerFee DECIMAL(20, 8),
    MarketplacePartnerId CHAR(36),
    PaymentTokenAddress VARCHAR(42) NOT NULL,
    BlockchainTransactionHash VARCHAR(66) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CompletedAt DATETIME,
    INDEX idx_listing (ListingId),
    INDEX idx_artwork (ArtworkId),
    INDEX idx_token (TokenId),
    INDEX idx_seller (SellerId),
    INDEX idx_buyer (BuyerId),
    INDEX idx_tx_hash (BlockchainTransactionHash),
    INDEX idx_partner (MarketplacePartnerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
