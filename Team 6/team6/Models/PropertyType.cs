using System.ComponentModel.DataAnnotations;

namespace team6.Models
{
    public class PropertyType
    {
        [Key]
        public int PropertyTypeId { get; set; }

        [Required]
        [MaxLength(50)]
        public string TypeName { get; set; } = string.Empty; // e.g. House, Apartment, Condo, Townhouse

        // Navigation property
        public ICollection<Property> Properties { get; set; } = new List<Property>();
    }
}
