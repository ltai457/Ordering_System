namespace DigitalMenuSystem.API.DTOs.Menu;

public class MenuItemAddOnDto
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }

    // Legacy field (kept for backward compatibility)
    public string Name { get; set; } = string.Empty;

    // Multi-language names
    public string? NameKH { get; set; } // Khmer name
    public string? NameEN { get; set; } // English name
    public string? NameCN { get; set; } // Chinese name

    // Legacy field (kept for backward compatibility)
    public decimal Price { get; set; }

    // Dual currency prices
    public decimal PriceUSD { get; set; } // Price in US Dollars
    public decimal PriceKHR { get; set; } // Price in Cambodian Riel

    public bool IsAvailable { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateMenuItemAddOnDto
{
    public string Name { get; set; } = string.Empty;

    // Multi-language names
    public string? NameKH { get; set; } // Khmer name
    public string? NameEN { get; set; } // English name
    public string? NameCN { get; set; } // Chinese name

    public decimal Price { get; set; }

    // Dual currency prices
    public decimal PriceUSD { get; set; } // Price in US Dollars
    public decimal PriceKHR { get; set; } // Price in Cambodian Riel

    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateMenuItemAddOnDto
{
    public string? Name { get; set; }

    // Multi-language names
    public string? NameKH { get; set; } // Khmer name
    public string? NameEN { get; set; } // English name
    public string? NameCN { get; set; } // Chinese name

    public decimal? Price { get; set; }

    // Dual currency prices
    public decimal? PriceUSD { get; set; } // Price in US Dollars
    public decimal? PriceKHR { get; set; } // Price in Cambodian Riel

    public bool? IsAvailable { get; set; }
    public int? DisplayOrder { get; set; }
}
