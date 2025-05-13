namespace PeruControl.Configuration;

public class TwilioConfiguration
{
    public required string AccountSid { get; set; }
    public required string AuthToken { get; set; }
    public required string FromNumber { get; set; }
    public required string FileUrlStart { get; set; }
}
