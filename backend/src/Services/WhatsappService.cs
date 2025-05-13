using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Microsoft.Extensions.Options;
using PeruControl.Configuration;

namespace PeruControl.Services;

public class WhatsappService
{
    private readonly S3Service _s3Service;
    private readonly TwilioConfiguration _twilio;

    public WhatsappService(
            S3Service s3Service,
            IOptions<TwilioConfiguration> settings
    )
    {
        _s3Service = s3Service;
        _twilio = settings.Value;
    }

    public async Task SendWhatsappMessageAsync(byte[] fileBytes, string fileName, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number is required.", nameof(phoneNumber));

        // if (fileBytes == null || fileBytes.Length == 0)
        //     throw new ArgumentException("File is required.", nameof(fileBytes));

        // Upload the file to S3/R2 and get a public URL
        // string mediaUrl = await UploadFileAndGetUrlAsync(fileBytes, fileName);

        TwilioClient.Init(_twilio.AccountSid, _twilio.AuthToken);

        var to = new PhoneNumber($"whatsapp:{phoneNumber}");
        var from = new PhoneNumber($"whatsapp:{_twilio.FromNumber}");

        var messageOptions = new CreateMessageOptions(to)
        {
            From = from,
            ContentSid = "HX350d429d32e64a552466cafecbe95f3c",
            ContentVariables = """{"1":"May the 5th","2":"noon (que bendicion)"}""",
            // Body = message
        };
        // messageOptions.MediaUrl.Add(new Uri(mediaUrl));

        var twilioMessage = await MessageResource.CreateAsync(messageOptions);
        Console.WriteLine(twilioMessage.Body);
    }

    public async Task SendWhatsappServiceMessageAsync(
            byte[] fileBytes,
            string contentSid,
            string fileName,
            string phoneNumber,
            string message
            )
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number is required.", nameof(phoneNumber));

        if (fileBytes == null || fileBytes.Length == 0)
            throw new ArgumentException("File is required.", nameof(fileBytes));

        // Upload the file to S3/R2 and get a public URL
        var uploadResult = await _s3Service.UploadAsync("tmp-my-file.pdf", new MemoryStream(fileBytes), "application/pdf");
        var mediaUrl = uploadResult.Url;

        // assert the url starts with the required url
        if (!mediaUrl.StartsWith(_twilio.FileUrlStart))
            throw new Exception("Invalid URL: Not starting with the required domain");

        // trim
        var trimmedUrl = mediaUrl.Substring(_twilio.FileUrlStart.Length);

        TwilioClient.Init(_twilio.AccountSid, _twilio.AuthToken);

        var to = new PhoneNumber($"whatsapp:{phoneNumber}");
        var from = new PhoneNumber($"whatsapp:{_twilio.FromNumber}");

        var messageOptions = new CreateMessageOptions(to)
        {
            From = from,
            ContentSid = contentSid,
            ContentVariables = $"{{\"name\":\"Josue\",\"id\":\"bd659322\",\"document_path\": \"{trimmedUrl}\"}}",
            // ContentVariables = """{"name":"Josue","id":"bd659322","document_path": "images/6/6c/Rickroll.jpg"}""",
        };

        var twilioMessage = await MessageResource.CreateAsync(messageOptions);
        Console.WriteLine(twilioMessage.Body);
    }

    private string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
    }
}
