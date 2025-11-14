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

            // Check if there's an existing unpaid order for this table
            var existingOrder = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.TableId == dto.TableId &&
                                          (o.Status == "Pending" || o.Status == "Accepted"));

            // Validate all menu items exist and calculate new items total
            decimal newItemsTotal = 0;
            var newOrderItems = new List<OrderItem>();

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
                    CreatedAt = DateTime.UtcNow,
                    BatchNumber = existingOrder != null ? existingOrder.CurrentBatch + 1 : 1
                };

                newOrderItems.Add(orderItem);
                newItemsTotal += menuItem.Price * item.Quantity;
            }

            if (existingOrder != null)
            {
                // Add items to existing order
                var oldTotal = existingOrder.TotalAmount;
                existingOrder.CurrentBatch++;
                foreach (var item in newOrderItems)
                {
                    existingOrder.OrderItems.Add(item);
                }
                existingOrder.TotalAmount += newItemsTotal;
                existingOrder.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation($"Order {existingOrder.Id} - Old Total: ${oldTotal}, New Items Total: ${newItemsTotal}, New Total: ${existingOrder.TotalAmount}");

                // If order was already Accepted, move it back to Pending (needs re-acceptance)
                if (existingOrder.Status == "Accepted")
                {
                    existingOrder.Status = "Pending";
                    _logger.LogInformation($"Order {existingOrder.Id} has new items added - status changed back to Pending");
                }

                // Mark entity as modified to ensure EF tracks the change
                _context.Entry(existingOrder).State = EntityState.Modified;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Added {newOrderItems.Count} items to existing order {existingOrder.Id} (batch {existingOrder.CurrentBatch})");

                return await GetOrderByIdAsync(existingOrder.Id) ?? throw new Exception("Failed to retrieve order");
            }
            else
            {
                // Create new order
                var order = new Models.Order
                {
                    TableId = dto.TableId,
                    Status = "Pending",
                    TotalAmount = newItemsTotal,
                    Notes = dto.Notes,
                    CurrentBatch = 1,
                    CreatedAt = DateTime.UtcNow,
                    OrderItems = newOrderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Order {order.Id} created for table {table.TableNumber}");

                return await GetOrderByIdAsync(order.Id) ?? throw new Exception("Failed to retrieve created order");
            }
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
            var activeStatuses = new[] { "Pending", "Accepted" };

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

        public async Task<bool> AcceptOrderAsync(int id, string staffName)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.Status != "Pending")
                return false;

            order.Status = "Accepted";
            order.LastBatchAcceptedAt = DateTime.UtcNow;

            // Set AcceptedAt only the first time
            if (order.AcceptedAt == null)
            {
                order.AcceptedAt = DateTime.UtcNow;
                order.AcceptedBy = staffName;
            }

            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Order {id} batch {order.CurrentBatch} accepted by {staffName}");

            return true;
        }

        public async Task<bool> MarkOrderAsPaidAsync(int id, string staffName)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.Status != "Accepted")
                return false;

            order.Status = "Paid";
            order.PaidAt = DateTime.UtcNow;
            order.PaidBy = staffName;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Order {id} marked as paid by {staffName}");

            return true;
        }

        public async Task<List<OrderDto>> GetTodayPaidOrdersAsync(int restaurantId)
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.Table.RestaurantId == restaurantId
                    && o.Status == "Paid"
                    && o.PaidAt >= today
                    && o.PaidAt < tomorrow)
                .OrderByDescending(o => o.PaidAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        private static OrderDto MapToDto(Models.Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                TableId = order.TableId,
                TableNumber = order.Table.TableNumber,
                TableCode = order.Table.TableCode,
                TableLocation = order.Table.Location,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Notes = order.Notes,
                CurrentBatch = order.CurrentBatch,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                AcceptedAt = order.AcceptedAt,
                LastBatchAcceptedAt = order.LastBatchAcceptedAt,
                PaidAt = order.PaidAt,
                AcceptedBy = order.AcceptedBy,
                PaidBy = order.PaidBy,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    MenuItemId = oi.MenuItemId,
                    MenuItemName = oi.MenuItem.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SpecialInstructions = oi.SpecialInstructions,
                    BatchNumber = oi.BatchNumber,
                    PreparationArea = oi.MenuItem.PreparationArea
                }).ToList()
            };
        }
    }
}
