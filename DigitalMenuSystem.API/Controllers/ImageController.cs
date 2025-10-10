// File: Controllers/ImageController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DigitalMenuSystem.API.Services.Storage;
using DigitalMenuSystem.API.DTOs;

namespace DigitalMenuSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Only authenticated users can upload/delete images
    public class ImageController : ControllerBase
    {
        private readonly IS3Service _s3Service;
        private readonly ILogger<ImageController> _logger;

        public ImageController(
            IS3Service s3Service,
            ILogger<ImageController> logger)
        {
            _s3Service = s3Service;
            _logger = logger;
        }

        /// <summary>
        /// Upload a menu item image.
        /// </summary>
        /// <returns>Public image URL.</returns>
        [HttpPost("menu-item")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadMenuItemImage([FromForm] ImageUploadDto request)
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                var imageUrl = await _s3Service.UploadImageAsync(file, "menu-items");
                return Ok(new
                {
                    success = true,
                    imageUrl,
                    message = "Image uploaded successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading menu item image");
                return StatusCode(500, new { message = "Error uploading image" });
            }
        }

        /// <summary>
        /// Upload a category image.
        /// </summary>
        /// <returns>Public image URL.</returns>
        [HttpPost("category")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadCategoryImage([FromForm] ImageUploadDto request)
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                var imageUrl = await _s3Service.UploadImageAsync(file, "categories");
                return Ok(new
                {
                    success = true,
                    imageUrl,
                    message = "Category image uploaded successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading category image");
                return StatusCode(500, new { message = "Error uploading image" });
            }
        }

        /// <summary>
        /// Upload a restaurant logo.
        /// </summary>
        /// <returns>Public image URL.</returns>
        [HttpPost("restaurant")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadRestaurantLogo([FromForm] ImageUploadDto request)
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                var imageUrl = await _s3Service.UploadImageAsync(file, "restaurants");
                return Ok(new
                {
                    success = true,
                    imageUrl,
                    message = "Restaurant logo uploaded successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading restaurant logo");
                return StatusCode(500, new { message = "Error uploading image" });
            }
        }

        /// <summary>
        /// Delete an image from S3 by its full public URL.
        /// </summary>
        [HttpDelete]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return BadRequest(new { message = "Image URL is required" });

            try
            {
                var success = await _s3Service.DeleteImageAsync(imageUrl);

                if (!success)
                    return NotFound(new { message = "Image not found or already deleted" });

                return Ok(new
                {
                    success = true,
                    message = "Image deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image");
                return StatusCode(500, new { message = "Error deleting image" });
            }
        }

        /// <summary>
        /// Simple health-check for S3 configuration.
        /// </summary>
        [HttpGet("test-connection")]
        [AllowAnonymous] // optional: allow unauthenticated health check
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status500InternalServerError)]
        public IActionResult TestConnection()
        {
            try
            {
                var bucketName = Environment.GetEnvironmentVariable("AWS_BUCKET_NAME");
                var region = Environment.GetEnvironmentVariable("AWS_REGION");

                return Ok(new
                {
                    success = true,
                    message = "S3 service is configured",
                    bucketName,
                    region
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
