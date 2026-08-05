using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team6.Models
{
    public class AgentProfile
    {
        [Key]
        public int AgentProfileId { get; set; }

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        // Foreign Key -> User (1-to-1)
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}