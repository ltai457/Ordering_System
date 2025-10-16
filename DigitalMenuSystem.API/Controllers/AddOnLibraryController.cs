using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.Models;
using DigitalMenuSystem.API.DTOs.AddOnLibrary;

namespace DigitalMenuSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AddOnLibraryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AddOnLibraryController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/AddOnLibrary/restaurant/{restaurantId}
    [HttpGet("restaurant/{restaurantId}")]
    public async Task<ActionResult<IEnumerable<AddOnLibraryDto>>> GetByRestaurant(int restaurantId, [FromQuery] string? category = null, [FromQuery] bool? isActive = null)
    {
        var query = _context.AddOnLibrary.Where(x => x.RestaurantId == restaurantId);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(x => x.Category == category);
        }

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        var items = await query
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .Select(x => new AddOnLibraryDto
            {
                Id = x.Id,
                RestaurantId = x.RestaurantId,
                Name = x.Name,
                DefaultPrice = x.DefaultPrice,
                Category = x.Category,
                IsActive = x.IsActive
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET: api/AddOnLibrary/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<AddOnLibraryDto>> GetById(int id)
    {
        var item = await _context.AddOnLibrary
            .Where(x => x.Id == id)
            .Select(x => new AddOnLibraryDto
            {
                Id = x.Id,
                RestaurantId = x.RestaurantId,
                Name = x.Name,
                DefaultPrice = x.DefaultPrice,
                Category = x.Category,
                IsActive = x.IsActive
            })
            .FirstOrDefaultAsync();

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    // POST: api/AddOnLibrary/restaurant/{restaurantId}
    [HttpPost("restaurant/{restaurantId}")]
    public async Task<ActionResult<AddOnLibraryDto>> Create(int restaurantId, CreateAddOnLibraryDto dto)
    {
        var item = new AddOnLibrary
        {
            RestaurantId = restaurantId,
            Name = dto.Name,
            DefaultPrice = dto.DefaultPrice,
            Category = dto.Category,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.AddOnLibrary.Add(item);
        await _context.SaveChangesAsync();

        var result = new AddOnLibraryDto
        {
            Id = item.Id,
            RestaurantId = item.RestaurantId,
            Name = item.Name,
            DefaultPrice = item.DefaultPrice,
            Category = item.Category,
            IsActive = item.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, result);
    }

    // PUT: api/AddOnLibrary/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAddOnLibraryDto dto)
    {
        var item = await _context.AddOnLibrary.FindAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(dto.Name))
        {
            item.Name = dto.Name;
        }

        if (dto.DefaultPrice.HasValue)
        {
            item.DefaultPrice = dto.DefaultPrice.Value;
        }

        if (dto.Category != null)
        {
            item.Category = dto.Category;
        }

        if (dto.IsActive.HasValue)
        {
            item.IsActive = dto.IsActive.Value;
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/AddOnLibrary/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.AddOnLibrary.FindAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        _context.AddOnLibrary.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/AddOnLibrary/restaurant/{restaurantId}/categories
    [HttpGet("restaurant/{restaurantId}/categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories(int restaurantId)
    {
        var categories = await _context.AddOnLibrary
            .Where(x => x.RestaurantId == restaurantId && !string.IsNullOrEmpty(x.Category))
            .Select(x => x.Category!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return Ok(categories);
    }
}
