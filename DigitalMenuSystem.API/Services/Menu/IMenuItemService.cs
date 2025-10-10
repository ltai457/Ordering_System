using DigitalMenuSystem.API.DTOs.Menu;

namespace DigitalMenuSystem.API.Services.Menu
{
    public interface IMenuItemService
    {
        /// <summary>
        /// Get all menu items for a category
        /// </summary>
        Task<List<MenuItemDto>> GetItemsByCategoryAsync(int categoryId);
        
        /// <summary>
        /// Get all menu items for a restaurant
        /// </summary>
        Task<List<MenuItemDto>> GetItemsByRestaurantAsync(int restaurantId);
        
        /// <summary>
        /// Get a specific menu item by ID
        /// </summary>
        Task<MenuItemDto?> GetItemByIdAsync(int itemId);
        
        /// <summary>
        /// Create a new menu item
        /// </summary>
        Task<MenuItemDto> CreateItemAsync(CreateMenuItemDto dto);
        
        /// <summary>
        /// Update an existing menu item
        /// </summary>
        Task<MenuItemDto?> UpdateItemAsync(int itemId, UpdateMenuItemDto dto);
        
        /// <summary>
        /// Delete a menu item
        /// </summary>
        Task<bool> DeleteItemAsync(int itemId);
        
        /// <summary>
        /// Toggle item availability (mark as available/unavailable)
        /// </summary>
        Task<bool> ToggleAvailabilityAsync(int itemId);
        
        /// <summary>
        /// Search menu items by name
        /// </summary>
        Task<List<MenuItemDto>> SearchItemsAsync(int restaurantId, string searchTerm);
    }
}