namespace PeruControl.Configuration;

public class EmailConfiguration
{
    public required string SmtpServer { get; set; }
    public required int SmtpPort { get; set; }
    public bool UseSsl { get; set; } = true;
    public required string SenderName { get; set; }
    public required string SenderEmail { get; set; }
    public required string SmtpUsername { get; set; }
    public required string SmtpPassword { get; set; }

    public string SecondaryToAddress { get; set; } = "peruccontrol@gmail.com";
    public string PublicEmailEndpoint { get; set; } =
        "https://perucontrol-frontend-develop.acide.win";
}
