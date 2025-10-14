using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Table
{
    /// <summary>
    /// DTO for creating a new table
    /// </summary>
    public class CreateTableDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [StringLength(20, ErrorMessage = "Table number cannot exceed 20 characters")]
        public string TableNumber { get; set; } = string.Empty;

        [Range(1, 50, ErrorMessage = "Capacity must be between 1 and 50")]
        public int Capacity { get; set; } = 4;

        [StringLength(100)]
        public string? Location { get; set; }
    }
}
