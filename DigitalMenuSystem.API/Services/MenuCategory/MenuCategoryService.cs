using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Menu;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Menu
{
    public class MenuCategoryService : IMenuCategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MenuCategoryService> _logger;

        public MenuCategoryService(
            ApplicationDbContext context,
            ILogger<MenuCategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<MenuCategoryDto>> GetCategoriesByRestaurantAsync(int restaurantId, bool includeInactive = false)
        {
            var categories = await _context.MenuCategories
                .Where(c => c.RestaurantId == restaurantId && (includeInactive || c.IsActive))
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new MenuCategoryDto
                {
                    Id = c.Id,
                    RestaurantId = c.RestaurantId,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    ItemCount = c.MenuItems.Count(i => i.IsAvailable)
                })
                .ToListAsync();

            return categories;
        }

        public async Task<MenuCategoryDto?> GetCategoryByIdAsync(int categoryId)
        {
            var category = await _context.MenuCategories
                .Where(c => c.Id == categoryId)
                .Select(c => new MenuCategoryDto
                {
                    Id = c.Id,
                    RestaurantId = c.RestaurantId,
                    Name = c.Name,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    ItemCount = c.MenuItems.Count(i => i.IsAvailable)
                })
                .FirstOrDefaultAsync();

            return category;
        }

        public async Task<MenuCategoryDto> CreateCategoryAsync(CreateMenuCategoryDto dto)
        {
            // Validate restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
            if (restaurant == null)
            {
                throw new ArgumentException($"Restaurant with ID {dto.RestaurantId} not found");
            }

            var category = new MenuCategory
            {
                RestaurantId = dto.RestaurantId,
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                DisplayOrder = dto.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuCategories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created category: {category.Name} (ID: {category.Id}) for restaurant {dto.RestaurantId}");

            return new MenuCategoryDto
            {
                Id = category.Id,
                RestaurantId = category.RestaurantId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ItemCount = 0
            };
        }

        public async Task<MenuCategoryDto?> UpdateCategoryAsync(int categoryId, UpdateMenuCategoryDto dto)
        {
            var category = await _context.MenuCategories.FindAsync(categoryId);
            
            if (category == null)
            {
                return null;
            }

            // Update fields
            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ImageUrl = dto.ImageUrl;
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated category: {category.Name} (ID: {category.Id})");

            return new MenuCategoryDto
            {
                Id = category.Id,
                RestaurantId = category.RestaurantId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ItemCount = await _context.MenuItems
                    .CountAsync(i => i.CategoryId == categoryId && i.IsAvailable)
            };
        }

        public async Task<bool> DeleteCategoryAsync(int categoryId)
        {
            var category = await _context.MenuCategories.FindAsync(categoryId);

            if (category == null)
            {
                return false;
            }

            // Hard delete - permanently remove from database
            _context.MenuCategories.Remove(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted category: {category.Name} (ID: {category.Id})");

            return true;
        }

        public async Task<bool> CategoryExistsAsync(int categoryId)
        {
            return await _context.MenuCategories
                .AnyAsync(c => c.Id == categoryId);
        }

        public async Task<bool> ReorderCategoriesAsync(int restaurantId, int[] categoryIds)
        {
            // Validate that all categories belong to the restaurant
            var categories = await _context.MenuCategories
                .Where(c => c.RestaurantId == restaurantId && categoryIds.Contains(c.Id))
                .ToListAsync();

            if (categories.Count != categoryIds.Length)
            {
                _logger.LogWarning($"Some category IDs don't belong to restaurant {restaurantId}");
                return false;
            }

            // Update display order based on array position
            for (int i = 0; i < categoryIds.Length; i++)
            {
                var category = categories.FirstOrDefault(c => c.Id == categoryIds[i]);
                if (category != null)
                {
                    category.DisplayOrder = i;
                    category.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Reordered {categories.Count} categories for restaurant {restaurantId}");

            return true;
        }
    }
}
