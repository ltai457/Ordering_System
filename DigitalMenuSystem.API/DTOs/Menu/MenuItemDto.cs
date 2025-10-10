namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// Menu Item response DTO
    /// </summary>
    public class MenuItemDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? DietaryInfo { get; set; }
        public bool IsAvailable { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}