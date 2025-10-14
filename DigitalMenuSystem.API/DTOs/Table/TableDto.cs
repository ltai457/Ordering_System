namespace DigitalMenuSystem.API.DTOs.Table
{
    /// <summary>
    /// Table response DTO
    /// </summary>
    public class TableDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public string TableCode { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // QR Code URL for customer scanning
        public string QrCodeUrl { get; set; } = string.Empty;
    }
}
