using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyTypeController : ControllerBase
    {
        private readonly ProjectContex _context;

        public PropertyTypeController(ProjectContex context)
        {
            _context = context;
        }

        // Case 1: Create a new property type
        [HttpPost]
        public async Task<ActionResult<PropertyType>> CreatePropertyType(
            PropertyType propertyType)
        {
            if (string.IsNullOrWhiteSpace(propertyType.TypeName))
            {
                return BadRequest("Property type name is required.");
            }

            string typeName = propertyType.TypeName.Trim();

            bool nameExists = await _context.PropertyTypes
                .AnyAsync(pt => pt.TypeName == typeName);

            if (nameExists)
            {
                return BadRequest("Property type already exists.");
            }

            propertyType.TypeName = typeName;

            _context.PropertyTypes.Add(propertyType);
            await _context.SaveChangesAsync();

            return Created(
                $"/api/PropertyType/{propertyType.PropertyTypeId}",
                propertyType);
        }

        // Case 2: Update the full property type
        [HttpPut]
        public async Task<IActionResult> UpdatePropertyType(
            PropertyType propertyType)
        {
            var existingType =
                await _context.PropertyTypes.FindAsync(
                    propertyType.PropertyTypeId);

            if (existingType == null)
            {
                return NotFound("Property type not found.");
            }

            if (string.IsNullOrWhiteSpace(propertyType.TypeName))
            {
                return BadRequest("Property type name is required.");
            }

            string typeName = propertyType.TypeName.Trim();

            bool nameExists = await _context.PropertyTypes
                .AnyAsync(pt =>
                    pt.TypeName == typeName &&
                    pt.PropertyTypeId != propertyType.PropertyTypeId);

            if (nameExists)
            {
                return BadRequest(
                    "Another property type already has this name.");
            }

            existingType.TypeName = typeName;

            await _context.SaveChangesAsync();

            return Ok(existingType);
        }

        // Case 3: Change the type name only
        [HttpPatch("ChangeName")]
        public async Task<IActionResult> ChangePropertyTypeName(
            [FromQuery] int propertyTypeId,
            [FromQuery] string newName)
        {
            var propertyType =
                await _context.PropertyTypes.FindAsync(propertyTypeId);

            if (propertyType == null)
            {
                return NotFound("Property type not found.");
            }

            if (string.IsNullOrWhiteSpace(newName))
            {
                return BadRequest("New property type name is required.");
            }

            string typeName = newName.Trim();

            bool nameExists = await _context.PropertyTypes
                .AnyAsync(pt =>
                    pt.TypeName == typeName &&
                    pt.PropertyTypeId != propertyTypeId);

            if (nameExists)
            {
                return BadRequest(
                    "Another property type already has this name.");
            }

            propertyType.TypeName = typeName;

            await _context.SaveChangesAsync();

            return Ok(propertyType);
        }

        // Case 4: Delete a property type
        [HttpDelete]
        public async Task<IActionResult> DeletePropertyType(
            [FromQuery] int propertyTypeId)
        {
            var propertyType =
                await _context.PropertyTypes.FindAsync(propertyTypeId);

            if (propertyType == null)
            {
                return NotFound("Property type not found.");
            }

            bool inUse = await _context.Properties
                .AnyAsync(p => p.PropertyTypeId == propertyTypeId);

            if (inUse)
            {
                return BadRequest(
                    "Cannot delete a property type that is still assigned to properties.");
            }

            _context.PropertyTypes.Remove(propertyType);
            await _context.SaveChangesAsync();

            return Ok("Property type deleted successfully.");
        }

        // Case 5: Get all property types
        [HttpGet]
        public async Task<IActionResult> GetAllPropertyTypes()
        {
            var propertyTypes = await _context.PropertyTypes
                .ToListAsync();

            return Ok(propertyTypes);
        }

        // Case 6: Get one property type by ID
        [HttpGet("Find")]
        public async Task<IActionResult> GetPropertyTypeById(
            [FromQuery] int propertyTypeId)
        {
            var propertyType =
                await _context.PropertyTypes.FindAsync(propertyTypeId);

            if (propertyType == null)
            {
                return NotFound("Property type not found.");
            }

            return Ok(propertyType);
        }

        // Case 7: Filter property types by name
        [HttpGet("FilterByName")]
        public async Task<IActionResult> FilterPropertyTypesByName(
            [FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Property type name is required.");
            }

            var propertyTypes = await _context.PropertyTypes
                .Where(pt => pt.TypeName.Contains(name))
                .ToListAsync();

            if (propertyTypes.Count == 0)
            {
                return NotFound(
                    "No property types found with this name.");
            }

            return Ok(propertyTypes);
        }

        // Case 8: Sort property types by name and calculate total count
        [HttpGet("SortByName")]
        public async Task<IActionResult> SortPropertyTypesByName()
        {
            var propertyTypes = await _context.PropertyTypes
                .OrderBy(pt => pt.TypeName)
                .ToListAsync();

            var result = new
            {
                TotalPropertyTypes = propertyTypes.Count,
                PropertyTypes = propertyTypes
            };

            return Ok(result);
        }
    }
}
