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

        /// <summary>
        /// Accept order (Till station) - changes status to Accepted and triggers print
        /// </summary>
        [HttpPost("{id}/accept")]
        [Authorize]
        public async Task<IActionResult> AcceptOrder(int id, [FromBody] AcceptOrderDto? dto = null)
        {
            try
            {
                var staffName = dto?.StaffName ?? "Till Staff";
                var success = await _orderService.AcceptOrderAsync(id, staffName);

                if (!success)
                {
                    return NotFound(new { message = $"Order {id} not found or already accepted" });
                }

                var order = await _orderService.GetOrderByIdAsync(id);
                return Ok(new
                {
                    message = "Order accepted successfully",
                    orderId = id,
                    status = "Accepted",
                    order = order,
                    printRequired = true // Signal to frontend to print
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error accepting order {id}");
                return StatusCode(500, new { message = "Error accepting order" });
            }
        }

        /// <summary>
        /// Mark order as paid (Cashier station)
        /// </summary>
        [HttpPost("{id}/mark-paid")]
        [Authorize]
        public async Task<IActionResult> MarkOrderAsPaid(int id, [FromBody] MarkPaidDto? dto = null)
        {
            try
            {
                var staffName = dto?.StaffName ?? "Cashier";
                var success = await _orderService.MarkOrderAsPaidAsync(id, staffName);

                if (!success)
                {
                    return NotFound(new { message = $"Order {id} not found or not in accepted status" });
                }

                var order = await _orderService.GetOrderByIdAsync(id);
                return Ok(new
                {
                    message = "Order marked as paid successfully",
                    orderId = id,
                    status = "Paid",
                    order = order,
                    printCustomerReceipt = true // Signal to print customer receipt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking order {id} as paid");
                return StatusCode(500, new { message = "Error marking order as paid" });
            }
        }

        /// <summary>
        /// Get pending orders (for Till view)
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/pending")]
        [Authorize]
        public async Task<IActionResult> GetPendingOrders(int restaurantId)
        {
            try
            {
                var orders = await _orderService.GetOrdersByStatusAsync(restaurantId, "Pending");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting pending orders for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving pending orders" });
            }
        }

        /// <summary>
        /// Get accepted orders awaiting payment (for Cashier view)
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/awaiting-payment")]
        [Authorize]
        public async Task<IActionResult> GetOrdersAwaitingPayment(int restaurantId)
        {
            try
            {
                var orders = await _orderService.GetOrdersByStatusAsync(restaurantId, "Accepted");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders awaiting payment for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving orders awaiting payment" });
            }
        }

        /// <summary>
        /// Get today's paid orders (for history view)
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/today-paid")]
        [Authorize]
        public async Task<IActionResult> GetTodayPaidOrders(int restaurantId)
        {
            try
            {
                var orders = await _orderService.GetTodayPaidOrdersAsync(restaurantId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting today's paid orders for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving today's paid orders" });
            }
        }
    }
}
