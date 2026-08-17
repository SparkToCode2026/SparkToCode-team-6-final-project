using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly ProjectContex _context;

        public ReviewController(ProjectContex context)
        {
            _context = context;
        }

        // 1. POST - Create a new Review
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(Review review)
        {
            if (review.Rating < 1 || review.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetReview),
                new { id = review.ReviewId },
                review);
        }

        // 2. PUT - Update Review
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(
            int id,
            Review review)
        {
            if (id != review.ReviewId)
                return BadRequest();

            if (review.Rating < 1 || review.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var existingReview = await _context.Reviews
                .FindAsync(id);

            if (existingReview == null)
                return NotFound();

            existingReview.Rating = review.Rating;
            existingReview.Comment = review.Comment;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 3. PATCH - Change Review Rating
        [HttpPatch("{id}/rating")]
        public async Task<IActionResult> ChangeRating(
            int id,
            int rating)
        {
            if (rating < 1 || rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var review = await _context.Reviews
                .FindAsync(id);

            if (review == null)
                return NotFound();

            review.Rating = rating;

            await _context.SaveChangesAsync();

            return Ok(review);
        }

        // 4. DELETE - Delete Review
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews
                .FindAsync(id);

            if (review == null)
                return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. GET - Get all Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Property)
                .ToListAsync();

            return Ok(reviews);
        }

        // 6. GET - Get Review by Id
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Property)
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
                return NotFound();

            return Ok(review);
        }

        // 7. GET - Get Reviews by Property
        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByProperty(
            int propertyId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.PropertyId == propertyId)
                .ToListAsync();

            return Ok(reviews);
        }

        // 8. GET - Average Rating
        [HttpGet("average/{propertyId}")]
        public async Task<ActionResult<double>> GetAverageRating(
            int propertyId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.PropertyId == propertyId)
                .ToListAsync();

            if (!reviews.Any())
                return Ok(0);

            var average = reviews.Average(r => r.Rating);

            return Ok(average);
        }
    }
}