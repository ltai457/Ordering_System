using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// DTO for reordering menu categories
    /// </summary>
    public class ReorderCategoriesDto
    {
        [Required(ErrorMessage = "Category IDs array is required")]
        [MinLength(1, ErrorMessage = "At least one category ID is required")]
        public int[] CategoryIds { get; set; } = Array.Empty<int>();
    }
}
