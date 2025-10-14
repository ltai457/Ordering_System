namespace DigitalMenuSystem.API.DTOs.Order
{
    /// <summary>
    /// Order Item response DTO
    /// </summary>
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
        public string? SpecialInstructions { get; set; }
    }
}
