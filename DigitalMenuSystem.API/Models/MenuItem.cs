using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalMenuSystem.API.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty; // Default/primary name (kept for backward compatibility)
        
        // Multi-language names
        [StringLength(200)]
        public string? NameKH { get; set; } // Khmer name
        
        [StringLength(200)]
        public string? NameEN { get; set; } // English name
        
        [StringLength(200)]
        public string? NameCN { get; set; } // Chinese name
        
        public string? Description { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; } // Default/primary price (kept for backward compatibility)
        
        // Dual currency prices
        [Column(TypeName = "decimal(10,2)")]
        public decimal PriceUSD { get; set; } // Price in US Dollars
        
        [Column(TypeName = "decimal(12,2)")]
        public decimal PriceKHR { get; set; } // Price in Cambodian Riel
        
        public string? ImageUrl { get; set; } // S3 URL for food image
        
        public string? DietaryInfo { get; set; } // e.g., "Vegetarian, Gluten-Free, Vegan"
        
        public bool IsAvailable { get; set; } = true; // Can be marked unavailable (out of stock)
        
        public int DisplayOrder { get; set; } // For sorting items within category

        [StringLength(50)]
        public string PreparationArea { get; set; } = "Kitchen"; // Kitchen or FrontOfHouse

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Foreign Key
        public int CategoryId { get; set; }
        public MenuCategory Category { get; set; } = null!;
        
        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<MenuItemAddOn> AddOns { get; set; } = new List<MenuItemAddOn>();
    }
}