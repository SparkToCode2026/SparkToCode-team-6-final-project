using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ContractController : ControllerBase
	{
		private readonly ProjectContex _context;

		public ContractController(ProjectContex context)
		{
			_context = context;
		}

		// 1. GET - Get all Contracts
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Contract>>> GetContracts()
		{
			var contracts = await _context.Contracts
				.Include(c => c.User)
				.Include(c => c.Payments)
				.ToListAsync();

			return Ok(contracts);
		}

		// 2. GET - Get Contract by Id
		[HttpGet("{id}")]
		public async Task<ActionResult<Contract>> GetContract(int id)
		{
			var contract = await _context.Contracts
				.Include(c => c.User)
				.Include(c => c.Payments)
				.FirstOrDefaultAsync(c => c.ContractId == id);

			if (contract == null)
				return NotFound();

			return Ok(contract);
		}

		// 3. GET - Get Contracts by User
		[HttpGet("user/{userId}")]
		public async Task<ActionResult<IEnumerable<Contract>>> GetContractsByUser(
			int userId)
		{
			var contracts = await _context.Contracts
				.Include(c => c.Payments)
				.Where(c => c.UserId == userId)
				.ToListAsync();

			return Ok(contracts);
		}

		// 4. POST - Create a new Contract
		[HttpPost]
		public async Task<ActionResult<Contract>> CreateContract(
			Contract contract)
		{
			if (string.IsNullOrWhiteSpace(contract.Status))
				contract.Status = "Pending";

			_context.Contracts.Add(contract);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetContract),
				new { id = contract.ContractId },
				contract);
		}

		// 5. PUT - Update Contract
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateContract(
			int id,
			Contract contract)
		{
			if (id != contract.ContractId)
				return BadRequest();

			var existingContract = await _context.Contracts
				.FindAsync(id);

			if (existingContract == null)
				return NotFound();

			existingContract.SignedDate = contract.SignedDate;
			existingContract.Status = contract.Status;
			existingContract.ListingId = contract.ListingId;
			existingContract.UserId = contract.UserId;

			await _context.SaveChangesAsync();

			return NoContent();
		}

		// 6. PATCH - Change Contract Status
		[HttpPatch("{id}/status")]
		public async Task<IActionResult> ChangeContractStatus(
			int id,
			string status)
		{
			var contract = await _context.Contracts
				.FindAsync(id);

			if (contract == null)
				return NotFound();

			if (string.IsNullOrWhiteSpace(status))
				return BadRequest("Status cannot be empty.");

			contract.Status = status;

			await _context.SaveChangesAsync();

			return Ok(contract);
		}

		// 7. DELETE - Delete Contract
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteContract(int id)
		{
			var contract = await _context.Contracts
				.FindAsync(id);

			if (contract == null)
				return NotFound();

			_context.Contracts.Remove(contract);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}