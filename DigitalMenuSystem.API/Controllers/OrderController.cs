using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Order;
using DigitalMenuSystem.API.Services.Order;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(IOrderService orderService, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new order (from customer app - no auth required)
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var order = await _orderService.CreateOrderAsync(dto);
                return CreatedAtAction(
                    nameof(GetOrderById),
                    new { id = order.Id },
                    order
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "Error creating order" });
            }
        }

        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdAsync(id);

                if (order == null)
                {
                    return NotFound(new { message = $"Order {id} not found" });
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting order {id}");
                return StatusCode(500, new { message = "Error retrieving order" });
            }
        }

        /// <summary>
        /// Get all orders for a restaurant
        /// </summary>
        [HttpGet("restaurant/{restaurantId}")]
        [Authorize] // Staff only
        public async Task<IActionResult> GetOrdersByRestaurant(int restaurantId)
        {
            try
            {
                var orders = await _orderService.GetOrdersByRestaurantAsync(restaurantId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving orders" });
            }
        }

        /// <summary>
        /// Get orders by table
        /// </summary>
        [HttpGet("table/{tableId}")]
        [Authorize]
        public async Task<IActionResult> GetOrdersByTable(int tableId)
        {
            try
            {
                var orders = await _orderService.GetOrdersByTableAsync(tableId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders for table {tableId}");
                return StatusCode(500, new { message = "Error retrieving orders" });
            }
        }

        /// <summary>
        /// Get orders by status (for kitchen display)
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/status/{status}")]
        [Authorize]
        public async Task<IActionResult> GetOrdersByStatus(int restaurantId, string status)
        {
            try
            {
                var orders = await _orderService.GetOrdersByStatusAsync(restaurantId, status);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders with status {status}");
                return StatusCode(500, new { message = "Error retrieving orders" });
            }
        }

        /// <summary>
        /// Get all active orders (not served or cancelled) for a restaurant
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/active")]
        [Authorize]
        public async Task<IActionResult> GetActiveOrders(int restaurantId)
        {
            try
            {
                var orders = await _orderService.GetActiveOrdersAsync(restaurantId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting active orders for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving active orders" });
            }
        }

        /// <summary>
        /// Update order status (kitchen/staff)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var success = await _orderService.UpdateOrderStatusAsync(id, dto.Status);

                if (!success)
                {
                    return NotFound(new { message = $"Order {id} not found" });
                }

                return Ok(new { message = "Order status updated successfully", orderId = id, status = dto.Status });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating order {id} status");
                return StatusCode(500, new { message = "Error updating order status" });
            }
        }
    }
}
