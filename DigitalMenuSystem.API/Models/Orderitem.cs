using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalMenuSystem.API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        // Foreign Key to Order
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        
        // Foreign Key to MenuItem
        public int MenuItemId { get; set; }
        public MenuItem MenuItem { get; set; } = null!;
        
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; } // Price at time of order (in case menu price changes later)
        
        public string? SpecialInstructions { get; set; } // e.g., "No onions", "Extra spicy"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}