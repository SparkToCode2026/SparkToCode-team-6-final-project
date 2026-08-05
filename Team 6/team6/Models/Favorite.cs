using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models
{
    public class Favorite
    {
        [Key]
        public int FavoriteId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ListingId { get; set; }

        // Navigation Properties
        public User User { get; set; }

        public Listing Listing { get; set; }
    }
}