using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Restaurant;
using DigitalMenuSystem.API.Services.Restaurant;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;
        private readonly ILogger<RestaurantController> _logger;

        public RestaurantController(IRestaurantService restaurantService, ILogger<RestaurantController> logger)
        {
            _restaurantService = restaurantService;
            _logger = logger;
        }

        /// <summary>
        /// Get all restaurants (SuperAdmin only)
        /// </summary>
        [HttpGet]
        [Authorize] // Can add role check for SuperAdmin
        public async Task<IActionResult> GetAllRestaurants()
        {
            try
            {
                var restaurants = await _restaurantService.GetAllRestaurantsAsync();
                return Ok(restaurants);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all restaurants");
                return StatusCode(500, new { message = "Error retrieving restaurants" });
            }
        }

        /// <summary>
        /// Get restaurant by ID (public - for customer app)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRestaurantById(int id)
        {
            try
            {
                var restaurant = await _restaurantService.GetRestaurantByIdAsync(id);

                if (restaurant == null)
                {
                    return NotFound(new { message = $"Restaurant {id} not found" });
                }

                return Ok(restaurant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting restaurant {id}");
                return StatusCode(500, new { message = "Error retrieving restaurant" });
            }
        }

        /// <summary>
        /// Get restaurant by subdomain (public - for customer app)
        /// </summary>
        [HttpGet("subdomain/{subdomain}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRestaurantBySubdomain(string subdomain)
        {
            try
            {
                var restaurant = await _restaurantService.GetRestaurantBySubdomainAsync(subdomain);

                if (restaurant == null)
                {
                    return NotFound(new { message = $"Restaurant with subdomain '{subdomain}' not found" });
                }

                return Ok(restaurant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting restaurant by subdomain {subdomain}");
                return StatusCode(500, new { message = "Error retrieving restaurant" });
            }
        }

        /// <summary>
        /// Create a new restaurant (SuperAdmin only)
        /// </summary>
        [HttpPost]
        [Authorize] // Should have SuperAdmin role check
        public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var restaurant = await _restaurantService.CreateRestaurantAsync(dto);
                return CreatedAtAction(
                    nameof(GetRestaurantById),
                    new { id = restaurant.Id },
                    restaurant
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating restaurant");
                return StatusCode(500, new { message = "Error creating restaurant" });
            }
        }

        /// <summary>
        /// Update restaurant information
        /// </summary>
        [HttpPut("{id}")]
        [Authorize] // Admin or SuperAdmin
        public async Task<IActionResult> UpdateRestaurant(int id, [FromBody] UpdateRestaurantDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var restaurant = await _restaurantService.UpdateRestaurantAsync(id, dto);

                if (restaurant == null)
                {
                    return NotFound(new { message = $"Restaurant {id} not found" });
                }

                return Ok(restaurant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating restaurant {id}");
                return StatusCode(500, new { message = "Error updating restaurant" });
            }
        }

        /// <summary>
        /// Delete/deactivate restaurant (SuperAdmin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize] // Should have SuperAdmin role check
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            try
            {
                var success = await _restaurantService.DeleteRestaurantAsync(id);

                if (!success)
                {
                    return NotFound(new { message = $"Restaurant {id} not found" });
                }

                return Ok(new { message = "Restaurant deactivated successfully", restaurantId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting restaurant {id}");
                return StatusCode(500, new { message = "Error deleting restaurant" });
            }
        }
    }
}
