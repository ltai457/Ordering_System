using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalMenuSystem.API.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        // Foreign Key to Table
        public int TableId { get; set; }
        public Table Table { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Received"; // "Received", "Preparing", "Ready", "Served", "Cancelled"
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }
        
        public string? Notes { get; set; } // Special instructions for entire order
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}