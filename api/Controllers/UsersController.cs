using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ArtMarketplace.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ArtMarketplace.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly MarketplaceDbContext _context;

    public UsersController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst("userId")!.Value;
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new
        {
            user.UserId,
            user.Email,
            user.FullName,
            user.WalletAddress,
            user.CreatedAt
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst("userId")!.Value;
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FullName = request.FullName ?? user.FullName;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpGet("listings")]
    public async Task<IActionResult> GetMyListings()
    {
        var userId = User.FindFirst("userId")!.Value;
        var listings = await _context.Listings
            .Where(l => l.SellerUserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(listings);
    }
}

public record UpdateProfileRequest(string? FullName);
