using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6;
using team6.Models;

namespace team6.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly ProjectContex _context;

    public ListingsController(ProjectContex context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Listing>>> GetListings()
    {
        return Ok(await _context.Listings.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Listing>> GetListing(int id)
    {
        var listing = await _context.Listings.FindAsync(id);
        if (listing == null) return NotFound($"Listing {id} not found.");
        return Ok(listing);
    }

    [HttpGet("property/{propertyId}")]
    public async Task<ActionResult<IEnumerable<Listing>>> GetListingsByProperty(int propertyId)
    {
        var listings = await _context.Listings
            .Where(l => l.PropertyId == propertyId)
            .ToListAsync();
        return Ok(listings);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Listing>>> GetListingsByStatus(string status)
    {
        var listings = await _context.Listings
            .Where(l => l.Status.ToLower() == status.ToLower())
            .ToListAsync();
        return Ok(listings);
    }

    [HttpGet("{id}/viewings")]
    public async Task<ActionResult<IEnumerable<Viewing>>> GetViewingsForListing(int id)
    {
        var exists = await _context.Listings.AnyAsync(l => l.ListingId == id);
        if (!exists) return NotFound($"Listing {id} not found.");

        var viewings = await _context.Viewings
            .Where(v => v.ListingId == id)
            .ToListAsync();

        return Ok(viewings);
    }

    [HttpPost]
    public async Task<ActionResult<Listing>> CreateListing(Listing listing)
    {
        listing.ListingId = 0; // ignore any client-supplied id
        if (string.IsNullOrWhiteSpace(listing.Status)) listing.Status = "Active";
        if (listing.ListingDate == default) listing.ListingDate = DateTime.UtcNow;

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetListing), new { id = listing.ListingId }, listing);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateListing(int id, Listing updated)
    {
        var listing = await _context.Listings.FindAsync(id);
        if (listing == null) return NotFound($"Listing {id} not found.");

        listing.Price = updated.Price;
        listing.Status = updated.Status;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteListing(int id)
    {
        var listing = await _context.Listings.FindAsync(id);
        if (listing == null) return NotFound($"Listing {id} not found.");

        _context.Listings.Remove(listing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}