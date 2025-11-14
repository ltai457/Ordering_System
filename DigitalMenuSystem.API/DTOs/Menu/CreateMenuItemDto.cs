using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// DTO for creating a new menu item
    /// </summary>
    public class CreateMenuItemDto
    {
        [Required(ErrorMessage = "Category ID is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Item name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public string Name { get; set; } = string.Empty;

        // Multi-language names
        [StringLength(200, ErrorMessage = "Khmer name cannot exceed 200 characters")]
        public string? NameKH { get; set; } // Khmer name

        [StringLength(200, ErrorMessage = "English name cannot exceed 200 characters")]
        public string? NameEN { get; set; } // English name

        [StringLength(200, ErrorMessage = "Chinese name cannot exceed 200 characters")]
        public string? NameCN { get; set; } // Chinese name

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 10000, ErrorMessage = "Price must be between 0.01 and 10000")]
        public decimal Price { get; set; }

        // Dual currency prices
        [Range(0.01, 10000, ErrorMessage = "USD price must be between 0.01 and 10000")]
        public decimal PriceUSD { get; set; } // Price in US Dollars

        [Range(0, 50000000, ErrorMessage = "KHR price must be between 0 and 50,000,000")]
        public decimal PriceKHR { get; set; } // Price in Cambodian Riel

        public string? ImageUrl { get; set; }

        [StringLength(200, ErrorMessage = "Dietary info cannot exceed 200 characters")]
        public string? DietaryInfo { get; set; }

        [Range(0, 1000, ErrorMessage = "Display order must be between 0 and 1000")]
        public int DisplayOrder { get; set; } = 0;

        [StringLength(50, ErrorMessage = "Preparation area cannot exceed 50 characters")]
        public string PreparationArea { get; set; } = "Kitchen"; // Kitchen or FrontOfHouse
    }
}