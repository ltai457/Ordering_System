// File: DTOs/ImageUploadDto.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DigitalMenuSystem.API.DTOs
{
    /// <summary>
    /// Multipart/form-data wrapper for a single image file upload.
    /// </summary>
    public class ImageUploadDto
    {
        /// <summary>
        /// Image file (max 5MB; jpg, jpeg, png, gif, webp)
        /// </summary>
        [Required]
        public IFormFile File { get; set; } = default!;
    }
}
