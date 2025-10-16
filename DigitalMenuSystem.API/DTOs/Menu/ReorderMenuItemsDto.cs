using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// DTO for reordering menu items
    /// </summary>
    public class ReorderMenuItemsDto
    {
        [Required(ErrorMessage = "Menu item IDs array is required")]
        [MinLength(1, ErrorMessage = "At least one menu item ID is required")]
        public int[] MenuItemIds { get; set; } = Array.Empty<int>();
    }
}
