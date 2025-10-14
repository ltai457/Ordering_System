using System.ComponentModel.DataAnnotations;

namespace DigitalMenuSystem.API.DTOs.Order
{
    /// <summary>
    /// DTO for updating order status (used by kitchen/staff)
    /// </summary>
    public class UpdateOrderStatusDto
    {
        [Required]
        [RegularExpression("^(Received|Preparing|Ready|Served|Cancelled)$",
            ErrorMessage = "Status must be: Received, Preparing, Ready, Served, or Cancelled")]
        public string Status { get; set; } = string.Empty;
    }
}
