using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentProfileController : ControllerBase
    {
        private readonly ProjectContex _context;

        public AgentProfileController(ProjectContex context)
        {
            _context = context;
        }

        // CASE 1: POST - Create a new agent profile
        // POST: api/AgentProfile
        [HttpPost]
        public async Task<ActionResult<AgentProfile>> CreateAgentProfile(AgentProfile profile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(profile.UserId);
            if (user == null)
                return NotFound("No user found with the given UserId.");

            if (user.Role != "Agent")
                return BadRequest("Only users with Role 'Agent' can have an AgentProfile.");

            bool alreadyExists = await _context.AgentProfiles.AnyAsync(a => a.UserId == profile.UserId);
            if (alreadyExists)
                return BadRequest("This user already has an AgentProfile.");

            _context.AgentProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAgentProfileById), new { id = profile.AgentProfileId }, profile);
        }

        // CASE 2: PUT - Full update of an agent profile
        // PUT: api/AgentProfile/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAgentProfile(int id, AgentProfile updatedProfile)
        {
            if (id != updatedProfile.AgentProfileId)
                return BadRequest("Route id and body AgentProfileId do not match.");

            var profile = await _context.AgentProfiles.FindAsync(id);
            if (profile == null)
                return NotFound();

            profile.LicenseNumber = updatedProfile.LicenseNumber;
            profile.Bio = updatedProfile.Bio;
            profile.Phone = updatedProfile.Phone;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // CASE 3: PATCH - A second, distinct update case (Bio only)
        // PATCH: api/AgentProfile/5/bio
        [HttpPatch("{id}/bio")]
        public async Task<IActionResult> UpdateBio(int id, [FromBody] string newBio)
        {
            var profile = await _context.AgentProfiles.FindAsync(id);
            if (profile == null)
                return NotFound();

            profile.Bio = newBio;
            await _context.SaveChangesAsync();

            return Ok(profile);
        }

        // CASE 4: DELETE - Delete an agent profile
        // DELETE: api/AgentProfile/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgentProfile(int id)
        {
            var profile = await _context.AgentProfiles.FindAsync(id);
            if (profile == null)
                return NotFound();

            _context.AgentProfiles.Remove(profile);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // CASE 5: GET (list) - All agent profiles, including their User info
        // GET: api/AgentProfile
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentProfile>>> GetAllAgentProfiles()
        {
            var profiles = await _context.AgentProfiles
                .Include(a => a.User)
                .ToListAsync();

            return Ok(profiles);
        }

        // CASE 6: GET (find) - Single agent profile by Id
        // GET: api/AgentProfile/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AgentProfile>> GetAgentProfileById(int id)
        {
            var profile = await _context.AgentProfiles
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AgentProfileId == id);

            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        // CASE 7: GET (filter) - Filter agent profiles by a related User field (Name search)
        // GET: api/AgentProfile/filter?name=john
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<AgentProfile>>> FilterByAgentName([FromQuery] string name)
        {
            var profiles = await _context.AgentProfiles
                .Include(a => a.User)
                .Where(a => a.User != null && a.User.Name.Contains(name))
                .ToListAsync();

            return Ok(profiles);
        }

        // CASE 8: GET (sort/aggregate) - Agents sorted by LicenseNumber + total count
        // GET: api/AgentProfile/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetAgentProfileStats()
        {
            var sortedProfiles = await _context.AgentProfiles
                .OrderBy(a => a.LicenseNumber)
                .ToListAsync();

            int totalAgents = await _context.AgentProfiles.CountAsync();

            return Ok(new
            {
                SortedProfiles = sortedProfiles,
                TotalAgents = totalAgents
            });
        }
    }
}