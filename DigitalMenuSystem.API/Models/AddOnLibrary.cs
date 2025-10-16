namespace DigitalMenuSystem.API.Models;

/// <summary>
/// Centralized library of add-ons that can be reused across multiple menu items
/// </summary>
public class AddOnLibrary
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DefaultPrice { get; set; }
    public string? Category { get; set; } // e.g., "Protein", "Vegetables", "Extras", "Sauces"
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Restaurant? Restaurant { get; set; }
}
