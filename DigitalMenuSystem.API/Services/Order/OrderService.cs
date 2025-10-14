using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Order;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Order
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
        {
            // Validate table exists
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Id == dto.TableId && t.IsActive);

            if (table == null)
            {
                throw new ArgumentException("Table not found or inactive");
            }

            // Validate all menu items exist and calculate total
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.OrderItems)
            {
                var menuItem = await _context.MenuItems
                    .FirstOrDefaultAsync(m => m.Id == item.MenuItemId && m.IsAvailable);

                if (menuItem == null)
                {
                    throw new ArgumentException($"Menu item {item.MenuItemId} not found or unavailable");
                }

                var orderItem = new OrderItem
                {
                    MenuItemId = item.MenuItemId,
                    Quantity = item.Quantity,
                    UnitPrice = menuItem.Price,
                    SpecialInstructions = item.SpecialInstructions,
                    CreatedAt = DateTime.UtcNow
                };

                orderItems.Add(orderItem);
                totalAmount += menuItem.Price * item.Quantity;
            }

            // Create order
            var order = new Models.Order
            {
                TableId = dto.TableId,
                Status = "Received",
                TotalAmount = totalAmount,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Order {order.Id} created for table {table.TableNumber}");

            return await GetOrderByIdAsync(order.Id) ?? throw new Exception("Failed to retrieve created order");
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return null;

            return MapToDto(order);
        }

        public async Task<List<OrderDto>> GetOrdersByRestaurantAsync(int restaurantId)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.Table.RestaurantId == restaurantId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<List<OrderDto>> GetOrdersByTableAsync(int tableId)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.TableId == tableId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<List<OrderDto>> GetOrdersByStatusAsync(int restaurantId, string status)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.Table.RestaurantId == restaurantId && o.Status == status)
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<List<OrderDto>> GetActiveOrdersAsync(int restaurantId)
        {
            var activeStatuses = new[] { "Received", "Preparing", "Ready" };

            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.Table.RestaurantId == restaurantId && activeStatuses.Contains(o.Status))
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<bool> UpdateOrderStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return false;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Order {id} status updated to {status}");

            return true;
        }

        private static OrderDto MapToDto(Models.Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                TableId = order.TableId,
                TableNumber = order.Table.TableNumber,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    MenuItemName = oi.MenuItem.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SpecialInstructions = oi.SpecialInstructions
                }).ToList()
            };
        }
    }
}
