using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Options;
using PeruControl.Model;

namespace PeruControl.Services;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly DatabaseContext _dbContext;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3Service"/> class configured to use Cloudflare R2.
    /// </summary>
    /// <param name="r2Config">Configuration containing R2 account details and credentials.</param>
    /// <exception cref="ArgumentNullException">Thrown when r2Config is null.</exception>
    /// <exception cref="ArgumentException">Thrown when required configuration values are missing.</exception>
    public S3Service(IOptions<R2Config> r2Config, DatabaseContext dbContext)
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
            SignatureVersion = "4",
            SignatureMethod = SigningAlgorithm.HmacSHA256,
            RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
            ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED,
        };

        _s3Client = new AmazonS3Client(config.AccessKey, config.SecretKey, s3Config);
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    /// <summary>
    /// Uploads an image to the specified bucket with the given key.
    /// </summary>
    /// <param name="bucketName">The name of the bucket where the image will be stored.</param>
    /// <param name="key">The key (file path/name) for the uploaded image.</param>
    /// <param name="fileStream">The stream containing the image data to upload.</param>
    /// <param name="contentType">The MIME type of the image, defaults to "image/png".</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains an
    /// <see cref="S3UploadResult"/> with details about the uploaded file.
    /// </returns>
    /// <exception cref="ArgumentException">Thrown when bucketName or key is null or empty.</exception>
    /// <exception cref="ArgumentNullException">Thrown when imageStream is null.</exception>
    /// <exception cref="AmazonS3Exception">Thrown when an S3-specific error occurs.</exception>
    /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
    public async Task<S3UploadResult> UploadAsync(
        string key,
        Stream fileStream,
        string contentType = "image/png"
    )
    {
        var bucketName = "perucontrol";

        // Input validation
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentException("Object key cannot be null or empty", nameof(key));

        if (fileStream == null)
            throw new ArgumentNullException(nameof(fileStream));

        try
        {
            // Use TransferUtility instead of directly using PutObjectRequest
            // This handles many edge cases better, especially for R2 compatibility
            var transferUtility = new TransferUtility(_s3Client);

            // Create the transfer utility options
            var transferUtilityUploadRequest = new TransferUtilityUploadRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                // This is crucial for R2 compatibility
                DisablePayloadSigning = true,
            };

            // Execute the upload
            await transferUtility.UploadAsync(transferUtilityUploadRequest);

            // Get the URL
            var urlRequest = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Verb = HttpVerb.GET,
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
            // Please use proper logging instead of Console.WriteLine in production
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
    /// Uploads a temp file to the specified bucket with the given key.
    /// At midnight, a separate service cleansup all files uploaded using this method.
    /// See UploadAsync for info about parameters
    /// </summary>
    public async Task<S3UploadResult> UploadTempAsync(
        string key,
        Stream fileStream,
        string contentType = "image/png"
    )
    {
        var result = await UploadAsync(key, fileStream, contentType);

        // Store the file in temp storage
        _dbContext.WhatsappTemps.Add(
            new Model.Whatsapp.WhatsappTemp { FileKey = result.Key, BucketName = result.BucketName }
        );
        await _dbContext.SaveChangesAsync();

        return result;
    }

    /// <summary>
    /// Downloads an image (object) from the specified bucket and key.
    /// </summary>
    /// <param name="key">The key (file path/name) of the object to download.</param>
    /// <param name="bucketName">The name of the bucket containing the object.</param>
    /// <returns>
    /// A stream containing the object's data, or null if not found.
    /// </returns>
    public async Task<Stream?> DownloadImageAsync(string key, string bucketName)
    {
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        if (string.IsNullOrEmpty(key))
            throw new ArgumentException("Object key cannot be null or empty", nameof(key));

        try
        {
            var request = new GetObjectRequest { BucketName = bucketName, Key = key };

            var response = await _s3Client.GetObjectAsync(request);

            // Copy the response stream to a MemoryStream to ensure it's seekable and can be disposed by the caller
            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Object not found
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error downloading image from S3: {ex.Message}");
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

    public async Task<bool> DeleteBatchAsync(string bucketName, IEnumerable<string> keys)
    {
        if (string.IsNullOrEmpty(bucketName))
            throw new ArgumentException("Bucket name cannot be null or empty", nameof(bucketName));

        if (keys == null || !keys.Any())
            throw new ArgumentException("Keys collection cannot be null or empty", nameof(keys));

        // Convert the keys to S3 KeyVersion objects
        var keyObjects = keys.Select(k => new KeyVersion { Key = k }).ToList();

        try
        {
            var deleteRequest = new DeleteObjectsRequest
            {
                BucketName = bucketName,
                Objects = keyObjects,
                // Set this to false if you don't want to get back a list of all deleted objects
                // Setting it to true will give you confirmation of each deletion
                Quiet = true,
            };

            var response = await _s3Client.DeleteObjectsAsync(deleteRequest);

            // If you want, you can check if there were errors in the response
            if (response.DeleteErrors.Count > 0)
            {
                foreach (var error in response.DeleteErrors)
                {
                    Console.WriteLine(
                        $"Error deleting key {error.Key}: {error.Code}, {error.Message}"
                    );
                }
                return response.DeleteErrors.Count == 0;
            }

            return true;
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
