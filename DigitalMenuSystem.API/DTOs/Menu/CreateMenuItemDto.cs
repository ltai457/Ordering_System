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
        
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 10000, ErrorMessage = "Price must be between 0.01 and 10000")]
        public decimal Price { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [StringLength(200, ErrorMessage = "Dietary info cannot exceed 200 characters")]
        public string? DietaryInfo { get; set; }
        
        [Range(0, 1000, ErrorMessage = "Display order must be between 0 and 1000")]
        public int DisplayOrder { get; set; } = 0;
    }
}