namespace PeruControl.Configuration;

public class EmailConfiguration
{
    public required string SmtpServer { get; set; }
    public required int SmtpPort { get; set; }
    public required bool UseSsl { get; set; }
    public required string SenderName { get; set; }
    public required string SenderEmail { get; set; }
    public required string SmtpUsername { get; set; }
    public required string SmtpPassword { get; set; }
}
