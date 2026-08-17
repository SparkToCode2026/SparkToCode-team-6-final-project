using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteController : ControllerBase
    {
        private readonly ProjectContex _context;

        public FavoriteController(ProjectContex context)
        {
            _context = context;
        }

        // 1. POST - Create a new Favorite
        [HttpPost]
        public async Task<ActionResult<Favorite>> CreateFavorite(Favorite favorite)
        {
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFavorite),
                new { id = favorite.FavoriteId },
                favorite);
        }

        // 2. PUT - Update Favorite
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFavorite(
            int id,
            Favorite favorite)
        {
            if (id != favorite.FavoriteId)
                return BadRequest();

            var existingFavorite = await _context.Favorites
                .FindAsync(id);

            if (existingFavorite == null)
                return NotFound();

            existingFavorite.UserId = favorite.UserId;
            existingFavorite.ListingId = favorite.ListingId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 3. PATCH - Change the Listing of a Favorite
        [HttpPatch("{id}/listing")]
        public async Task<IActionResult> ChangeFavoriteListing(
            int id,
            int listingId)
        {
            var favorite = await _context.Favorites
                .FindAsync(id);

            if (favorite == null)
                return NotFound();

            favorite.ListingId = listingId;

            await _context.SaveChangesAsync();

            return Ok(favorite);
        }

        // 4. DELETE - Delete Favorite
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFavorite(int id)
        {
            var favorite = await _context.Favorites
                .FindAsync(id);

            if (favorite == null)
                return NotFound();

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. GET - Get all Favorites with related User and Listing
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Favorite>>> GetFavorites()
        {
            var favorites = await _context.Favorites
                .Include(f => f.User)
                .Include(f => f.Listing)
                .ToListAsync();

            return Ok(favorites);
        }

        // 6. GET - Get Favorite by Id
        [HttpGet("{id}")]
        public async Task<ActionResult<Favorite>> GetFavorite(int id)
        {
            var favorite = await _context.Favorites
                .Include(f => f.User)
                .Include(f => f.Listing)
                .FirstOrDefaultAsync(f => f.FavoriteId == id);

            if (favorite == null)
                return NotFound();

            return Ok(favorite);
        }

        // 7. GET - Get Favorites by User
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Favorite>>> GetFavoritesByUser(
            int userId)
        {
            var favorites = await _context.Favorites
                .Include(f => f.Listing)
                .Where(f => f.UserId == userId)
                .ToListAsync();

            return Ok(favorites);
        }

        // 8. GET - Count Favorites
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetFavoriteCount()
        {
            var count = await _context.Favorites.CountAsync();

            return Ok(count);
        }
    }
}