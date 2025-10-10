namespace DigitalMenuSystem.API.Services.Storage
{
    public interface IS3Service
    {
        /// <summary>
        /// Upload an image file to S3
        /// </summary>
        /// <param name="file">Image file</param>
        /// <param name="folder">S3 folder (menu-items, restaurants, categories)</param>
        /// <returns>Public URL of uploaded image</returns>
        Task<string> UploadImageAsync(IFormFile file, string folder);
        
        /// <summary>
        /// Delete an image from S3 by URL
        /// </summary>
        /// <param name="imageUrl">Full S3 URL</param>
        /// <returns>Success status</returns>
        Task<bool> DeleteImageAsync(string imageUrl);
        
        /// <summary>
        /// Validate if file is an image
        /// </summary>
        /// <param name="file">File to validate</param>
        /// <returns>True if valid image</returns>
        bool IsValidImage(IFormFile file);
    }
}