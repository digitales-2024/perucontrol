using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using PeruControl.Configuration;

namespace PeruControl.Services;

public class EmailService
{
    private readonly EmailConfiguration _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailConfiguration> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    // Overloaded method for single address (backward compatibility)
    public async Task<(bool Success, string? ErrorMessage)> SendEmailAsync(
        string to,
        string subject,
        string htmlBody,
        string? textBody,
        List<EmailAttachment> attachments
    )
    {
        return await SendEmailAsync([to], subject, htmlBody, textBody, attachments);
    }

    // Main method that accepts multiple addresses
    public async Task<(bool Success, string? ErrorMessage)> SendEmailAsync(
        List<string> toAddresses,
        string subject,
        string htmlBody,
        string? textBody,
        List<EmailAttachment> attachments
    )
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));

        // ADD secondary perucontrol address
#if !DEBUG
        toAddresses.Add(_settings.SecondaryToAddress);
#endif

        // Add all recipient addresses
        foreach (var address in toAddresses)
        {
            message.To.Add(new MailboxAddress("", address));
        }

        message.Subject = subject;

        var finalMessageHtml =
    $$"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>{{subject}}</title>
        <style>
            /* Reset styles for email clients */
            .email-body {
                margin: 0;
                padding: 0;
                min-width: 100%;
                background-color: #f7f7f7;
                font-family: Arial, sans-serif;
            }

            .email-container {max - width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }

            .content-table {width: 100%;
                border-collapse: collapse;
            }

            .column-divider {border - right: 1px solid #e0e0e0;
            }

            .image-container {padding: 15px;
                text-align: center;
            }

            .company-info {padding: 20px;
                line-height: 1.6;
                color: #333333;
            }

            .responsive-image {max - width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
            }

            /* Mobile responsiveness */
            @media screen and (max-width: 480px) {
                .column - divider {
                    border-right: none;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .mobile-stack {
                    display: block !important;
                    width: 100% !important;
                }
            }
        </style>
    </head>
    <body class="email-body">
        <div class="email-container">
            {{htmlBody}}
            <table class="content-table">
                <tr>
                    <!-- LEFT COLUMN WITH IMAGES -->
                    <td class="mobile-stack column-divider" width="40%" style="vertical-align: top;">
                        <div class="image-container">
                            <img src="https://via.placeholder.com/300x200?text=Product+Image" 
                                 alt="Product showcase" 
                                 class="responsive-image"
                                 style="margin-bottom: 15px;">
                            
                            <img src="https://via.placeholder.com/300x200?text=Team+Photo" 
                                 alt="Our team" 
                                 class="responsive-image">
                        </div>
                    </td>
                    
                    <!-- VERTICAL DIVIDER LINE (visible only on desktop) -->
                    <td style="width: 1px; background-color: #e0e0e0;" class="mobile-hide"></td>
                    
                    <!-- RIGHT COLUMN WITH COMPANY INFO -->
                    <td class="mobile-stack" width="60%" style="vertical-align: top;">
                        <div class="company-info">
                            <h2 style="color: #1a5276;">Company Name</h2>
                            
                            <p><strong>Innovating Since 2010</strong></p>
                            
                            <p>We specialize in premium solutions for:</p>
                            <ul>
                                <li>Professional Services</li>
                                <li>Product Development</li>
                                <li>Customer Experience</li>
                            </ul>
                            
                            <p style="margin-top: 20px;">
                                📍 123 Business Avenue<br>
                                City, State 10001
                            </p>
                            
                            <p style="margin-top: 20px;">
                                📞 (555) 123-4567<br>
                                ✉️ info@company.com
                            </p>
                            
                            <div style="margin-top: 25px;">
                                <a href="https://company.com" 
                                   style="display: inline-block; 
                                          background-color: #1a5276; 
                                          color: white; 
                                          padding: 10px 20px; 
                                          text-decoration: none; 
                                          border-radius: 4px;">
                                    Visit Our Website
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """;
        var builder = new BodyBuilder { HtmlBody = finalMessageHtml, TextBody = textBody };

        // Add attachments if any
        if (attachments != null)
        {
            foreach (var attachment in attachments)
            {
                // Handle both stream and file path
                if (attachment.Content != null)
                {
                    builder.Attachments.Add(
                        attachment.FileName,
                        attachment.Content,
                        ContentType.Parse(attachment.ContentType)
                    );
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
            await client.ConnectAsync(
                _settings.SmtpServer,
                _settings.SmtpPort,
                SecureSocketOptions.StartTls
            );
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
            return (
                Success: false,
                ErrorMessage: $"Error SMTP: {ex.Message} (código {ex.StatusCode})"
            );
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
