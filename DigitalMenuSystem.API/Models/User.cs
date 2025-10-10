using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        // Foreign Keys
        public int RestaurantId { get; set; }
        public Restaurant Restaurant { get; set; } = null!;
        
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}