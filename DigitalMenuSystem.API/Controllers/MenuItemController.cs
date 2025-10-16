using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Menu;
using DigitalMenuSystem.API.Services.Menu;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuItemController : ControllerBase
    {
        private readonly IMenuItemService _itemService;
        private readonly ILogger<MenuItemController> _logger;

        public MenuItemController(
            IMenuItemService itemService,
            ILogger<MenuItemController> logger)
        {
            _itemService = itemService;
            _logger = logger;
        }

        /// <summary>
        /// Get all menu items for a category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemsByCategory(int categoryId)
        {
            try
            {
                var items = await _itemService.GetItemsByCategoryAsync(categoryId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting items for category {categoryId}");
                return StatusCode(500, new { message = "Error retrieving menu items" });
            }
        }

        /// <summary>
        /// Get all menu items for a restaurant
        /// </summary>
        [HttpGet("restaurant/{restaurantId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemsByRestaurant(int restaurantId)
        {
            try
            {
                var items = await _itemService.GetItemsByRestaurantAsync(restaurantId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting items for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving menu items" });
            }
        }

        /// <summary>
        /// Get a specific menu item by ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItemById(int id)
        {
            try
            {
                var item = await _itemService.GetItemByIdAsync(id);
                
                if (item == null)
                {
                    return NotFound(new { message = $"Menu item with ID {id} not found" });
                }

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting menu item {id}");
                return StatusCode(500, new { message = "Error retrieving menu item" });
            }
        }

        /// <summary>
        /// Create a new menu item
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _itemService.CreateItemAsync(dto);
                return CreatedAtAction(
                    nameof(GetItemById),
                    new { id = item.Id },
                    item
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu item");
                return StatusCode(500, new { message = "Error creating menu item" });
            }
        }

        /// <summary>
        /// Update an existing menu item
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _itemService.UpdateItemAsync(id, dto);
                
                if (item == null)
                {
                    return NotFound(new { message = $"Menu item with ID {id} not found" });
                }

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating menu item {id}");
                return StatusCode(500, new { message = "Error updating menu item" });
            }
        }

        /// <summary>
        /// Delete a menu item
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteItem(int id)
        {
            try
            {
                var success = await _itemService.DeleteItemAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = $"Menu item with ID {id} not found" });
                }

                return Ok(new { message = "Menu item deleted successfully", itemId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting menu item {id}");
                return StatusCode(500, new { message = "Error deleting menu item" });
            }
        }

        /// <summary>
        /// Toggle menu item availability (mark as available/unavailable)
        /// </summary>
        [HttpPatch("{id}/toggle-availability")]
        [Authorize]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            try
            {
                var success = await _itemService.ToggleAvailabilityAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = $"Menu item with ID {id} not found" });
                }

                return Ok(new { message = "Item availability toggled successfully", itemId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error toggling availability for item {id}");
                return StatusCode(500, new { message = "Error updating item availability" });
            }
        }

        /// <summary>
        /// Search menu items by name or description
        /// </summary>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchItems([FromQuery] int restaurantId, [FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(new { message = "Search term is required" });
            }

            try
            {
                var items = await _itemService.SearchItemsAsync(restaurantId, searchTerm);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching items for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error searching menu items" });
            }
        }

        /// <summary>
        /// Reorder menu items within a category
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="reorderDto">Array of menu item IDs in new order</param>
        /// <returns>Success status</returns>
        [HttpPost("category/{categoryId}/reorder")]
        [Authorize]
        public async Task<IActionResult> ReorderMenuItems(int categoryId, [FromBody] ReorderMenuItemsDto reorderDto)
        {
            try
            {
                var success = await _itemService.ReorderMenuItemsAsync(categoryId, reorderDto.MenuItemIds);

                if (!success)
                {
                    return BadRequest(new { message = "Failed to reorder menu items" });
                }

                return Ok(new { message = "Menu items reordered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reordering menu items for category {categoryId}");
                return StatusCode(500, new { message = "Error reordering menu items" });
            }
        }
    }
}