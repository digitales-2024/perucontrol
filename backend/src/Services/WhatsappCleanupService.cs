using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Services;

public class WhatsappCleanupService(
    DatabaseContext dbContext,
    S3Service s3Service,
    ILogger<WhatsappCleanupService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.Now;
                var midnight = DateTime.Today.AddDays(1);
                var delay = midnight - now;

                logger.LogInformation($"S3 cleanup scheduled in {delay.TotalHours:F1} hours");

                // Wait until midnight
                await Task.Delay(delay, stoppingToken);

                // Perform cleanup
                await CleanupWhatsappFiles();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in S3 cleanup service");
                // Wait a bit before retrying after an error
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }
    }

    private async Task CleanupWhatsappFiles()
    {
        // get all registers
        var toDelete = await dbContext.WhatsappTemps.ToListAsync();
        if (toDelete == null || !toDelete.Any())
        {
            logger.LogInformation("No temp whatsapp files to delete");
            return;
        }

        // delete all files from r2
        var success = await s3Service.DeleteBatchAsync(
            "perucontrol",
            toDelete.Select(x => x.FileKey).ToList()
        );
        if (!success)
        {
            logger.LogError("Failed to delete files from S3");
            return;
        }

        // delete all registers
        dbContext.WhatsappTemps.RemoveRange(toDelete);
        await dbContext.SaveChangesAsync();
    }
}
