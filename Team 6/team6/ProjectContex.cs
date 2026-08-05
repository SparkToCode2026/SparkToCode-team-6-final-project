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

        // Dev 4 - Favorite & Review
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Review> Reviews { get; set; }

        // Dev 5 - Contract & Payment
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        
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


            // Dev 4 - Favorite -> User
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Dev 4 - Favorite -> Listing
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Listing)
                .WithMany()
                .HasForeignKey(f => f.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Dev 4 - Review -> User
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Dev 4 - Review -> Property
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Property)
                .WithMany()
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);



            // Dev 5 - Contract -> User (many contracts can belong to one client)
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // TODO (Dev 5): uncomment once Dev 3's Listing.cs is merged
            // Dev 5 - Contract -> Listing (many contracts can reference one listing)
            //modelBuilder.Entity<Contract>()
            //.HasOne<Listing>()
            //.WithMany(l => l.Contracts)
            //.HasForeignKey(c => c.ListingId)
            //.OnDelete(DeleteBehavior.Restrict);

            // Dev 5 - Contract -> Payment (one contract, many payments)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Contract)
                .WithMany(c => c.Payments)
                .HasForeignKey(p => p.ContractId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}