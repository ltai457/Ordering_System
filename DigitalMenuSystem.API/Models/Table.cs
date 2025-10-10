using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.Models
{
    public class Table
    {
        public int Id { get; set; }
        
        // Multi-tenant: Each table belongs to a restaurant
        public int RestaurantId { get; set; }
        public Restaurant Restaurant { get; set; } = null!;
        
        [Required]
        [StringLength(20)]
        public string TableNumber { get; set; } = string.Empty; // e.g., "T1", "T2", "A5"
        
        [Required]
        [StringLength(50)]
        public string TableCode { get; set; } = string.Empty; // Unique code for QR (e.g., "TBL-ABC123")
        
        public int Capacity { get; set; } // Number of seats
        
        public string? Location { get; set; } // e.g., "Window Side", "Patio"
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}