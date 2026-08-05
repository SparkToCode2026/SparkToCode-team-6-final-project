using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime PaymentDate { get; set; }

    [Required]
    [MaxLength(30)]
    public string Method { get; set; } = string.Empty; 

    // Foreign Key -> Contract (many payments can belong to one contract)
    [Required]
    public int ContractId { get; set; }

    [ForeignKey("ContractId")]
    public Contract? Contract { get; set; }
}