using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models;

public class Contract
{
    [Key]
    public int ContractId { get; set; }

    [Required]
    public DateTime SignedDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    // Foreign Key -> Listing
    [Required]
    public int ListingId { get; set; }

    // Foreign Key -> User (the client signing the contract)
    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    // Navigation property: one Contract can have many Payments
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
