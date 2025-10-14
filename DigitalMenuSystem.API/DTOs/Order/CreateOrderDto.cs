using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Order
{
    /// <summary>
    /// DTO for creating a new order from customer app
    /// </summary>
    public class CreateOrderDto
    {
        [Required]
        public int TableId { get; set; }

        public string? Notes { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Order must contain at least one item")]
        public List<CreateOrderItemDto> OrderItems { get; set; } = new();
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int MenuItemId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100")]
        public int Quantity { get; set; }

        public string? SpecialInstructions { get; set; }
    }
}
