using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models;

public class Listing
{
    [Key]
    public int ListingId { get; set; }
    
    public decimal Price { get; set; }
 
    public string Status { get; set; }   
    
    public DateTime ListingDate { get; set; }
    
    [ForeignKey("Property")]
    public int PropertyId { get; set; }
    //public Property Property { get; set; }
 
    //Navigation properties
    public ICollection<Viewing> Viewings { get; set; } = new List<Viewing>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    
    // Added by Dev 5 — needed to wire Contract.ListingId as a real FK.
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}