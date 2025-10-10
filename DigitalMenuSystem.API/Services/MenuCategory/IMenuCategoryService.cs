using DigitalMenuSystem.API.DTOs.Menu;

namespace DigitalMenuSystem.API.Services.Menu
{
    public interface IMenuCategoryService
    {
        /// <summary>
        /// Get all categories for a restaurant
        /// </summary>
        Task<List<MenuCategoryDto>> GetCategoriesByRestaurantAsync(int restaurantId);
        
        /// <summary>
        /// Get a specific category by ID
        /// </summary>
        Task<MenuCategoryDto?> GetCategoryByIdAsync(int categoryId);
        
        /// <summary>
        /// Create a new menu category
        /// </summary>
        Task<MenuCategoryDto> CreateCategoryAsync(CreateMenuCategoryDto dto);
        
        /// <summary>
        /// Update an existing category
        /// </summary>
        Task<MenuCategoryDto?> UpdateCategoryAsync(int categoryId, UpdateMenuCategoryDto dto);
        
        /// <summary>
        /// Delete a category (soft delete - mark as inactive)
        /// </summary>
        Task<bool> DeleteCategoryAsync(int categoryId);
        
        /// <summary>
        /// Check if category exists
        /// </summary>
        Task<bool> CategoryExistsAsync(int categoryId);
    }
}