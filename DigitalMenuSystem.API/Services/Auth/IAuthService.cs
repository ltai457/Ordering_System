using System.Threading.Tasks;
using DigitalMenuSystem.API.DTOs.Auth;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Auth
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
        Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<UserInfoDto?> GetUserInfoAsync(int userId);
        Task<bool> UsernameExistsAsync(string username);
    }
}