using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalMenuSystem.API.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty; // e.g., "Margherita Pizza"
        
        public string? Description { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        
        public string? ImageUrl { get; set; } // S3 URL for food image
        
        public string? DietaryInfo { get; set; } // e.g., "Vegetarian, Gluten-Free, Vegan"
        
        public bool IsAvailable { get; set; } = true; // Can be marked unavailable (out of stock)
        
        public int DisplayOrder { get; set; } // For sorting items within category
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Foreign Key
        public int CategoryId { get; set; }
        public MenuCategory Category { get; set; } = null!;
        
        // Navigation property
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}