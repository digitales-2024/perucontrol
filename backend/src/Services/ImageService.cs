namespace PeruControl.Services;

public class ImageService
{
    private readonly string _imagesDirectory;

    public ImageService()
    {
        // Default to a directory called "images" in the application root
        _imagesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Images");

        // Ensure the directory exists
        if (!Directory.Exists(_imagesDirectory))
        {
            Directory.CreateDirectory(_imagesDirectory);
        }
    }

    /// <summary>
    /// Saves an image to the file system. Replaces existing images with the same name.
    /// </summary>
    /// <param name="imageStream">The image data stream</param>
    /// <param name="fileName">The name to save the file as</param>
    /// <returns>The path to the saved image or null if save failed</returns>
    public async Task<string?> SaveImageAsync(Stream imageStream, string fileName)
    {
        if (imageStream == null)
            throw new ArgumentNullException(nameof(imageStream));

        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty", nameof(fileName));

        // Ensure it's a PNG by trying to load it
        if (!IsPngImage(imageStream))
            throw new ArgumentException("File is not a valid PNG image", nameof(imageStream));

        // Reset stream position after validation
        imageStream.Position = 0;

        // Ensure filename ends with .png
        if (!fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
            fileName = $"{fileName}.png";

        // Get full path
        string fullPath = Path.Combine(_imagesDirectory, fileName);

        // Delete if exists
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        // Save the file
        try
        {
            using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
            {
                await imageStream.CopyToAsync(fileStream);
            }

            return fullPath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving image: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Gets an image by its filename
    /// </summary>
    /// <param name="fileName">The name of the file to retrieve</param>
    /// <returns>Image stream or null if not found</returns>
    public Stream? GetImage(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty", nameof(fileName));

        // Ensure filename ends with .png
        if (!fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
            fileName = $"{fileName}.png";

        string fullPath = Path.Combine(_imagesDirectory, fileName);

        if (!File.Exists(fullPath))
            return null;

        try
        {
            // Return a FileStream (remember to dispose this in the calling code)
            return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error retrieving image: {ex.Message}");
            return null;
        }
    }

    public string? GetImageAsBase64(string fileName)
    {
        using var imageStream = GetImage(fileName);
        if (imageStream == null)
            return null;

        using var ms = new MemoryStream();
        imageStream.CopyTo(ms);
        return Convert.ToBase64String(ms.ToArray());
    }

    /// <summary>
    /// Lists all image names in the directory
    /// </summary>
    /// <returns>Array of image filenames</returns>
    public string[] ListImages()
    {
        return Directory
            .GetFiles(_imagesDirectory, "*.png")
            .Select(path => Path.GetFileName(path))
            .ToArray();
    }

    /// <summary>
    /// Checks if a stream contains a valid PNG image
    /// </summary>
    private bool IsPngImage(Stream imageStream)
    {
        // Save original position
        long originalPosition = imageStream.Position;

        try
        {
            // Check PNG signature
            byte[] signature = new byte[8];
            if (imageStream.Read(signature, 0, 8) < 8)
                return false;

            // PNG signature: 89 50 4E 47 0D 0A 1A 0A
            return signature[0] == 0x89
                && signature[1] == 0x50
                && signature[2] == 0x4E
                && signature[3] == 0x47
                && signature[4] == 0x0D
                && signature[5] == 0x0A
                && signature[6] == 0x1A
                && signature[7] == 0x0A;
        }
        catch
        {
            return false;
        }
        finally
        {
            // Restore original position
            imageStream.Position = originalPosition;
        }
    }

    /// <summary>
    /// Deletes an image by filename
    /// </summary>
    public bool DeleteImage(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty", nameof(fileName));

        // Ensure filename ends with .png
        if (!fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
            fileName = $"{fileName}.png";

        string fullPath = Path.Combine(_imagesDirectory, fileName);

        if (!File.Exists(fullPath))
            return false;

        try
        {
            File.Delete(fullPath);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting image: {ex.Message}");
            return false;
        }
    }
}
