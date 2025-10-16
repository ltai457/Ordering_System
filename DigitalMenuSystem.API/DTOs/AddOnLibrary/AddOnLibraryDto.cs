namespace DigitalMenuSystem.API.DTOs.AddOnLibrary;

public class AddOnLibraryDto
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DefaultPrice { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
}

public class CreateAddOnLibraryDto
{
    public string Name { get; set; } = string.Empty;
    public decimal DefaultPrice { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateAddOnLibraryDto
{
    public string? Name { get; set; }
    public decimal? DefaultPrice { get; set; }
    public string? Category { get; set; }
    public bool? IsActive { get; set; }
}
