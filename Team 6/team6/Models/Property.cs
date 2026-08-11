using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models
{
    public class Property
    {
        [Key]
        public int PropertyId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Range(0, int.MaxValue)]
        public int Bedrooms { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Bathrooms { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int SquareFootage { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        // Foreign Key -> PropertyType
        [Required]
        public int PropertyTypeId { get; set; }

        [ForeignKey("PropertyTypeId")]
        public PropertyType? PropertyType { get; set; }

        // Foreign Key -> City
        [Required]
        public int CityId { get; set; }

        [ForeignKey("CityId")]
        public City? City { get; set; }

        // Foreign Key -> User (the listing Agent responsible for this property)
        [Required]
        public int AgentId { get; set; }

        [ForeignKey("AgentId")]
        public User? Agent { get; set; }

        // Navigation properties
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
