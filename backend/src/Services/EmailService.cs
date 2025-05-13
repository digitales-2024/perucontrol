using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace PeruControl.Services;

public class EmailService
{
    private readonly Configuration.EmailConfiguration _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<Configuration.EmailConfiguration> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<(bool Success, string? ErrorMessage)> SendEmailAsync(string to, string subject, string htmlBody, string? textBody, List<EmailAttachment> attachments)
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
            return (Success: true, ErrorMessage: null);
        }
        catch (AuthenticationException ex)
        {
            _logger.LogError(ex, "Authentication failed while sending email.");
            return (Success: false, ErrorMessage: $"Error autenticando con el servidor de correo");
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(ex, "SMTP command error while sending email.");
            return (Success: false, ErrorMessage: $"Error SMTP: {ex.Message} (código {ex.StatusCode})");
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(ex, "SMTP protocol error while sending email.");
            return (Success: false, ErrorMessage: $"Error de protocolo SMTP");
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Network error while sending email.");
            return (Success: false, ErrorMessage: $"Error de red al enviar correo");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while sending email.");
            return (Success: false, ErrorMessage: $"Error al enviar correo. Contacte a soporte");
        }
        finally
        {
            // Disconnect even if sending failed
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true);
            }
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
