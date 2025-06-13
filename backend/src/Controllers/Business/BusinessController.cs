using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class BusinessController(DatabaseContext db, ImageService imageService, S3Service s3Service)
    : AbstractCrudController<Business, BusinessCreateDTO, BusinessPatchDTO>(db)
{
    private readonly ImageService _imageService = imageService;

    [EndpointSummary("Upload system images")]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] string name, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        if (!file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only PNG images are allowed.");

        try
        {
            using var stream = file.OpenReadStream();
            var savedPath = await _imageService.SaveImageAsync(stream, name);

            if (savedPath == null)
                return StatusCode(500, "Failed to save image.");

            return Ok(new { path = savedPath });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [EndpointSummary("Get system image by name")]
    [HttpGet("image/{name}")]
    public IActionResult GetImage(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        try
        {
            var stream = _imageService.GetImage(name);
            if (stream == null)
                return NotFound("Image not found.");

            return File(stream, "image/png");
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [AllowAnonymous]
    [EndpointSummary("Get public R2 file")]
    [HttpGet("image/{key}/{bucketName}")]
    public async Task<ActionResult> GetPublicR2File(
        string key,
        string bucketName,
        [FromQuery] string expectedMime = "application/octet-stream"
    )
    {
        if (string.IsNullOrWhiteSpace(key))
            return BadRequest("Key is required.");
        if (string.IsNullOrWhiteSpace(bucketName))
            return BadRequest("Key is required.");

        try
        {
            var stream = await s3Service.DownloadImageAsync(key, bucketName);
            if (stream is null)
            {
                return BadRequest("Imagen no encontrada");
            }
            return File(stream, expectedMime);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
