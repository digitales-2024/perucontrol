using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace PeruControl.Services;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3Service"/> class configured to use Cloudflare R2.
    /// </summary>
    /// <param name="r2Config">Configuration containing R2 account details and credentials.</param>
    /// <exception cref="ArgumentNullException">Thrown when r2Config is null.</exception>
    /// <exception cref="ArgumentException">Thrown when required configuration values are missing.</exception>
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

    /// <summary>
    /// Ensures that a bucket with the specified name exists, creating it if necessary.
    /// </summary>
    /// <param name="bucketName">The name of the bucket to check or create.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a boolean
    /// indicating whether the bucket exists or was successfully created.
    /// </returns>
    /// <exception cref="ArgumentException">Thrown when bucketName is null or empty.</exception>
    /// <exception cref="AmazonS3Exception">Thrown when an S3-specific error occurs.</exception>
    /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
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

    /// <summary>
    /// Checks if a bucket with the specified name exists.
    /// </summary>
    /// <param name="bucketName">The name of the bucket to check.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a boolean
    /// indicating whether the bucket exists.
    /// </returns>
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

    /// <summary>
    /// Uploads an image to the specified bucket with the given key.
    /// </summary>
    /// <param name="bucketName">The name of the bucket where the image will be stored.</param>
    /// <param name="key">The key (file path/name) for the uploaded image.</param>
    /// <param name="imageStream">The stream containing the image data to upload.</param>
    /// <param name="contentType">The MIME type of the image, defaults to "image/jpeg".</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains an
    /// <see cref="S3UploadResult"/> with details about the uploaded file.
    /// </returns>
    /// <exception cref="ArgumentException">Thrown when bucketName or key is null or empty.</exception>
    /// <exception cref="ArgumentNullException">Thrown when imageStream is null.</exception>
    /// <exception cref="AmazonS3Exception">Thrown when an S3-specific error occurs.</exception>
    /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
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

    /// <summary>
    /// Deletes an object from the specified bucket.
    /// </summary>
    /// <param name="bucketName">The name of the bucket containing the object to delete.</param>
    /// <param name="key">The key (file path/name) of the object to delete.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a boolean
    /// indicating whether the object was successfully deleted.
    /// </returns>
    /// <exception cref="ArgumentException">Thrown when bucketName or key is null or empty.</exception>
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

/// <summary>
/// Configuration class for Cloudflare R2 storage.
/// </summary>
public class R2Config
{
    /// <summary>Gets or sets the Cloudflare account ID.</summary>
    public required string AccountId { get; set; }

    /// <summary>Gets or sets the access key for authentication.</summary>
    public required string AccessKey { get; set; }

    /// <summary>Gets or sets the secret key for authentication.</summary>
    public required string SecretKey { get; set; }
}

/// <summary>
/// Represents the result of an S3 upload operation.
/// </summary>
public class S3UploadResult
{
    /// <summary>Gets or sets the key (path/name) of the uploaded file.</summary>
    public required string Key { get; set; }

    /// <summary>Gets or sets the pre-signed URL for accessing the uploaded file.</summary>
    public required string Url { get; set; }

    /// <summary>Gets or sets the name of the bucket where the file was uploaded.</summary>
    public required string BucketName { get; set; }
}
