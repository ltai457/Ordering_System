namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// Menu Item response DTO
    /// </summary>
    public class MenuItemDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        // Legacy field (kept for backward compatibility)
        public string Name { get; set; } = string.Empty;

        // Multi-language names
        public string? NameKH { get; set; } // Khmer name
        public string? NameEN { get; set; } // English name
        public string? NameCN { get; set; } // Chinese name

        public string? Description { get; set; }

        // Legacy field (kept for backward compatibility)
        public decimal Price { get; set; }

        // Dual currency prices
        public decimal PriceUSD { get; set; } // Price in US Dollars
        public decimal PriceKHR { get; set; } // Price in Cambodian Riel

        public string? ImageUrl { get; set; }
        public string? DietaryInfo { get; set; }
        public bool IsAvailable { get; set; }
        public int DisplayOrder { get; set; }
        public string PreparationArea { get; set; } = "Kitchen"; // Kitchen or FrontOfHouse
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<MenuItemAddOnDto> AddOns { get; set; } = new List<MenuItemAddOnDto>();
    }
}