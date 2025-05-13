using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;

namespace PeruControl.Services;

public class EmailService
{
    private readonly Configuration.EmailConfiguration _settings;

    public EmailService(IOptions<Configuration.EmailConfiguration> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, string textBody, List<EmailAttachment> attachments)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var builder = new BodyBuilder
        {
            HtmlBody = htmlBody,
            TextBody = textBody
        };

        // Add attachments if any
        if (attachments != null)
        {
            foreach (var attachment in attachments)
            {
                // Handle both stream and file path
                if (attachment.Content != null)
                {
                    builder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                }
                else if (!string.IsNullOrEmpty(attachment.FilePath))
                {
                    builder.Attachments.Add(attachment.FilePath);
                }
            }
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, _settings.UseSsl);
            await client.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword);
            await client.SendAsync(message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}

// Supporting class for attachments
public class EmailAttachment
{
    public required string FileName { get; set; }
    public required Stream Content { get; set; }
    public string ContentType { get; set; } = "application/octet-stream";
    public string? FilePath { get; set; }
}
