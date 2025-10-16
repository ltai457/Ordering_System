using DigitalMenuSystem.API.DTOs.Table;

namespace DigitalMenuSystem.API.Services.Table
{
    public interface ITableService
    {
        Task<TableDto> CreateTableAsync(CreateTableDto dto);
        Task<TableDto?> GetTableByIdAsync(int id);
        Task<TableDto?> GetTableByCodeAsync(string tableCode);
        Task<TableDto?> GetTableByNumberAsync(int restaurantId, string tableNumber);
        Task<List<TableDto>> GetTablesByRestaurantAsync(int restaurantId);
        Task<TableDto?> UpdateTableAsync(int id, UpdateTableDto dto);
        Task<bool> DeleteTableAsync(int id);
        string GenerateQrCodeUrl(int tableId, string tableCode, int restaurantId);
    }
}
