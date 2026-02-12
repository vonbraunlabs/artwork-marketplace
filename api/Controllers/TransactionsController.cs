using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ArtMarketplace.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ArtMarketplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly MarketplaceDbContext _context;

    public TransactionsController(MarketplaceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyTransactions()
    {
        var userId = User.FindFirst("userId")!.Value;

        var transactions = await _context.Transactions
            .Where(t => t.BuyerId == userId || t.SellerId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransaction(string id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return NotFound();

        var userId = User.FindFirst("userId")!.Value;
        if (transaction.BuyerId != userId && transaction.SellerId != userId)
        {
            return Forbid();
        }

        return Ok(transaction);
    }
}
