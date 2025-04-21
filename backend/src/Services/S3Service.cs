using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace PeruControl.Services;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;

    public S3Service(IOptions<R2Config> r2Config)
    {
        if (r2Config == null || r2Config.Value == null)
            throw new ArgumentNullException(nameof(r2Config));

        var config = r2Config.Value;

        if (string.IsNullOrEmpty(config.AccountId))
            throw new ArgumentException("Cloudflare Account ID cannot be null or empty");

        if (string.IsNullOrEmpty(config.AccessKey))
            throw new ArgumentException("Access key cannot be null or empty");

        if (string.IsNullOrEmpty(config.SecretKey))
            throw new ArgumentException("Secret key cannot be null or empty");

        // Configure S3 client to use Cloudflare R2
        var s3Config = new AmazonS3Config
        {
            ServiceURL = $"https://{config.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true, // R2 requires path-style URLs
        };

        _s3Client = new AmazonS3Client(config.AccessKey, config.SecretKey, s3Config);
    }

    public async Task<bool> EnsureBucketExistsAsync(string bucketName)
    {
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        try
        {
            // Check if the bucket already exists
            var bucketExists = await DoesBucketExistAsync(bucketName);

            if (!bucketExists)
            {
                // Create the bucket
                var putBucketRequest = new PutBucketRequest { BucketName = bucketName };

                var response = await _s3Client.PutBucketAsync(putBucketRequest);
                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }

            return true; // Bucket already exists
        }
        catch (AmazonS3Exception ex)
        {
            // Handle Amazon-specific exceptions
            Console.WriteLine($"Error creating bucket: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            // Handle other exceptions
            Console.WriteLine($"Unexpected error: {ex.Message}");
            throw;
        }
    }

    private async Task<bool> DoesBucketExistAsync(string bucketName)
    {
        try
        {
            // Try to get bucket location as a check
            await _s3Client.GetBucketLocationAsync(
                new GetBucketLocationRequest { BucketName = bucketName }
            );
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public async Task<S3UploadResult> UploadImageAsync(
        string bucketName,
        string key,
        Stream imageStream,
        string contentType = "image/jpeg"
    )
    {
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentException("Object key cannot be null or empty", nameof(key));

        if (imageStream == null)
            throw new ArgumentNullException(nameof(imageStream));

        try
        {
            // Ensure bucket exists first
            await EnsureBucketExistsAsync(bucketName);

            // Create put request
            var putRequest = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = imageStream,
                ContentType = contentType,
            };

            // Upload the file
            await _s3Client.PutObjectAsync(putRequest);

            // After successful upload
            var urlRequest = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddYears(10),
            };

            string url = _s3Client.GetPreSignedURL(urlRequest);

            return new S3UploadResult
            {
                Key = key,
                Url = url,
                BucketName = bucketName,
            };
        }
        catch (AmazonS3Exception ex)
        {
            Console.WriteLine($"S3 error uploading image: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error uploading image: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeleteObjectAsync(string bucketName, string key)
    {
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentException("Object key cannot be null or empty", nameof(key));

        try
        {
            var deleteRequest = new DeleteObjectRequest { BucketName = bucketName, Key = key };

            var response = await _s3Client.DeleteObjectAsync(deleteRequest);
            return true; // S3 will return success even if the key doesn't exist
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.Forbidden)
        {
            // Permission error
            Console.WriteLine($"Permission denied: {ex.Message}");
            return false;
        }
        catch (AmazonS3Exception ex)
        {
            // Other S3-specific errors (bucket doesn't exist, etc.)
            Console.WriteLine($"S3 error: {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            // Unexpected errors
            Console.WriteLine($"Error: {ex.Message}");
            return false;
        }
    }
}

// Config class for R2 settings
public class R2Config
{
    public required string AccountId { get; set; }
    public required string AccessKey { get; set; }
    public required string SecretKey { get; set; }
}

public class S3UploadResult
{
    public required string Key { get; set; }
    public required string Url { get; set; }
    public required string BucketName { get; set; }
}
