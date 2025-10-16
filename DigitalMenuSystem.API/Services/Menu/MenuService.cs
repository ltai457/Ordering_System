using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Menu;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Menu
{
    public class MenuItemService : IMenuItemService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MenuItemService> _logger;

        public MenuItemService(
            ApplicationDbContext context,
            ILogger<MenuItemService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<MenuItemDto>> GetItemsByCategoryAsync(int categoryId)
        {
            var items = await _context.MenuItems
                .Include(i => i.Category)
                .Include(i => i.AddOns)
                .Where(i => i.CategoryId == categoryId)
                .OrderBy(i => i.DisplayOrder)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    DietaryInfo = i.DietaryInfo,
                    IsAvailable = i.IsAvailable,
                    DisplayOrder = i.DisplayOrder,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    AddOns = i.AddOns.Where(a => a.IsAvailable).OrderBy(a => a.DisplayOrder).Select(a => new MenuItemAddOnDto
                    {
                        Id = a.Id,
                        MenuItemId = a.MenuItemId,
                        Name = a.Name,
                        Price = a.Price,
                        IsAvailable = a.IsAvailable,
                        DisplayOrder = a.DisplayOrder
                    }).ToList()
                })
                .ToListAsync();

            return items;
        }

        public async Task<List<MenuItemDto>> GetItemsByRestaurantAsync(int restaurantId)
        {
            var items = await _context.MenuItems
                .Include(i => i.Category)
                .Include(i => i.AddOns)
                .Where(i => i.Category.RestaurantId == restaurantId)
                .OrderBy(i => i.Category.DisplayOrder)
                .ThenBy(i => i.DisplayOrder)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    DietaryInfo = i.DietaryInfo,
                    IsAvailable = i.IsAvailable,
                    DisplayOrder = i.DisplayOrder,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    AddOns = i.AddOns.Where(a => a.IsAvailable).OrderBy(a => a.DisplayOrder).Select(a => new MenuItemAddOnDto
                    {
                        Id = a.Id,
                        MenuItemId = a.MenuItemId,
                        Name = a.Name,
                        Price = a.Price,
                        IsAvailable = a.IsAvailable,
                        DisplayOrder = a.DisplayOrder
                    }).ToList()
                })
                .ToListAsync();

            return items;
        }

        public async Task<MenuItemDto?> GetItemByIdAsync(int itemId)
        {
            var item = await _context.MenuItems
                .Include(i => i.Category)
                .Include(i => i.AddOns)
                .Where(i => i.Id == itemId)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    DietaryInfo = i.DietaryInfo,
                    IsAvailable = i.IsAvailable,
                    DisplayOrder = i.DisplayOrder,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    AddOns = i.AddOns.Where(a => a.IsAvailable).OrderBy(a => a.DisplayOrder).Select(a => new MenuItemAddOnDto
                    {
                        Id = a.Id,
                        MenuItemId = a.MenuItemId,
                        Name = a.Name,
                        Price = a.Price,
                        IsAvailable = a.IsAvailable,
                        DisplayOrder = a.DisplayOrder
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return item;
        }

        public async Task<MenuItemDto> CreateItemAsync(CreateMenuItemDto dto)
        {
            // Validate category exists
            var category = await _context.MenuCategories.FindAsync(dto.CategoryId);
            if (category == null)
            {
                throw new ArgumentException($"Category with ID {dto.CategoryId} not found");
            }

            var item = new MenuItem
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                DietaryInfo = dto.DietaryInfo,
                IsAvailable = true,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created menu item: {item.Name} (ID: {item.Id}) in category {dto.CategoryId}");

            return new MenuItemDto
            {
                Id = item.Id,
                CategoryId = item.CategoryId,
                CategoryName = category.Name,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                DietaryInfo = item.DietaryInfo,
                IsAvailable = item.IsAvailable,
                DisplayOrder = item.DisplayOrder,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            };
        }

        public async Task<MenuItemDto?> UpdateItemAsync(int itemId, UpdateMenuItemDto dto)
        {
            var item = await _context.MenuItems
                .Include(i => i.Category)
                .FirstOrDefaultAsync(i => i.Id == itemId);
            
            if (item == null)
            {
                return null;
            }

            // Update fields
            item.Name = dto.Name;
            item.Description = dto.Description;
            item.Price = dto.Price;
            item.ImageUrl = dto.ImageUrl;
            item.DietaryInfo = dto.DietaryInfo;
            item.IsAvailable = dto.IsAvailable;
            item.DisplayOrder = dto.DisplayOrder;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated menu item: {item.Name} (ID: {item.Id})");

            return new MenuItemDto
            {
                Id = item.Id,
                CategoryId = item.CategoryId,
                CategoryName = item.Category.Name,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                DietaryInfo = item.DietaryInfo,
                IsAvailable = item.IsAvailable,
                DisplayOrder = item.DisplayOrder,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            };
        }

        public async Task<bool> DeleteItemAsync(int itemId)
        {
            var item = await _context.MenuItems.FindAsync(itemId);
            
            if (item == null)
            {
                return false;
            }

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted menu item: {item.Name} (ID: {item.Id})");

            return true;
        }

        public async Task<bool> ToggleAvailabilityAsync(int itemId)
        {
            var item = await _context.MenuItems.FindAsync(itemId);
            
            if (item == null)
            {
                return false;
            }

            item.IsAvailable = !item.IsAvailable;
            item.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Toggled availability for {item.Name} (ID: {item.Id}): {item.IsAvailable}");

            return true;
        }

        public async Task<List<MenuItemDto>> SearchItemsAsync(int restaurantId, string searchTerm)
        {
            var items = await _context.MenuItems
                .Include(i => i.Category)
                .Where(i => i.Category.RestaurantId == restaurantId &&
                           (i.Name.Contains(searchTerm) ||
                            i.Description!.Contains(searchTerm)))
                .OrderBy(i => i.DisplayOrder)
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category.Name,
                    Name = i.Name,
                    Description = i.Description,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl,
                    DietaryInfo = i.DietaryInfo,
                    IsAvailable = i.IsAvailable,
                    DisplayOrder = i.DisplayOrder,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return items;
        }

        public async Task<bool> ReorderMenuItemsAsync(int categoryId, int[] menuItemIds)
        {
            // Validate that all menu items belong to the category
            var menuItems = await _context.MenuItems
                .Where(i => i.CategoryId == categoryId && menuItemIds.Contains(i.Id))
                .ToListAsync();

            if (menuItems.Count != menuItemIds.Length)
            {
                _logger.LogWarning($"Some menu item IDs don't belong to category {categoryId}");
                return false;
            }

            // Update display order based on array position
            for (int i = 0; i < menuItemIds.Length; i++)
            {
                var menuItem = menuItems.FirstOrDefault(m => m.Id == menuItemIds[i]);
                if (menuItem != null)
                {
                    menuItem.DisplayOrder = i;
                    menuItem.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Reordered {menuItems.Count} menu items for category {categoryId}");

            return true;
        }
    }
}