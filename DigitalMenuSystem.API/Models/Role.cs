using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.Models
{
    public class Role
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty; // "SuperAdmin", "Admin", "Chef", "FrontOfHouse"
        
        public string? Description { get; set; }
        
        // Permissions
        public bool CanManageMenu { get; set; } = false;
        public bool CanManageOrders { get; set; } = false;
        public bool CanManageUsers { get; set; } = false;
        public bool CanManageTables { get; set; } = false;
        public bool CanViewReports { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}