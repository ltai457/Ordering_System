using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Auth;
using DigitalMenuSystem.API.Services.Auth;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Login endpoint for staff/admin users
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>JWT token and user info</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.LoginAsync(request);

                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid username or password" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Register new staff/admin user (protected endpoint)
        /// </summary>
        /// <param name="request">Registration details</param>
        /// <returns>Registration result</returns>
        [HttpPost("register")]
        [Authorize] // Only authenticated users can register new staff
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.RegisterAsync(request);

                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        /// <summary>
        /// Get current authenticated user's information
        /// </summary>
        /// <returns>User info with permissions</returns>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                // Get userId from JWT claims
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var userInfo = await _authService.GetUserInfoAsync(userId);

                if (userInfo == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user info");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Check if username is available
        /// </summary>
        /// <param name="username">Username to check</param>
        /// <returns>Boolean indicating availability</returns>
        [HttpGet("check-username/{username}")]
        [Authorize]
        public async Task<IActionResult> CheckUsername(string username)
        {
            try
            {
                bool exists = await _authService.UsernameExistsAsync(username);
                return Ok(new { exists, available = !exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking username");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Test endpoint to verify API is working
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new { message = "Auth API is running", timestamp = DateTime.UtcNow });
        }
    }
}