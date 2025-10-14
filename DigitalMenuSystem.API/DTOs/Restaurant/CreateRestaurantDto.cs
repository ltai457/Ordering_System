using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Restaurant
{
    /// <summary>
    /// DTO for creating a new restaurant
    /// </summary>
    public class CreateRestaurantDto
    {
        [Required]
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100, ErrorMessage = "Subdomain cannot exceed 100 characters")]
        [RegularExpression("^[a-z0-9-]+$", ErrorMessage = "Subdomain can only contain lowercase letters, numbers, and hyphens")]
        public string Subdomain { get; set; } = string.Empty;

        public string? Logo { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
    }
}
