using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenityController : ControllerBase
    {
        private readonly ProjectContex _context;

        public AmenityController(ProjectContex context)
        {
            _context = context;
        }

        // Case 1: Create a new amenity
        [HttpPost]
        public async Task<ActionResult<Amenity>> CreateAmenity(
            Amenity amenity)
        {
            if (string.IsNullOrWhiteSpace(amenity.Name))
            {
                return BadRequest("Amenity name is required.");
            }

            string amenityName = amenity.Name.Trim();

            bool nameExists = await _context.Amenities
                .AnyAsync(a => a.Name == amenityName);

            if (nameExists)
            {
                return BadRequest("Amenity already exists.");
            }

            amenity.Name = amenityName;

            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();

            return Created(
                $"/api/Amenity/{amenity.AmenityId}",
                amenity);
        }

        // Case 2: Update the full amenity
        [HttpPut]
        public async Task<IActionResult> UpdateAmenity(
            Amenity amenity)
        {
            var existingAmenity =
                await _context.Amenities.FindAsync(
                    amenity.AmenityId);

            if (existingAmenity == null)
            {
                return NotFound("Amenity not found.");
            }

            if (string.IsNullOrWhiteSpace(amenity.Name))
            {
                return BadRequest("Amenity name is required.");
            }

            string amenityName = amenity.Name.Trim();

            bool nameExists = await _context.Amenities
                .AnyAsync(a =>
                    a.Name == amenityName &&
                    a.AmenityId != amenity.AmenityId);

            if (nameExists)
            {
                return BadRequest(
                    "Another amenity already has this name.");
            }

            existingAmenity.Name = amenityName;

            await _context.SaveChangesAsync();

            return Ok(existingAmenity);
        }

        // Case 3: Change amenity name only
        [HttpPatch("ChangeName")]
        public async Task<IActionResult> ChangeAmenityName(
            [FromQuery] int amenityId,
            [FromQuery] string newName)
        {
            var amenity =
                await _context.Amenities.FindAsync(amenityId);

            if (amenity == null)
            {
                return NotFound("Amenity not found.");
            }

            if (string.IsNullOrWhiteSpace(newName))
            {
                return BadRequest(
                    "New amenity name is required.");
            }

            string amenityName = newName.Trim();

            bool nameExists = await _context.Amenities
                .AnyAsync(a =>
                    a.Name == amenityName &&
                    a.AmenityId != amenityId);

            if (nameExists)
            {
                return BadRequest(
                    "Another amenity already has this name.");
            }

            amenity.Name = amenityName;

            await _context.SaveChangesAsync();

            return Ok(amenity);
        }

        // Case 4: Delete an amenity
        [HttpDelete]
        public async Task<IActionResult> DeleteAmenity(
            [FromQuery] int amenityId)
        {
            var amenity =
                await _context.Amenities.FindAsync(amenityId);

            if (amenity == null)
            {
                return NotFound("Amenity not found.");
            }

            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();

            return Ok("Amenity deleted successfully.");
        }

        // Case 5: Get all amenities
        [HttpGet]
        public async Task<IActionResult> GetAllAmenities()
        {
            var amenities = await _context.Amenities
                .ToListAsync();

            return Ok(amenities);
        }

        // Case 6: Get one amenity by ID
        [HttpGet("Find")]
        public async Task<IActionResult> GetAmenityById(
            [FromQuery] int amenityId)
        {
            var amenity =
                await _context.Amenities.FindAsync(amenityId);

            if (amenity == null)
            {
                return NotFound("Amenity not found.");
            }

            return Ok(amenity);
        }

        // Case 7: Filter amenities by name
        [HttpGet("FilterByName")]
        public async Task<IActionResult> FilterAmenitiesByName(
            [FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(
                    "Amenity name is required.");
            }

            var amenities = await _context.Amenities
                .Where(a => a.Name.Contains(name))
                .ToListAsync();

            if (amenities.Count == 0)
            {
                return NotFound(
                    "No amenities found with this name.");
            }

            return Ok(amenities);
        }

        // Case 8: Sort amenities and calculate total count
        [HttpGet("SortByName")]
        public async Task<IActionResult> SortAmenitiesByName()
        {
            var amenities = await _context.Amenities
                .OrderBy(a => a.Name)
                .ToListAsync();

            var result = new
            {
                TotalAmenities = amenities.Count,
                Amenities = amenities
            };

            return Ok(result);
        }
    }
}