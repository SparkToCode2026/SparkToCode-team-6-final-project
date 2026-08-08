using System.ComponentModel.DataAnnotations;

namespace team6.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Client"; // "Client", "Agent", or "Admin"

        // Navigation property: one User can have one AgentProfile (only if Role == "Agent")
        public AgentProfile? AgentProfile { get; set; }
        public required ICollection<Viewing> Viewings { get; set; }
    }
}