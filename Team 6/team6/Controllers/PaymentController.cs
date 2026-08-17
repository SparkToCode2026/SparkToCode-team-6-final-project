using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;

namespace team6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ProjectContex _context;

        public PaymentController(ProjectContex context)
        {
            _context = context;
        }

        // 1. GET - Get all Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Contract)
                .ToListAsync();

            return Ok(payments);
        }

        // 2. GET - Get Payment by Id
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Contract)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        // 3. GET - Get Payments by Contract
        [HttpGet("contract/{contractId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByContract(
            int contractId)
        {
            var payments = await _context.Payments
                .Where(p => p.ContractId == contractId)
                .ToListAsync();

            return Ok(payments);
        }

        // 4. POST - Create a new Payment
        [HttpPost]
        public async Task<ActionResult<Payment>> CreatePayment(
            Payment payment)
        {
            if (payment.Amount <= 0)
                return BadRequest("Payment amount must be greater than zero.");

            var contractExists = await _context.Contracts
                .AnyAsync(c => c.ContractId == payment.ContractId);

            if (!contractExists)
                return BadRequest("The specified contract does not exist.");

            if (string.IsNullOrWhiteSpace(payment.Method))
                return BadRequest("Payment method is required.");

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPayment),
                new { id = payment.PaymentId },
                payment);
        }

        // 5. PUT - Update Payment
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(
            int id,
            Payment payment)
        {
            if (id != payment.PaymentId)
                return BadRequest();

            if (payment.Amount <= 0)
                return BadRequest("Payment amount must be greater than zero.");

            if (string.IsNullOrWhiteSpace(payment.Method))
                return BadRequest("Payment method is required.");

            var existingPayment = await _context.Payments
                .FindAsync(id);

            if (existingPayment == null)
                return NotFound();

            existingPayment.Amount = payment.Amount;
            existingPayment.PaymentDate = payment.PaymentDate;
            existingPayment.Method = payment.Method;
            existingPayment.ContractId = payment.ContractId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 6. DELETE - Delete Payment
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments
                .FindAsync(id);

            if (payment == null)
                return NotFound();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}