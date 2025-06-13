namespace PeruControl.Infrastructure.Model.Whatsapp;

public class WhatsappTemp
{
    public Guid ID { get; set; } = Guid.NewGuid();

    // R2 file identifiers
    public required string FileKey { get; set; }
    public required string BucketName { get; set; }
}
