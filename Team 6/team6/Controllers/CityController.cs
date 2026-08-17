using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CityController : ControllerBase
    {
        private readonly ProjectContex _context;

        public CityController(ProjectContex context)
        {
            _context = context;
        }

        // Case 1: Create a new city
        [HttpPost]
        public async Task<ActionResult<City>> CreateCity(City city)
        {
            if (string.IsNullOrWhiteSpace(city.CityName) ||
                string.IsNullOrWhiteSpace(city.State))
            {
                return BadRequest("City name and state are required.");
            }

            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            return Created($"/api/City/{city.CityId}", city);
        }

        // Case 2: Update a city
        [HttpPut]
        public async Task<IActionResult> UpdateCity(City city)
        {
            var existingCity =
                await _context.Cities.FindAsync(city.CityId);

            if (existingCity == null)
            {
                return NotFound("City not found.");
            }

            if (string.IsNullOrWhiteSpace(city.CityName) ||
                string.IsNullOrWhiteSpace(city.State))
            {
                return BadRequest("City name and state are required.");
            }

            existingCity.CityName = city.CityName;
            existingCity.State = city.State;

            await _context.SaveChangesAsync();

            return Ok(existingCity);
        }

        // Case 3: Update city state only
        [HttpPatch("ChangeState")]
        public async Task<IActionResult> ChangeCityState(
            [FromQuery] int cityId,
            [FromQuery] string newState)
        {
            var city = await _context.Cities.FindAsync(cityId);

            if (city == null)
            {
                return NotFound("City not found.");
            }

            if (string.IsNullOrWhiteSpace(newState))
            {
                return BadRequest("State is required.");
            }

            city.State = newState;

            await _context.SaveChangesAsync();

            return Ok(city);
        }

        // Case 4: Delete a city
        [HttpDelete]
        public async Task<IActionResult> DeleteCity(
            [FromQuery] int cityId)
        {
            var city = await _context.Cities.FindAsync(cityId);

            if (city == null)
            {
                return NotFound("City not found.");
            }

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();

            return Ok("City deleted successfully.");
        }

        // Case 5: Get all cities
        [HttpGet]
        public async Task<IActionResult> GetAllCities()
        {
            var cities = await _context.Cities.ToListAsync();

            return Ok(cities);
        }

        // Case 6: Get one city by ID
        [HttpGet("Find")]
        public async Task<IActionResult> GetCityById(
            [FromQuery] int cityId)
        {
            var city = await _context.Cities.FindAsync(cityId);

            if (city == null)
            {
                return NotFound("City not found.");
            }

            return Ok(city);
        }

        // Case 7: Filter cities by state
        [HttpGet("FilterByState")]
        public async Task<IActionResult> FilterCitiesByState(
            [FromQuery] string state)
        {
            if (string.IsNullOrWhiteSpace(state))
            {
                return BadRequest("State is required.");
            }

            var cities = await _context.Cities
                .Where(c => c.State.Contains(state))
                .ToListAsync();

            if (cities.Count == 0)
            {
                return NotFound(
                    "No cities found in this state.");
            }

            return Ok(cities);
        }

        // Case 8: Sort cities by name
        [HttpGet("SortByName")]
        public async Task<IActionResult> SortCitiesByName()
        {
            var cities = await _context.Cities
                .OrderBy(c => c.CityName)
                .ToListAsync();

            return Ok(cities);
        }
    }
}