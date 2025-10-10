using Amazon.S3;
using Amazon.S3.Model;

namespace DigitalMenuSystem.API.Services.Storage
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IConfiguration _configuration;
        private readonly ILogger<S3Service> _logger;
        private readonly string _bucketName;
        private readonly string _region;

        // Allowed image types
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public S3Service(
            IAmazonS3 s3Client,
            IConfiguration configuration,
            ILogger<S3Service> logger)
        {
            _s3Client = s3Client;
            _configuration = configuration;
            _logger = logger;
            _bucketName = Environment.GetEnvironmentVariable("AWS_BUCKET_NAME") 
                ?? throw new InvalidOperationException("AWS_BUCKET_NAME not configured");
            _region = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-2";
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder)
        {
            // Validate file
            if (!IsValidImage(file))
            {
                throw new ArgumentException("Invalid image file");
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var key = $"{folder}/{fileName}";

            try
            {
                using var stream = file.OpenReadStream();
                
                var uploadRequest = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType,
                    /* CannedACL = S3CannedACL.PublicRead // Make image publicly accessible */
                };

                var response = await _s3Client.PutObjectAsync(uploadRequest);

                if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
                {
                    // Construct public URL
                    var imageUrl = $"https://{_bucketName}.s3.{_region}.amazonaws.com/{key}";
                    
                    _logger.LogInformation($"Uploaded image: {fileName} to {folder}");
                    
                    return imageUrl;
                }
                else
                {
                    throw new Exception($"Failed to upload image. Status code: {response.HttpStatusCode}");
                }
            }
            catch (AmazonS3Exception ex)
            {
                _logger.LogError(ex, $"S3 error uploading image: {ex.Message}");
                throw new Exception($"S3 upload failed: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return false;
            }

            try
            {
                // Extract key from URL
                // URL format: https://bucket.s3.region.amazonaws.com/folder/filename.jpg
                var uri = new Uri(imageUrl);
                var key = uri.AbsolutePath.TrimStart('/');

                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                var response = await _s3Client.DeleteObjectAsync(deleteRequest);

                if (response.HttpStatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    _logger.LogInformation($"Deleted image: {key}");
                    return true;
                }

                return false;
            }
            catch (AmazonS3Exception ex)
            {
                _logger.LogError(ex, $"S3 error deleting image: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image: {ex.Message}");
                return false;
            }
        }

        public bool IsValidImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return false;
            }

            // Check file size
            if (file.Length > MaxFileSize)
            {
                throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB");
            }

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Invalid file extension. Allowed: {string.Join(", ", _allowedExtensions)}");
            }

            // Check MIME type
            if (!_allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                throw new ArgumentException($"Invalid file type. Allowed: {string.Join(", ", _allowedMimeTypes)}");
            }

            return true;
        }
    }
}