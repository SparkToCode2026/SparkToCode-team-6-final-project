using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly ProjectContex _context;

        public PropertyController(ProjectContex context)
        {
            _context = context;
        }

        // Case 1: Create a new property
        [HttpPost]
        public async Task<ActionResult<Property>> CreateProperty(
            Property property)
        {
            if (string.IsNullOrWhiteSpace(property.Address))
            {
                return BadRequest("Property address is required.");
            }

            if (property.Bedrooms < 0 || property.Bathrooms < 0 ||
                property.SquareFootage <= 0)
            {
                return BadRequest(
                    "Bedrooms, bathrooms, and square footage must be valid.");
            }

            var propertyType =
                await _context.PropertyTypes.FindAsync(property.PropertyTypeId);
            if (propertyType == null)
            {
                return NotFound("No property type found with the given PropertyTypeId.");
            }

            var city = await _context.Cities.FindAsync(property.CityId);
            if (city == null)
            {
                return NotFound("No city found with the given CityId.");
            }

            var agent = await _context.Users.FindAsync(property.AgentId);
            if (agent == null)
            {
                return NotFound("No user found with the given AgentId.");
            }

            if (agent.Role != "Agent")
            {
                return BadRequest("Only users with Role 'Agent' can be assigned to a property.");
            }

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return Created($"/api/Property/{property.PropertyId}", property);
        }

        // Case 2: Update the full property
        [HttpPut]
        public async Task<IActionResult> UpdateProperty(Property property)
        {
            var existingProperty =
                await _context.Properties.FindAsync(property.PropertyId);

            if (existingProperty == null)
            {
                return NotFound("Property not found.");
            }

            if (string.IsNullOrWhiteSpace(property.Address))
            {
                return BadRequest("Property address is required.");
            }

            if (property.Bedrooms < 0 || property.Bathrooms < 0 ||
                property.SquareFootage <= 0)
            {
                return BadRequest(
                    "Bedrooms, bathrooms, and square footage must be valid.");
            }

            var propertyType =
                await _context.PropertyTypes.FindAsync(property.PropertyTypeId);
            if (propertyType == null)
            {
                return NotFound("No property type found with the given PropertyTypeId.");
            }

            var city = await _context.Cities.FindAsync(property.CityId);
            if (city == null)
            {
                return NotFound("No city found with the given CityId.");
            }

            var agent = await _context.Users.FindAsync(property.AgentId);
            if (agent == null || agent.Role != "Agent")
            {
                return BadRequest("A valid Agent must be assigned to the property.");
            }

            existingProperty.Address = property.Address;
            existingProperty.Bedrooms = property.Bedrooms;
            existingProperty.Bathrooms = property.Bathrooms;
            existingProperty.SquareFootage = property.SquareFootage;
            existingProperty.Description = property.Description;
            existingProperty.PropertyTypeId = property.PropertyTypeId;
            existingProperty.CityId = property.CityId;
            existingProperty.AgentId = property.AgentId;

            await _context.SaveChangesAsync();

            return Ok(existingProperty);
        }

        // Case 3: Update the description only
        [HttpPatch("ChangeDescription")]
        public async Task<IActionResult> ChangePropertyDescription(
            [FromQuery] int propertyId,
            [FromBody] string newDescription)
        {
            var property = await _context.Properties.FindAsync(propertyId);

            if (property == null)
            {
                return NotFound("Property not found.");
            }

            property.Description = newDescription;

            await _context.SaveChangesAsync();

            return Ok(property);
        }

        // Case 4: Delete a property
        [HttpDelete]
        public async Task<IActionResult> DeleteProperty(
            [FromQuery] int propertyId)
        {
            var property = await _context.Properties.FindAsync(propertyId);

            if (property == null)
            {
                return NotFound("Property not found.");
            }

            bool hasListings = await _context.Listings
                .AnyAsync(l => l.PropertyId == propertyId);

            if (hasListings)
            {
                return BadRequest(
                    "Cannot delete a property that still has listings attached to it.");
            }

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();

            return Ok("Property deleted successfully.");
        }

        // Case 5: Get all properties (with type & city included)
        [HttpGet]
        public async Task<IActionResult> GetAllProperties()
        {
            var properties = await _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.City)
                .ToListAsync();

            return Ok(properties);
        }

        // Case 6: Get one property by ID
        [HttpGet("Find")]
        public async Task<IActionResult> GetPropertyById(
            [FromQuery] int propertyId)
        {
            var property = await _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.City)
                .Include(p => p.Agent)
                .FirstOrDefaultAsync(p => p.PropertyId == propertyId);

            if (property == null)
            {
                return NotFound("Property not found.");
            }

            return Ok(property);
        }

        // Case 7: Filter properties by city and/or property type
        [HttpGet("Filter")]
        public async Task<IActionResult> FilterProperties(
            [FromQuery] int? cityId,
            [FromQuery] int? propertyTypeId,
            [FromQuery] int? minBedrooms)
        {
            var query = _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.City)
                .AsQueryable();

            if (cityId.HasValue)
            {
                query = query.Where(p => p.CityId == cityId.Value);
            }

            if (propertyTypeId.HasValue)
            {
                query = query.Where(p => p.PropertyTypeId == propertyTypeId.Value);
            }

            if (minBedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms >= minBedrooms.Value);
            }

            var properties = await query.ToListAsync();

            if (properties.Count == 0)
            {
                return NotFound("No properties found matching the given filters.");
            }

            return Ok(properties);
        }

        // Case 8: Sort properties by square footage and calculate total count
        [HttpGet("SortBySquareFootage")]
        public async Task<IActionResult> SortPropertiesBySquareFootage()
        {
            var properties = await _context.Properties
                .Include(p => p.PropertyType)
                .Include(p => p.City)
                .OrderByDescending(p => p.SquareFootage)
                .ToListAsync();

            var result = new
            {
                TotalProperties = properties.Count,
                Properties = properties
            };

            return Ok(result);
        }
    }
}
