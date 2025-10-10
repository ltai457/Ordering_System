using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// DTO for updating an existing menu category
    /// </summary>
    public class UpdateMenuCategoryDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [Range(0, 1000, ErrorMessage = "Display order must be between 0 and 1000")]
        public int DisplayOrder { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}