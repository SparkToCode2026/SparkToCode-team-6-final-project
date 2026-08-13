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

dev2
=======


main
        // Dev 2 - Property & PropertyType
        public DbSet<Property> Properties { get; set; }
        public DbSet<PropertyType> PropertyTypes { get; set; }

dev2
=======


main
        // Dev 3 - Listing & Viewing
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Viewing> Viewings { get; set; }
        
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

            // Dev 2 - Property -> PropertyType (many properties can share one type)
            modelBuilder.Entity<Property>()
                .HasOne(p => p.PropertyType)
                .WithMany(pt => pt.Properties)
                .HasForeignKey(p => p.PropertyTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dev 2 - Property -> City (many properties can be in one city)
            modelBuilder.Entity<Property>()
                .HasOne(p => p.City)
                .WithMany()
                .HasForeignKey(p => p.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dev 2 - Property -> User (the Agent responsible for the property)
            modelBuilder.Entity<Property>()
                .HasOne(p => p.Agent)
                .WithMany()
                .HasForeignKey(p => p.AgentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dev 2 - Property -> Listing (one property can have many listings over time)
            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Property)
                .WithMany(p => p.Listings)
                .HasForeignKey(l => l.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dev 2 - Property -> Review (one property can have many reviews)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

dev2
=======



main
            // Dev 5 - Contract -> User (many contracts can belong to one client)
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dev 5 - Contract -> Listing (many contracts can reference one listing)
            modelBuilder.Entity<Contract>()
                .HasOne<Listing>()
                .WithMany(l => l.Contracts)
                .HasForeignKey(c => c.ListingId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Dev 3 - Viewing -> Listing (many viewings per listing)
            modelBuilder.Entity<Viewing>()
                .HasOne(v => v.Listing)
                .WithMany(l => l.Viewings)
                .HasForeignKey(v => v.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Dev 3 - Viewing -> User (many viewings per user)
            modelBuilder.Entity<Viewing>()
                .HasOne(v => v.User)
                .WithMany(u => u.Viewings)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Listing>()
                .Property(l => l.Price)
                .HasColumnType("decimal(18,2)");
            
            // Dev 5 - Contract -> Payment (one contract, many payments)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Contract)
                .WithMany(c => c.Payments)
                .HasForeignKey(p => p.ContractId)
                .OnDelete(DeleteBehavior.Cascade);


            // Dev 6 - City & Amenity
            modelBuilder.Entity<City>();
            modelBuilder.Entity<Amenity>();
        }
        
        
            // Dev 6 - City & Amenity
        public DbSet<City> Cities { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
    }
    }


