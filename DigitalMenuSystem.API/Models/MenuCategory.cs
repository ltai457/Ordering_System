using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.Models
{
    public class MenuCategory
    {
        public int Id { get; set; }
        
        // Multi-tenant
        public int RestaurantId { get; set; }
        public Restaurant Restaurant { get; set; } = null!;
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty; // e.g., "Appetizers", "Main Course"
        
        public string? Description { get; set; }
        
        public string? ImageUrl { get; set; } // Optional category image from S3
        
        public int DisplayOrder { get; set; } // For sorting categories
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }
}