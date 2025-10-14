using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Table;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Table
{
    public class TableService : ITableService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TableService> _logger;
        private readonly IConfiguration _configuration;

        public TableService(
            ApplicationDbContext context,
            ILogger<TableService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<TableDto> CreateTableAsync(CreateTableDto dto)
        {
            // Validate restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
            if (restaurant == null)
            {
                throw new ArgumentException("Restaurant not found");
            }

            // Check if table number already exists for this restaurant
            var exists = await _context.Tables
                .AnyAsync(t => t.RestaurantId == dto.RestaurantId && t.TableNumber == dto.TableNumber);

            if (exists)
            {
                throw new ArgumentException($"Table number {dto.TableNumber} already exists for this restaurant");
            }

            // Generate unique table code
            var tableCode = GenerateUniqueTableCode();

            var table = new Models.Table
            {
                RestaurantId = dto.RestaurantId,
                TableNumber = dto.TableNumber,
                TableCode = tableCode,
                Capacity = dto.Capacity,
                Location = dto.Location,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tables.Add(table);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Table {table.TableNumber} created for restaurant {dto.RestaurantId}");

            return MapToDto(table);
        }

        public async Task<TableDto?> GetTableByIdAsync(int id)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Id == id);

            return table == null ? null : MapToDto(table);
        }

        public async Task<TableDto?> GetTableByCodeAsync(string tableCode)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.TableCode == tableCode);

            return table == null ? null : MapToDto(table);
        }

        public async Task<List<TableDto>> GetTablesByRestaurantAsync(int restaurantId)
        {
            var tables = await _context.Tables
                .Where(t => t.RestaurantId == restaurantId)
                .OrderBy(t => t.TableNumber)
                .ToListAsync();

            return tables.Select(MapToDto).ToList();
        }

        public async Task<TableDto?> UpdateTableAsync(int id, UpdateTableDto dto)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return null;

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.TableNumber))
            {
                // Check if new table number already exists for this restaurant
                var exists = await _context.Tables
                    .AnyAsync(t => t.RestaurantId == table.RestaurantId &&
                                   t.TableNumber == dto.TableNumber &&
                                   t.Id != id);

                if (exists)
                {
                    throw new ArgumentException($"Table number {dto.TableNumber} already exists");
                }

                table.TableNumber = dto.TableNumber;
            }

            if (dto.Capacity.HasValue)
                table.Capacity = dto.Capacity.Value;

            if (dto.Location != null)
                table.Location = dto.Location;

            if (dto.IsActive.HasValue)
                table.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Table {id} updated");

            return MapToDto(table);
        }

        public async Task<bool> DeleteTableAsync(int id)
        {
            var table = await _context.Tables.FindAsync(id);
            if (table == null) return false;

            // Check if table has any orders
            var hasOrders = await _context.Orders.AnyAsync(o => o.TableId == id);

            if (hasOrders)
            {
                // Soft delete - deactivate instead of removing
                table.IsActive = false;
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Table {id} deactivated (has existing orders)");
            }
            else
            {
                // Hard delete if no orders
                _context.Tables.Remove(table);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Table {id} deleted");
            }

            return true;
        }

        public string GenerateQrCodeUrl(int tableId, string tableCode, int restaurantId)
        {
            // Get base URL from configuration (customer app URL)
            var customerAppUrl = _configuration["CustomerAppUrl"] ?? "http://localhost:5173";

            // Generate URL with table code and restaurant ID
            return $"{customerAppUrl}?restaurantId={restaurantId}&tableCode={tableCode}";
        }

        private string GenerateUniqueTableCode()
        {
            // Generate a unique 8-character code
            return Guid.NewGuid().ToString("N")[..8].ToUpper();
        }

        private TableDto MapToDto(Models.Table table)
        {
            return new TableDto
            {
                Id = table.Id,
                RestaurantId = table.RestaurantId,
                TableNumber = table.TableNumber,
                TableCode = table.TableCode,
                Capacity = table.Capacity,
                Location = table.Location,
                IsActive = table.IsActive,
                CreatedAt = table.CreatedAt,
                QrCodeUrl = GenerateQrCodeUrl(table.Id, table.TableCode, table.RestaurantId)
            };
        }
    }
}
