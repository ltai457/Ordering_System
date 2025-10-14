namespace DigitalMenuSystem.API.DTOs.Order
{
    /// <summary>
    /// Order response DTO
    /// </summary>
    public class OrderDto
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }
}
