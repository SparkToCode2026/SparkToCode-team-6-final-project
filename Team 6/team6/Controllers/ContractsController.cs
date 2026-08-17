using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;
using team6.Services;

namespace team6.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractsController : ControllerBase
{
     private readonly ProjectContex _context;
    private readonly IEmailService _emailService;

    public ContractsController(ProjectContex context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // GET all, including related User via Include()
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Contract>>> GetContracts()
    {
        var contracts = await _context.Contracts
            .Include(c => c.User)
            .Include(c => c.Payments)
            .ToListAsync();
        return Ok(contracts);
    }

    // GET single by id
    [HttpGet("{id}")]
    public async Task<ActionResult<Contract>> GetContract(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.User)
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.ContractId == id);

        if (contract == null) return NotFound($"Contract {id} not found.");
        return Ok(contract);
    }

    // GET by listing 
    [HttpGet("listing/{listingId}")]
    public async Task<ActionResult<IEnumerable<Contract>>> GetContractsByListing(int listingId)
    {
        var contracts = await _context.Contracts
            .Where(c => c.ListingId == listingId)
            .ToListAsync();
        return Ok(contracts);
    }
    
    // GET by user
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Contract>>> GetContractsByUser(int userId)
    {
        var contracts = await _context.Contracts
            .Include(c => c.Payments)
            .Where(c => c.UserId == userId)
            .ToListAsync();
        return Ok(contracts);
    }

    // GET filtered by status 
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Contract>>> GetContractsByStatus(string status)
    {
        var contracts = await _context.Contracts
            .Where(c => c.Status.ToLower() == status.ToLower())
            .ToListAsync();
        return Ok(contracts);
    }

    // GET sorted
    [HttpGet("stats")]
    public async Task<ActionResult> GetContractStats()
    {
        var sortedBySignedDate = await _context.Contracts
            .OrderByDescending(c => c.SignedDate)
            .Select(c => new { c.ContractId, c.SignedDate, c.Status })
            .ToListAsync();

        var countByStatus = await _context.Contracts
            .GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { SortedBySignedDateDesc = sortedBySignedDate, CountByStatus = countByStatus });
    }

    // POST - create a new contract
    [HttpPost]
    public async Task<ActionResult<Contract>> CreateContract(Contract contract)
    {
        var listingExists = await _context.Listings.AnyAsync(l => l.ListingId == contract.ListingId);
        if (!listingExists) return BadRequest("ListingId does not exist.");

        var userExists = await _context.Users.AnyAsync(u => u.UserId == contract.UserId);
        if (!userExists) return BadRequest("UserId does not exist.");

        contract.ContractId = 0; // ignore any client-supplied id
        if (string.IsNullOrWhiteSpace(contract.Status)) contract.Status = "Pending";
        if (contract.SignedDate == default) contract.SignedDate = DateTime.UtcNow;

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContract), new { id = contract.ContractId }, contract);
    }

    // PUT - full update
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContract(int id, Contract updated)
    {
        if (id != updated.ContractId) return BadRequest("Route id and ContractId do not match.");

        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null) return NotFound($"Contract {id} not found.");

        contract.SignedDate = updated.SignedDate;
        contract.Status = updated.Status;
        contract.ListingId = updated.ListingId;
        contract.UserId = updated.UserId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT - status-only update
    // This is also where the required "contract-signed" email trigger fires
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateContractStatus(int id, [FromBody] string status)
    {
        var contract = await _context.Contracts
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.ContractId == id);

        if (contract == null) return NotFound($"Contract {id} not found.");

        var validStatuses = new[] { "Pending", "Signed", "Cancelled" };
        if (!validStatuses.Contains(status))
            return BadRequest($"Status must be one of: {string.Join(", ", validStatuses)}");

        var wasAlreadySigned = contract.Status == "Signed";
        contract.Status = status;
        await _context.SaveChangesAsync();

        // Domain-specific trigger: contract-signed notification email
        if (status == "Signed" && !wasAlreadySigned && contract.User != null)
        {
            try
            {
                await _emailService.SendContractSignedNotificationAsync(
                    toEmail: contract.User.Email,
                    userName: contract.User.Name,
                    contractId: contract.ContractId,
                    signedDate: contract.SignedDate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send contract-signed email: {ex.Message}");
            }
        }

        return NoContent();
    }

    //DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContract(int id)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null) return NotFound($"Contract {id} not found.");

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}