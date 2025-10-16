namespace DigitalMenuSystem.API.DTOs.Menu;

public class MenuItemAddOnDto
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateMenuItemAddOnDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateMenuItemAddOnDto
{
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public bool? IsAvailable { get; set; }
    public int? DisplayOrder { get; set; }
}
