using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.Models
{
    public class Restaurant
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string Subdomain { get; set; } = string.Empty; // e.g., "pizzapalace"
        
        public string? Logo { get; set; } // S3 URL
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        
        // Subscription info
        public bool IsActive { get; set; } = true;
        public DateTime SubscriptionStart { get; set; } = DateTime.UtcNow;
        public DateTime? SubscriptionEnd { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public ICollection<Table> Tables { get; set; } = new List<Table>();
        public ICollection<MenuCategory> MenuCategories { get; set; } = new List<MenuCategory>();
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}