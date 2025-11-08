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
        public string Status { get; set; } = "Pending"; // "Pending", "Accepted", "Paid", "Cancelled"

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        public string? Notes { get; set; } // Special instructions for entire order

        public int CurrentBatch { get; set; } = 1; // Track current batch number for merged orders

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; } // When till person accepts order (first time)
        public DateTime? LastBatchAcceptedAt { get; set; } // When latest batch was accepted
        public DateTime? PaidAt { get; set; } // When cashier marks as paid
        public string? AcceptedBy { get; set; } // Staff member who accepted
        public string? PaidBy { get; set; } // Staff member who processed payment
        
        // Navigation property
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}