# Marketplace Authentication - Independent Implementation

## ✅ Status: Complete

Date: 2026-02-12

## 🎯 Objective

Implement independent JWT-based authentication system for the marketplace, allowing each partner to manage their own users without dependency on the core tokenization platform.

## 🏗️ Architecture Decision

### Why Independent Authentication?

**Core Platform** and **Marketplace** have separate authentication systems because:

1. **Independence**: Each marketplace partner manages their own users
2. **Privacy**: Core platform doesn't need to know marketplace users
3. **Scalability**: Each system scales independently
4. **Customization**: Partners can add custom fields/rules
5. **Security**: Complete data isolation between platforms

### Comparison

| Aspect | Core (Tokenization) | Marketplace |
|--------|---------------------|-------------|
| Users | Artists, Collectors, Admins | Buyers, Sellers |
| Roles | UserType enum (Artist/Collector/Admin) | No roles (simpler) |
| Focus | Artwork tokenization & verification | NFT trading |
| Database | art_tokenization (port 3306) | art_marketplace (port 3307) |
| JWT Secret | Different | Different |
| User Management | Platform controlled | Partner controlled |

## 📦 Components Implemented

### 1. User Model
**File**: `marketplace/api/Models/User.cs`

**Fields**:
- `UserId` (string/GUID) - Primary key
- `Email` (unique) - User email
- `PasswordHash` - BCrypt hashed password
- `FullName` - User's full name
- `WalletAddress` (unique) - Ethereum wallet
- `CreatedAt` - Registration timestamp
- `LastLoginAt` - Last login timestamp

**Differences from Core**:
- No `UserType` enum (no roles needed)
- No `IsVerified` flag (no KYC required)
- No `CurrentPlanId` (no subscription plans)
- Simpler model focused on marketplace needs

### 2. Authentication DTOs
**File**: `marketplace/api/Models/AuthModels.cs`

- `RegisterRequest` - Registration data
- `LoginRequest` - Login credentials
- `AuthResponse` - JWT token + user info

### 3. AuthenticationService
**File**: `marketplace/api/Services/AuthenticationService.cs`

**Features**:
- User registration with BCrypt hashing
- Email and wallet uniqueness validation
- Login with credential verification
- JWT token generation
- Last login tracking

**Interface**: `IAuthenticationService`

### 4. AuthController
**File**: `marketplace/api/Controllers/AuthController.cs`

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user (requires auth)

### 5. Database Schema
**File**: `marketplace/database/init/01_create_schema.sql`

**Users Table**:
```sql
CREATE TABLE Users (
    UserId CHAR(36) PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    WalletAddress VARCHAR(42) NOT NULL UNIQUE,
    CreatedAt DATETIME NOT NULL,
    LastLoginAt DATETIME,
    INDEX idx_email (Email),
    INDEX idx_wallet (WalletAddress)
);
```

### 6. JWT Configuration
**File**: `marketplace/api/appsettings.json`

```json
{
  "Jwt": {
    "Secret": "marketplace-secret-key-min-32-characters-change-in-production",
    "Issuer": "ArtMarketplace",
    "Audience": "MarketplaceUsers",
    "ExpirationMinutes": 1440
  }
}
```

**Important**: Different secret from core platform!

## 🔐 Security Features

### Password Security
- BCrypt hashing with automatic salt
- Minimum 8 characters enforced
- Never stored in plain text

### JWT Token
- HMAC-SHA256 signing
- Claims: userId, email, name, wallet
- 24-hour expiration (configurable)
- Zero clock skew

### Validation
- Email format validation
- Wallet address format (0x + 40 hex)
- Unique email and wallet constraints

## 📊 API Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "buyer@example.com",
  "password": "SecurePass123",
  "fullName": "John Buyer",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "buyer@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 🎯 For Marketplace Partners

### Customization Options

Partners can extend the User model with:
- Profile pictures
- Preferences
- Notification settings
- Custom roles (if needed)
- Social media links
- Reputation scores

### Example Extension
```csharp
public class User
{
    // ... existing fields ...
    
    // Partner-specific additions
    public string? ProfileImageUrl { get; set; }
    public bool EmailNotifications { get; set; } = true;
    public int ReputationScore { get; set; } = 0;
}
```

## ✅ Validation

### Compilation
- ✅ AuthenticationService compiles
- ✅ AuthController compiles
- ✅ Program.cs updated with JWT
- ✅ Database schema includes Users
- ✅ No errors or warnings

### Services Registered
- ✅ IAuthenticationService as scoped
- ✅ JWT authentication configured
- ✅ Authorization middleware added

## 🚀 Deployment

### Configuration Steps

1. **Update JWT Secret** (production):
   ```json
   "Jwt": {
     "Secret": "generate-strong-random-secret-min-32-chars"
   }
   ```

2. **Run Database Migration**:
   ```bash
   mysql -h localhost -P 3307 -u root -p < database/init/01_create_schema.sql
   ```

3. **Start API**:
   ```bash
   dotnet run
   ```

4. **Test Endpoints**:
   ```bash
   curl -X POST http://localhost:5002/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test1234","fullName":"Test User","walletAddress":"0x..."}'
   ```

## 📚 References

- **Core Authentication**: `core/api/TASK_9_AUTHENTICATION_COMPLETE.md`
- **Marketplace Repo**: https://github.com/vonbraunlabs/artwork-marketplace
- **Architecture**: `MULTI_MARKETPLACE_REFACTOR.md`

---

**Implementation Date**: 2026-02-12  
**Version**: 1.0  
**Status**: ✅ Complete and Independent

**Key Takeaway**: Each marketplace has complete control over their user management, enabling customization and independence from the core platform.
