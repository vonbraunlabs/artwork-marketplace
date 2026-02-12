# Marketplace Database

Database schema and migrations for the Art Marketplace application.

## Database Information

- **Database Name**: `art_marketplace`
- **Port**: 3307 (MySQL)
- **Engine**: InnoDB
- **Charset**: utf8mb4

## Tables

### MarketplaceListings
Stores artwork listings created by sellers.

### MarketplacePartners
Stores registered marketplace partners for fee sharing.

### Transactions
Stores completed purchase transactions with fee distribution details.

## Setup

### Using Docker
```bash
docker-compose up -d mysql_marketplace
```

### Manual Setup
```bash
mysql -h localhost -P 3307 -u root -p < init/01_create_schema.sql
```

## Migrations

Migrations are managed by Entity Framework Core in the API project.

```bash
cd ../api/ArtMarketplace.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```
