using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using team6.Models;

namespace team6
{
    public class ProjectContex : DbContext
    {
        public ProjectContex(DbContextOptions<ProjectContex> options) : base(options)
        {
        }

        // Dev 1 - User & AgentProfile
        public DbSet<User> Users { get; set; }
        public DbSet<AgentProfile> AgentProfiles { get; set; }

        // NOTE for teammates: add your DbSet<T> properties below this line
        // e.g. public DbSet<Property> Properties { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Dev 1 - User <-> AgentProfile (1-to-1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.AgentProfile)
                .WithOne(a => a.User)
                .HasForeignKey<AgentProfile>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure Email is unique at the database level
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // NOTE for teammates: add your relationship configs below this line
        }
    }
}