using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6;
using team6.Models;
using team6.Services;

namespace team6.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ViewingsController : ControllerBase
{
    private readonly ProjectContex _context;
    private readonly IEmailService _emailService;

    public ViewingsController(ProjectContex context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Viewing>>> GetViewings()
    {
        return Ok(await _context.Viewings.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Viewing>> GetViewing(int id)
    {
        var viewing = await _context.Viewings.FindAsync(id);
        if (viewing == null) return NotFound($"Viewing {id} not found.");
        return Ok(viewing);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Viewing>>> GetViewingsByUser(int userId)
    {
        var viewings = await _context.Viewings
            .Where(v => v.UserId == userId)
            .ToListAsync();
        return Ok(viewings);
    }

    [HttpGet("listing/{listingId}")]
    public async Task<ActionResult<IEnumerable<Viewing>>> GetViewingsByListing(int listingId)
    {
        var viewings = await _context.Viewings
            .Where(v => v.ListingId == listingId)
            .ToListAsync();
        return Ok(viewings);
    }

    [HttpPost]
    public async Task<ActionResult<Viewing>> BookViewing(Viewing viewing)
    {
        var listing = await _context.Listings.FindAsync(viewing.ListingId);
        if (listing == null) return BadRequest("ListingId does not exist.");

        var user = await _context.Users.FindAsync(viewing.UserId);
        if (user == null) return BadRequest("UserId does not exist.");

        viewing.ViewingId = 0; // ignore any client-supplied id
        viewing.Status = "Scheduled";

        _context.Viewings.Add(viewing);
        await _context.SaveChangesAsync();

        try
        {
            await _emailService.SendViewingConfirmationAsync(
                toEmail: user.Email,
                userName: user.Name,
                propertyAddress: "the property", // swap for listing.Property.Address once that nav is wired up
                viewingDate: viewing.ViewingDate);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send viewing confirmation email: {ex.Message}");
        }

        return CreatedAtAction(nameof(GetViewing), new { id = viewing.ViewingId }, viewing);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateViewing(int id, Viewing updated)
    {
        var viewing = await _context.Viewings.FindAsync(id);
        if (viewing == null) return NotFound($"Viewing {id} not found.");

        viewing.ViewingDate = updated.ViewingDate;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateViewingStatus(int id, [FromBody] string status)
    {
        var viewing = await _context.Viewings.FindAsync(id);
        if (viewing == null) return NotFound($"Viewing {id} not found.");

        var validStatuses = new[] { "Scheduled", "Completed", "Cancelled" };
        if (!validStatuses.Contains(status))
            return BadRequest($"Status must be one of: {string.Join(", ", validStatuses)}");

        viewing.Status = status;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteViewing(int id)
    {
        var viewing = await _context.Viewings.FindAsync(id);
        if (viewing == null) return NotFound($"Viewing {id} not found.");

        _context.Viewings.Remove(viewing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}