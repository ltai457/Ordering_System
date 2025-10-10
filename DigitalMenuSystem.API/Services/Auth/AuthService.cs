using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.DTOs.Auth;
using DigitalMenuSystem.API.Models;

namespace DigitalMenuSystem.API.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Find user by username with related data
            var user = await _context.Users
                .Include(u => u.Restaurant)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

            if (user == null)
            {
                return null; // User not found
            }

            // Verify password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return null; // Invalid password
            }

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                RestaurantId = user.RestaurantId,
                RestaurantName = user.Restaurant.Name,
                RoleName = user.Role.Name,
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Check if username already exists
            if (await UsernameExistsAsync(request.Username))
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = "Username already exists"
                };
            }

            // Check if restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
            if (restaurant == null)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = "Restaurant not found"
                };
            }

            // Check if role exists
            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
            {
                return new RegisterResponseDto
                {
                    Success = false,
                    Message = "Role not found"
                };
            }

            // Hash password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Username = request.Username,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = passwordHash,
                RestaurantId = request.RestaurantId,
                RoleId = request.RoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new RegisterResponseDto
            {
                Success = true,
                Message = "User registered successfully",
                UserId = user.Id
            };
        }

        public async Task<UserInfoDto?> GetUserInfoAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Restaurant)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
            {
                return null;
            }

            return new UserInfoDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                RestaurantId = user.RestaurantId,
                RestaurantName = user.Restaurant.Name,
                RoleId = user.RoleId,
                RoleName = user.Role.Name,
                CanManageMenu = user.Role.CanManageMenu,
                CanManageOrders = user.Role.CanManageOrders,
                CanManageUsers = user.Role.CanManageUsers,
                CanManageTables = user.Role.CanManageTables,
                CanViewReports = user.Role.CanViewReports
            };
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? throw new InvalidOperationException("JWT_SECRET not configured");
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "DigitalMenuSystem";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "DigitalMenuSystem";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim("fullName", user.FullName),
                new Claim("restaurantId", user.RestaurantId.ToString()),
                new Claim("roleId", user.RoleId.ToString()),
                new Claim("roleName", user.Role.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}