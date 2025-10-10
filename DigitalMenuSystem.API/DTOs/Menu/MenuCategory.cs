namespace DigitalMenuSystem.API.DTOs.Menu
{
    /// <summary>
    /// Menu Category response DTO
    /// </summary>
    public class MenuCategoryDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Related items count
        public int ItemCount { get; set; }
    }
}