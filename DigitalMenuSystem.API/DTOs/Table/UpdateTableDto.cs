using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Table
{
    /// <summary>
    /// DTO for updating table information
    /// </summary>
    public class UpdateTableDto
    {
        [StringLength(20, ErrorMessage = "Table number cannot exceed 20 characters")]
        public string? TableNumber { get; set; }

        [Range(1, 50, ErrorMessage = "Capacity must be between 1 and 50")]
        public int? Capacity { get; set; }

        [StringLength(100)]
        public string? Location { get; set; }

        public bool? IsActive { get; set; }
    }
}
