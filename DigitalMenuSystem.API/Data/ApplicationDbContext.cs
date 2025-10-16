using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets - Tables in database
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<MenuItemAddOn> MenuItemAddOns { get; set; }
        public DbSet<AddOnLibrary> AddOnLibrary { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints

            // Restaurant → Tables (One-to-Many)
            modelBuilder.Entity<Restaurant>()
                .HasMany(r => r.Tables)
                .WithOne(t => t.Restaurant)
                .HasForeignKey(t => t.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restaurant → MenuCategories (One-to-Many)
            modelBuilder.Entity<Restaurant>()
                .HasMany(r => r.MenuCategories)
                .WithOne(mc => mc.Restaurant)
                .HasForeignKey(mc => mc.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restaurant → Users (One-to-Many)
            modelBuilder.Entity<Restaurant>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Restaurant)
                .HasForeignKey(u => u.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            // MenuCategory → MenuItems (One-to-Many)
            modelBuilder.Entity<MenuCategory>()
                .HasMany(mc => mc.MenuItems)
                .WithOne(mi => mi.Category)
                .HasForeignKey(mi => mi.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Table → Orders (One-to-Many)
            modelBuilder.Entity<Table>()
                .HasMany(t => t.Orders)
                .WithOne(o => o.Table)
                .HasForeignKey(o => o.TableId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order → OrderItems (One-to-Many)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // MenuItem → OrderItems (One-to-Many)
            modelBuilder.Entity<MenuItem>()
                .HasMany(mi => mi.OrderItems)
                .WithOne(oi => oi.MenuItem)
                .HasForeignKey(oi => oi.MenuItemId)
                .OnDelete(DeleteBehavior.Restrict);

            // MenuItem → MenuItemAddOns (One-to-Many)
            modelBuilder.Entity<MenuItem>()
                .HasMany(mi => mi.AddOns)
                .WithOne(ao => ao.MenuItem)
                .HasForeignKey(ao => ao.MenuItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restaurant → AddOnLibrary (One-to-Many)
            modelBuilder.Entity<Restaurant>()
                .HasMany<AddOnLibrary>()
                .WithOne(aol => aol.Restaurant)
                .HasForeignKey(aol => aol.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Role → Users (One-to-Many)
            modelBuilder.Entity<Role>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Role)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unique Indexes
            modelBuilder.Entity<Restaurant>()
                .HasIndex(r => r.Subdomain)
                .IsUnique();

            modelBuilder.Entity<Table>()
                .HasIndex(t => t.TableCode)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Seed Initial Data (Optional - we can add this later)
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Use a fixed date for seed data to avoid migration issues
            var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = 1,
                    Name = "SuperAdmin",
                    Description = "Full system access",
                    CanManageMenu = true,
                    CanManageOrders = true,
                    CanManageUsers = true,
                    CanManageTables = true,
                    CanViewReports = true,
                    IsActive = true,
                    CreatedAt = seedDate
                },
                new Role
                {
                    Id = 2,
                    Name = "Admin",
                    Description = "Restaurant administrator",
                    CanManageMenu = true,
                    CanManageOrders = true,
                    CanManageUsers = false,
                    CanManageTables = true,
                    CanViewReports = true,
                    IsActive = true,
                    CreatedAt = seedDate
                },
                new Role
                {
                    Id = 3,
                    Name = "Chef",
                    Description = "Kitchen staff",
                    CanManageMenu = false,
                    CanManageOrders = true,
                    CanManageUsers = false,
                    CanManageTables = false,
                    CanViewReports = false,
                    IsActive = true,
                    CreatedAt = seedDate
                },
                new Role
                {
                    Id = 4,
                    Name = "FrontOfHouse",
                    Description = "Waitstaff and servers",
                    CanManageMenu = false,
                    CanManageOrders = true,
                    CanManageUsers = false,
                    CanManageTables = true,
                    CanViewReports = false,
                    IsActive = true,
                    CreatedAt = seedDate
                }
            );
        }
    }
}