using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SeedController> _logger;

        public SeedController(ApplicationDbContext context, ILogger<SeedController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Seed initial test data (Restaurant + Admin User)
        /// ⚠️ Remove this endpoint in production!
        /// </summary>
        [HttpPost("init")]
        public async Task<IActionResult> SeedInitialData()
        {
            try
            {
                // Check if data already exists
                var existingRestaurant = await _context.Restaurants.FirstOrDefaultAsync();
                if (existingRestaurant != null)
                {
                    return BadRequest(new { message = "Database already has data. Seeding skipped." });
                }

                // 1. Create Test Restaurant
                var restaurant = new Restaurant
                {
                    Name = "Chang An BBQ",
                    Subdomain = "changanbbq",
                    Address = "123 Test Street, Auckland, New Zealand",
                    Phone = "+64 21 123 4567",
                    Email = "info@changanbbq.com",
                    IsActive = true,
                    SubscriptionStart = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Restaurants.Add(restaurant);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created restaurant: {restaurant.Name} (ID: {restaurant.Id})");

                // 2. Create Admin User
                // Password: "Admin123!" (hashed with BCrypt)
                var adminUser = new User
                {
                    Username = "admin",
                    FullName = "Admin User",
                    Email = "admin@changanbbq.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    RestaurantId = restaurant.Id,
                    RoleId = 1, // SuperAdmin role (from seed data)
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created admin user: {adminUser.Username} (ID: {adminUser.Id})");

                // 3. Create some test tables
                var tables = new List<Table>
                {
                    new Table
                    {
                        RestaurantId = restaurant.Id,
                        TableNumber = "T1",
                        TableCode = "TBL-001",
                        Capacity = 4,
                        Location = "Main Hall",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Table
                    {
                        RestaurantId = restaurant.Id,
                        TableNumber = "T2",
                        TableCode = "TBL-002",
                        Capacity = 2,
                        Location = "Window Side",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Table
                    {
                        RestaurantId = restaurant.Id,
                        TableNumber = "T3",
                        TableCode = "TBL-003",
                        Capacity = 6,
                        Location = "Patio",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                _context.Tables.AddRange(tables);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created {tables.Count} test tables");

                return Ok(new
                {
                    success = true,
                    message = "Database seeded successfully!",
                    data = new
                    {
                        restaurant = new
                        {
                            id = restaurant.Id,
                            name = restaurant.Name,
                            subdomain = restaurant.Subdomain
                        },
                        adminUser = new
                        {
                            id = adminUser.Id,
                            username = adminUser.Username,
                            password = "Admin123!", // Show password only for testing
                            email = adminUser.Email
                        },
                        tables = tables.Select(t => new
                        {
                            id = t.Id,
                            number = t.TableNumber,
                            code = t.TableCode
                        })
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding database");
                return StatusCode(500, new { message = "Error seeding database", error = ex.Message });
            }
        }

        /// <summary>
        /// Clear all data (for testing only)
        /// ⚠️ DANGER: This deletes everything!
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearAllData()
        {
            try
            {
                // Delete in correct order to avoid foreign key violations
                _context.OrderItems.RemoveRange(_context.OrderItems);
                _context.Orders.RemoveRange(_context.Orders);
                _context.MenuItems.RemoveRange(_context.MenuItems);
                _context.MenuCategories.RemoveRange(_context.MenuCategories);
                _context.Tables.RemoveRange(_context.Tables);
                _context.Users.RemoveRange(_context.Users);
                _context.Restaurants.RemoveRange(_context.Restaurants);
                // Don't delete Roles - they're seeded

                await _context.SaveChangesAsync();

                return Ok(new { message = "All data cleared successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing database");
                return StatusCode(500, new { message = "Error clearing database", error = ex.Message });
            }
        }
    }
}