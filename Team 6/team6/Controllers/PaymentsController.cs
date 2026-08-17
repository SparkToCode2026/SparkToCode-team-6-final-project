using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using team6.Models;


namespace team6.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ProjectContex _context;

    public PaymentsController(ProjectContex context)
    {
        _context = context;
    }

    // GET all, including related Contract via Include()
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
    {
        var payments = await _context.Payments
            .Include(p => p.Contract)
            .ToListAsync();
        return Ok(payments);
    }

    // GET single by id
    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Contract)
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null) return NotFound($"Payment {id} not found.");
        return Ok(payment);
    }

    // GET by contract 
    [HttpGet("contract/{contractId}")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByContract(int contractId)
    {
        var exists = await _context.Contracts.AnyAsync(c => c.ContractId == contractId);
        if (!exists) return NotFound($"Contract {contractId} not found.");

        var payments = await _context.Payments
            .Where(p => p.ContractId == contractId)
            .ToListAsync();

        return Ok(payments);
    }

    // GET filtered by date range 
    [HttpGet("filter")]
    public async Task<ActionResult<IEnumerable<Payment>>> FilterPayments(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _context.Payments.Include(p => p.Contract).AsQueryable();

        if (from.HasValue) query = query.Where(p => p.PaymentDate >= from.Value);
        if (to.HasValue) query = query.Where(p => p.PaymentDate <= to.Value);

        return Ok(await query.ToListAsync());
    }

    // GET sorted 
    [HttpGet("stats")]
    public async Task<ActionResult> GetPaymentStats()
    {
        var sortedByAmount = await _context.Payments
            .OrderByDescending(p => p.Amount)
            .Select(p => new { p.PaymentId, p.Amount, p.Method, p.PaymentDate })
            .ToListAsync();

        var totalsByMethod = await _context.Payments
            .GroupBy(p => p.Method)
            .Select(g => new
            {
                Method = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(p => p.Amount)
            })
            .ToListAsync();

        return Ok(new { SortedByAmountDesc = sortedByAmount, TotalsByMethod = totalsByMethod });
    }

    // POST - create a new payment
    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(Payment payment)
    {
        if (payment.Amount <= 0) return BadRequest("Payment amount must be greater than zero.");
        if (string.IsNullOrWhiteSpace(payment.Method)) return BadRequest("Payment method is required.");

        var contractExists = await _context.Contracts.AnyAsync(c => c.ContractId == payment.ContractId);
        if (!contractExists) return BadRequest("ContractId does not exist.");

        payment.PaymentId = 0; // ignore any client-supplied id
        if (payment.PaymentDate == default) payment.PaymentDate = DateTime.UtcNow;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, payment);
    }

    // PUT - full update
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, Payment updated)
    {
        if (id != updated.PaymentId) return BadRequest("Route id and PaymentId do not match.");
        if (updated.Amount <= 0) return BadRequest("Payment amount must be greater than zero.");
        if (string.IsNullOrWhiteSpace(updated.Method)) return BadRequest("Payment method is required.");

        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound($"Payment {id} not found.");

        payment.Amount = updated.Amount;
        payment.PaymentDate = updated.PaymentDate;
        payment.Method = updated.Method;
        payment.ContractId = updated.ContractId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT - method-only update 
    [HttpPut("{id}/method")]
    public async Task<IActionResult> UpdatePaymentMethod(int id, [FromBody] string method)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound($"Payment {id} not found.");

        var validMethods = new[] { "CreditCard", "BankTransfer", "Cash" };
        if (!validMethods.Contains(method))
            return BadRequest($"Method must be one of: {string.Join(", ", validMethods)}");

        payment.Method = method;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound($"Payment {id} not found.");

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}