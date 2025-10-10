using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Auth
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password is required")]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;
    }
}