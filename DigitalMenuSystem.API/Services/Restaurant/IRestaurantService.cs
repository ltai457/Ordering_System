using DigitalMenuSystem.API.DTOs.Restaurant;

namespace DigitalMenuSystem.API.Services.Restaurant
{
    public interface IRestaurantService
    {
        Task<RestaurantDto> CreateRestaurantAsync(CreateRestaurantDto dto);
        Task<RestaurantDto?> GetRestaurantByIdAsync(int id);
        Task<RestaurantDto?> GetRestaurantBySubdomainAsync(string subdomain);
        Task<List<RestaurantDto>> GetAllRestaurantsAsync();
        Task<RestaurantDto?> UpdateRestaurantAsync(int id, UpdateRestaurantDto dto);
        Task<bool> DeleteRestaurantAsync(int id);
    }
}
