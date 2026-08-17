using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;
using Microsoft.AspNetCore.Authorization;  // Added for [Authorize] attribute

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ProjectContex _context;

        public UserController(ProjectContex context)
        {
            _context = context;
        }

        // CASE 1: POST - Create a new user
        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Prevent duplicate emails
            bool emailExists = await _context.Users.AnyAsync(u => u.Email == user.Email);
            if (emailExists)
                return BadRequest("A user with this email already exists.");

            // NOTE: since we have no DTOs, the client sends the plain password
            // in the "PasswordHash" field. We hash it here before saving —
            // the plain text value is NEVER stored.
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
        }

        // CASE 2: PUT - Full update of a user's info
        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            if (id != updatedUser.UserId)
                return BadRequest("Route id and body UserId do not match.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Name = updatedUser.Name;
            user.Email = updatedUser.Email;
            // Role intentionally excluded here — handled by the dedicated case below

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // CASE 3: PATCH - A second, distinct update case (Role change)
        // PATCH: api/User/5/role
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string newRole)
        {
            var validRoles = new[] { "Client", "Agent", "Admin" };
            if (!validRoles.Contains(newRole))
                return BadRequest("Role must be one of: Client, Agent, Admin.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Role = newRole;
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // CASE 4: DELETE - Delete a user (PROTECTED - requires authentication)
        // DELETE: api/User/5
        [Authorize]  // Added to protect this sensitive endpoint
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // CASE 5: GET (list) - All users, including their AgentProfile
        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.AgentProfile)
                .ToListAsync();

            return Ok(users);
        }

        // CASE 6: GET (find) - Single user by Id
        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.AgentProfile)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // CASE 7: GET (filter) - Filter users by Role
        // GET: api/User/filter?role=Agent
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<User>>> FilterByRole([FromQuery] string role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
                .ToListAsync();

            return Ok(users);
        }

        // CASE 8: GET (sort/aggregate) - Users sorted by name + count grouped by Role
        // GET: api/User/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetUserStats()
        {
            var sortedUsers = await _context.Users
                .OrderBy(u => u.Name)
                .ToListAsync();

            var countByRole = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                SortedUsers = sortedUsers,
                CountByRole = countByRole
            });
        }
    }
}