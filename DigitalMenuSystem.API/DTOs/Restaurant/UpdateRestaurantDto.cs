using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Restaurant
{
    /// <summary>
    /// DTO for updating restaurant information
    /// </summary>
    public class UpdateRestaurantDto
    {
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
        public string? Name { get; set; }

        public string? Logo { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        public bool? IsActive { get; set; }
    }
}
