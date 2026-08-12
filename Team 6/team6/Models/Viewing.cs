using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models;

public class Viewing
{
    [Key]
    public int ViewingId { get; set; }
 
    public DateTime ViewingDate { get; set; }
    
    public required string Status { get; set; }   // e.g. Scheduled, Completed, Cancelled
    
    [ForeignKey("Listing")]
    public int ListingId { get; set; }
    public required Listing? Listing { get; set; }
    
    
    [ForeignKey("User")]
    public int UserId { get; set; }
    public required User? User { get; set; }
}