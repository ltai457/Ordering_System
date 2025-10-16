using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.Models;
using DigitalMenuSystem.API.DTOs.Menu;

namespace DigitalMenuSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemAddOnController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MenuItemAddOnController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/MenuItemAddOn/menu-item/{menuItemId}
    [HttpGet("menu-item/{menuItemId}")]
    public async Task<ActionResult<IEnumerable<MenuItemAddOnDto>>> GetAddOnsByMenuItem(int menuItemId)
    {
        var addOns = await _context.MenuItemAddOns
            .Where(a => a.MenuItemId == menuItemId)
            .OrderBy(a => a.DisplayOrder)
            .Select(a => new MenuItemAddOnDto
            {
                Id = a.Id,
                MenuItemId = a.MenuItemId,
                Name = a.Name,
                Price = a.Price,
                IsAvailable = a.IsAvailable,
                DisplayOrder = a.DisplayOrder
            })
            .ToListAsync();

        return Ok(addOns);
    }

    // GET: api/MenuItemAddOn/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<MenuItemAddOnDto>> GetAddOn(int id)
    {
        var addOn = await _context.MenuItemAddOns.FindAsync(id);

        if (addOn == null)
        {
            return NotFound();
        }

        return Ok(new MenuItemAddOnDto
        {
            Id = addOn.Id,
            MenuItemId = addOn.MenuItemId,
            Name = addOn.Name,
            Price = addOn.Price,
            IsAvailable = addOn.IsAvailable,
            DisplayOrder = addOn.DisplayOrder
        });
    }

    // POST: api/MenuItemAddOn/menu-item/{menuItemId}
    [HttpPost("menu-item/{menuItemId}")]
    public async Task<ActionResult<MenuItemAddOnDto>> CreateAddOn(int menuItemId, CreateMenuItemAddOnDto dto)
    {
        // Verify menu item exists
        var menuItem = await _context.MenuItems.FindAsync(menuItemId);
        if (menuItem == null)
        {
            return NotFound($"Menu item with ID {menuItemId} not found");
        }

        var addOn = new MenuItemAddOn
        {
            MenuItemId = menuItemId,
            Name = dto.Name,
            Price = dto.Price,
            IsAvailable = dto.IsAvailable,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.MenuItemAddOns.Add(addOn);
        await _context.SaveChangesAsync();

        var result = new MenuItemAddOnDto
        {
            Id = addOn.Id,
            MenuItemId = addOn.MenuItemId,
            Name = addOn.Name,
            Price = addOn.Price,
            IsAvailable = addOn.IsAvailable,
            DisplayOrder = addOn.DisplayOrder
        };

        return CreatedAtAction(nameof(GetAddOn), new { id = addOn.Id }, result);
    }

    // PUT: api/MenuItemAddOn/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddOn(int id, UpdateMenuItemAddOnDto dto)
    {
        var addOn = await _context.MenuItemAddOns.FindAsync(id);

        if (addOn == null)
        {
            return NotFound();
        }

        if (dto.Name != null) addOn.Name = dto.Name;
        if (dto.Price.HasValue) addOn.Price = dto.Price.Value;
        if (dto.IsAvailable.HasValue) addOn.IsAvailable = dto.IsAvailable.Value;
        if (dto.DisplayOrder.HasValue) addOn.DisplayOrder = dto.DisplayOrder.Value;

        addOn.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.MenuItemAddOns.AnyAsync(e => e.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/MenuItemAddOn/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddOn(int id)
    {
        var addOn = await _context.MenuItemAddOns.FindAsync(id);
        if (addOn == null)
        {
            return NotFound();
        }

        _context.MenuItemAddOns.Remove(addOn);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
