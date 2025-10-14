using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Restaurant;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Restaurant
{
    public class RestaurantService : IRestaurantService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RestaurantService> _logger;

        public RestaurantService(ApplicationDbContext context, ILogger<RestaurantService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<RestaurantDto> CreateRestaurantAsync(CreateRestaurantDto dto)
        {
            // Check if subdomain already exists
            var exists = await _context.Restaurants
                .AnyAsync(r => r.Subdomain == dto.Subdomain.ToLower());

            if (exists)
            {
                throw new ArgumentException($"Subdomain '{dto.Subdomain}' is already taken");
            }

            var restaurant = new Models.Restaurant
            {
                Name = dto.Name,
                Subdomain = dto.Subdomain.ToLower(),
                Logo = dto.Logo,
                Address = dto.Address,
                Phone = dto.Phone,
                Email = dto.Email,
                IsActive = true,
                SubscriptionStart = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Restaurant '{restaurant.Name}' created with subdomain '{restaurant.Subdomain}'");

            return await GetRestaurantByIdAsync(restaurant.Id)
                ?? throw new Exception("Failed to retrieve created restaurant");
        }

        public async Task<RestaurantDto?> GetRestaurantByIdAsync(int id)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.Tables)
                .Include(r => r.MenuCategories)
                    .ThenInclude(mc => mc.MenuItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (restaurant == null) return null;

            return MapToDto(restaurant);
        }

        public async Task<RestaurantDto?> GetRestaurantBySubdomainAsync(string subdomain)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.Tables)
                .Include(r => r.MenuCategories)
                    .ThenInclude(mc => mc.MenuItems)
                .FirstOrDefaultAsync(r => r.Subdomain == subdomain.ToLower() && r.IsActive);

            if (restaurant == null) return null;

            return MapToDto(restaurant);
        }

        public async Task<List<RestaurantDto>> GetAllRestaurantsAsync()
        {
            var restaurants = await _context.Restaurants
                .Include(r => r.Tables)
                .Include(r => r.MenuCategories)
                    .ThenInclude(mc => mc.MenuItems)
                .OrderBy(r => r.Name)
                .ToListAsync();

            return restaurants.Select(MapToDto).ToList();
        }

        public async Task<RestaurantDto?> UpdateRestaurantAsync(int id, UpdateRestaurantDto dto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return null;

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.Name))
                restaurant.Name = dto.Name;

            if (dto.Logo != null)
                restaurant.Logo = dto.Logo;

            if (dto.Address != null)
                restaurant.Address = dto.Address;

            if (dto.Phone != null)
                restaurant.Phone = dto.Phone;

            if (dto.Email != null)
                restaurant.Email = dto.Email;

            if (dto.IsActive.HasValue)
                restaurant.IsActive = dto.IsActive.Value;

            restaurant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Restaurant {id} updated");

            return await GetRestaurantByIdAsync(id);
        }

        public async Task<bool> DeleteRestaurantAsync(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return false;

            // Soft delete - deactivate instead of removing
            restaurant.IsActive = false;
            restaurant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Restaurant {id} deactivated");

            return true;
        }

        private static RestaurantDto MapToDto(Models.Restaurant restaurant)
        {
            return new RestaurantDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Subdomain = restaurant.Subdomain,
                Logo = restaurant.Logo,
                Address = restaurant.Address,
                Phone = restaurant.Phone,
                Email = restaurant.Email,
                IsActive = restaurant.IsActive,
                CreatedAt = restaurant.CreatedAt,
                UpdatedAt = restaurant.UpdatedAt,
                TotalTables = restaurant.Tables.Count,
                TotalMenuItems = restaurant.MenuCategories.Sum(mc => mc.MenuItems.Count)
            };
        }
    }
}
