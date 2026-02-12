using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ArtMarketplace.Api.Data;
using ArtMarketplace.Api.Models;

namespace ArtMarketplace.Api.Services;

public interface IAuthenticationService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<User?> GetUserByIdAsync(string userId);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly MarketplaceDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        MarketplaceDbContext dbContext,
        IConfiguration configuration,
        ILogger<AuthenticationService> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Validate email is unique
        var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: Email {Email} already exists", request.Email);
            return null;
        }

        // Validate wallet address is unique
        var existingWallet = await _dbContext.Users.FirstOrDefaultAsync(u => u.WalletAddress == request.WalletAddress);
        if (existingWallet != null)
        {
            _logger.LogWarning("Registration failed: Wallet {Wallet} already exists", request.WalletAddress);
            return null;
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create user
        var user = new User
        {
            UserId = Guid.NewGuid().ToString(),
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            WalletAddress = request.WalletAddress,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User registered successfully: {UserId} ({Email})", user.UserId, user.Email);

        // Generate token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

        return new AuthResponse
        {
            Token = token,
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            WalletAddress = user.WalletAddress,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for email {Email}", request.Email);
            return null;
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed: Invalid password for user {UserId}", user.UserId);
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User logged in successfully: {UserId} ({Email})", user.UserId, user.Email);

        // Generate token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

        return new AuthResponse
        {
            Token = token,
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            WalletAddress = user.WalletAddress,
            ExpiresAt = expiresAt
        };
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        return await _dbContext.Users.FindAsync(userId);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSecret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "ArtMarketplace";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "MarketplaceUsers";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim("wallet", user.WalletAddress),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int GetTokenExpirationMinutes()
    {
        return _configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440); // Default: 24 hours
    }
}
