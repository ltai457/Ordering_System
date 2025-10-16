using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.DTOs.Table;
using DigitalMenuSystem.API.Services.Table;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TableController : ControllerBase
    {
        private readonly ITableService _tableService;
        private readonly ILogger<TableController> _logger;

        public TableController(ITableService tableService, ILogger<TableController> logger)
        {
            _tableService = tableService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new table
        /// </summary>
        [HttpPost]
        [Authorize] // Only staff can create tables
        public async Task<IActionResult> CreateTable([FromBody] CreateTableDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var table = await _tableService.CreateTableAsync(dto);
                return CreatedAtAction(
                    nameof(GetTableById),
                    new { id = table.Id },
                    table
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating table");
                return StatusCode(500, new { message = "Error creating table" });
            }
        }

        /// <summary>
        /// Get table by ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableById(int id)
        {
            try
            {
                var table = await _tableService.GetTableByIdAsync(id);

                if (table == null)
                {
                    return NotFound(new { message = $"Table {id} not found" });
                }

                return Ok(table);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting table {id}");
                return StatusCode(500, new { message = "Error retrieving table" });
            }
        }

        /// <summary>
        /// Get table by table code (used when customer scans QR)
        /// </summary>
        [HttpGet("code/{tableCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableByCode(string tableCode)
        {
            try
            {
                var table = await _tableService.GetTableByCodeAsync(tableCode);

                if (table == null)
                {
                    return NotFound(new { message = $"Table with code {tableCode} not found" });
                }

                return Ok(table);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting table by code {tableCode}");
                return StatusCode(500, new { message = "Error retrieving table" });
            }
        }

        /// <summary>
        /// Get table by table number (allow customers to enter manually)
        /// </summary>
        [HttpGet("restaurant/{restaurantId}/number/{tableNumber}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTableByNumber(int restaurantId, string tableNumber)
        {
            try
            {
                var table = await _tableService.GetTableByNumberAsync(restaurantId, tableNumber);

                if (table == null)
                {
                    return NotFound(new { message = $"Table {tableNumber} not found for restaurant {restaurantId}" });
                }

                return Ok(table);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting table number {tableNumber} for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving table" });
            }
        }

        /// <summary>
        /// Get all tables for a restaurant
        /// </summary>
        [HttpGet("restaurant/{restaurantId}")]
        [Authorize]
        public async Task<IActionResult> GetTablesByRestaurant(int restaurantId)
        {
            try
            {
                var tables = await _tableService.GetTablesByRestaurantAsync(restaurantId);
                return Ok(tables);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting tables for restaurant {restaurantId}");
                return StatusCode(500, new { message = "Error retrieving tables" });
            }
        }

        /// <summary>
        /// Update table information
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTable(int id, [FromBody] UpdateTableDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var table = await _tableService.UpdateTableAsync(id, dto);

                if (table == null)
                {
                    return NotFound(new { message = $"Table {id} not found" });
                }

                return Ok(table);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating table {id}");
                return StatusCode(500, new { message = "Error updating table" });
            }
        }

        /// <summary>
        /// Delete or deactivate table
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTable(int id)
        {
            try
            {
                var success = await _tableService.DeleteTableAsync(id);

                if (!success)
                {
                    return NotFound(new { message = $"Table {id} not found" });
                }

                return Ok(new { message = "Table deleted successfully", tableId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting table {id}");
                return StatusCode(500, new { message = "Error deleting table" });
            }
        }
    }
}
