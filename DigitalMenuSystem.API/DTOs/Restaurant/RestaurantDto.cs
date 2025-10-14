namespace DigitalMenuSystem.API.DTOs.Restaurant
{
    /// <summary>
    /// Restaurant response DTO
    /// </summary>
    public class RestaurantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Additional info
        public int TotalTables { get; set; }
        public int TotalMenuItems { get; set; }
    }
}
