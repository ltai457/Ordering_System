using DigitalMenuSystem.API.DTOs.Order;

namespace DigitalMenuSystem.API.Services.Order
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
        Task<OrderDto?> GetOrderByIdAsync(int id);
        Task<List<OrderDto>> GetOrdersByRestaurantAsync(int restaurantId);
        Task<List<OrderDto>> GetOrdersByTableAsync(int tableId);
        Task<List<OrderDto>> GetOrdersByStatusAsync(int restaurantId, string status);
        Task<List<OrderDto>> GetActiveOrdersAsync(int restaurantId);
        Task<bool> UpdateOrderStatusAsync(int id, string status);
    }
}
