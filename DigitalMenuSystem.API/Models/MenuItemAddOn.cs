using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalMenuSystem.API.Models;

public class MenuItemAddOn
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }

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

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; } // Default/primary price (kept for backward compatibility)

    // Dual currency prices
    [Column(TypeName = "decimal(10,2)")]
    public decimal PriceUSD { get; set; } // Price in US Dollars

    [Column(TypeName = "decimal(12,2)")]
    public decimal PriceKHR { get; set; } // Price in Cambodian Riel

    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public MenuItem? MenuItem { get; set; }
}
