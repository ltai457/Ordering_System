using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Menu;
using DigitalMenuSystem.API.Services.Menu;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuCategoryController : ControllerBase
    {
        private readonly IMenuCategoryService _categoryService;
        private readonly ILogger<MenuCategoryController> _logger;

        public MenuCategoryController(
            IMenuCategoryService categoryService,
            ILogger<MenuCategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all categories for a restaurant
        /// </summary>
        /// <param name="restaurantId">Restaurant ID</param>
        /// <returns>List of menu categories</returns>
        [HttpGet("restaurant/{restaurantId}")]
        [AllowAnonymous] // Customers can view menu
        public async Task<IActionResult> GetCategoriesByRestaurant(int restaurantId, [FromQuery] bool includeInactive = false)
        {
            try
            {
                var categories = await _categoryService.GetCategoriesByRestaurantAsync(restaurantId, includeInactive);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting categories for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving categories" });
            }
        }

        /// <summary>
        /// Get a specific category by ID
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Category details</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                
                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting category {id}");
                return StatusCode(500, new { message = "Error retrieving category" });
            }
        }

        /// <summary>
        /// Create a new menu category
        /// </summary>
        /// <param name="dto">Category details</param>
        /// <returns>Created category</returns>
        [HttpPost]
        [Authorize] // Only staff can create categories
        public async Task<IActionResult> CreateCategory([FromBody] CreateMenuCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var category = await _categoryService.CreateCategoryAsync(dto);
                return CreatedAtAction(
                    nameof(GetCategoryById),
                    new { id = category.Id },
                    category
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { message = "Error creating category" });
            }
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <param name="dto">Updated category details</param>
        /// <returns>Updated category</returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateMenuCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, dto);
                
                if (category == null)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating category {id}");
                return StatusCode(500, new { message = "Error updating category" });
            }
        }

        /// <summary>
        /// Delete a category permanently
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var success = await _categoryService.DeleteCategoryAsync(id);

                if (!success)
                {
                    return NotFound(new { message = $"Category with ID {id} not found" });
                }

                return Ok(new { message = "Category deleted successfully", categoryId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting category {id}");
                return StatusCode(500, new { message = "Error deleting category" });
            }
        }

        /// <summary>
        /// Reorder categories
        /// </summary>
        /// <param name="restaurantId">Restaurant ID</param>
        /// <param name="reorderDto">Array of category IDs in new order</param>
        /// <returns>Success status</returns>
        [HttpPost("restaurant/{restaurantId}/reorder")]
        [Authorize]
        public async Task<IActionResult> ReorderCategories(int restaurantId, [FromBody] ReorderCategoriesDto reorderDto)
        {
            try
            {
                var success = await _categoryService.ReorderCategoriesAsync(restaurantId, reorderDto.CategoryIds);

                if (!success)
                {
                    return BadRequest(new { message = "Failed to reorder categories" });
                }

                return Ok(new { message = "Categories reordered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reordering categories for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error reordering categories" });
            }
        }
    }
}
