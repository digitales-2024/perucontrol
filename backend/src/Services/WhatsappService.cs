using Microsoft.Extensions.Options;
using PeruControl.Configuration;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace PeruControl.Services;

public class WhatsappService(S3Service s3Service, IOptions<TwilioConfiguration> settings)
{
    private readonly S3Service _s3Service = s3Service;
    private readonly TwilioConfiguration _twilio = settings.Value;

    public async Task SendWhatsappServiceMessageAsync(
        byte[] fileBytes,
        /// ID of the Twilio message template
        string contentSid,
        string fileName,
        string phoneNumber
    )
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number is required.", nameof(phoneNumber));

        if (fileBytes == null || fileBytes.Length == 0)
            throw new ArgumentException("File is required.", nameof(fileBytes));

        // Upload the file to S3/R2 and get a public URL
        var uniqueid = Guid.NewGuid().ToString();
        var uploadResult = await _s3Service.UploadTempAsync(
            $"tmp-{uniqueid}.pdf",
            new MemoryStream(fileBytes),
            "application/pdf"
        );

        var uploadKey = System.Net.WebUtility.UrlEncode(uploadResult.Key);
        var mime = System.Net.WebUtility.UrlEncode("application/pdf");
        var trimmedUrl = $"api/Business/image/{uploadKey}/perucontrol?expectedMime={mime}";

        TwilioClient.Init(_twilio.AccountSid, _twilio.AuthToken);

        var to = new PhoneNumber($"whatsapp:{phoneNumber}");
        var from = new PhoneNumber($"whatsapp:{_twilio.FromNumber}");

        var messageOptions = new CreateMessageOptions(to)
        {
            From = from,
            ContentSid = contentSid,
            ContentVariables =
                $"{{\"name\":\"Josue\",\"id\":\"bd659322\",\"url_path\": \"{trimmedUrl}\"}}",
        };

        var twilioMessage = await MessageResource.CreateAsync(messageOptions);
    }
}
