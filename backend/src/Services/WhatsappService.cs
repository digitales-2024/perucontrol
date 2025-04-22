// using Twilio;
// using Twilio.Rest.Api.V2010.Account;
// using Twilio.Types;
using Microsoft.Extensions.Configuration;

namespace PeruControl.Services;

public class WhatsappService(IConfiguration configuration, S3Service s3Service)
{
    private readonly string _accountSid = configuration["Twilio:AccountSid"];
    private readonly string _authToken = configuration["Twilio:AuthToken"];
    private readonly string _fromNumber = configuration["Twilio:WhatsappFrom"];
    private readonly string _bucketName = configuration["Whatsapp:MediaBucket"];
    private readonly S3Service _s3Service = s3Service;

    // public async Task SendWhatsappMessageAsync(byte[] fileBytes, string fileName, string phoneNumber, string message)
    // {
    //     if (string.IsNullOrWhiteSpace(phoneNumber))
    //         throw new ArgumentException("Phone number is required.", nameof(phoneNumber));
    //
    //     if (fileBytes == null || fileBytes.Length == 0)
    //         throw new ArgumentException("File is required.", nameof(fileBytes));
    //
    //     // Upload the file to S3/R2 and get a public URL
    //     string mediaUrl = await UploadFileAndGetUrlAsync(fileBytes, fileName);
    //
    //     TwilioClient.Init(_accountSid, _authToken);
    //
    //     var to = new PhoneNumber($"whatsapp:{phoneNumber}");
    //     var from = new PhoneNumber(_fromNumber);
    //
    //     var messageOptions = new CreateMessageOptions(to)
    //     {
    //         From = from,
    //         Body = message
    //     };
    //     messageOptions.MediaUrl.Add(new Uri(mediaUrl));
    //
    //     await MessageResource.CreateAsync(messageOptions);
    // }
    //
    // private async Task<string> UploadFileAndGetUrlAsync(byte[] fileBytes, string fileName)
    // {
    //     if (string.IsNullOrWhiteSpace(_bucketName))
    //         throw new InvalidOperationException("Whatsapp:MediaBucket configuration is missing.");
    //
    //     using var stream = new MemoryStream(fileBytes);
    //     var contentType = GetContentType(fileName);
    //
    //     var result = await _s3Service.UploadImageAsync(
    //         _bucketName,
    //         fileName,
    //         stream,
    //         contentType
    //     );
    //
    //     return result.Url;
    // }
    //
    // private string GetContentType(string fileName)
    // {
    //     var ext = Path.GetExtension(fileName).ToLowerInvariant();
    //     return ext switch
    //     {
    //         ".jpg" or ".jpeg" => "image/jpeg",
    //         ".png" => "image/png",
    //         ".gif" => "image/gif",
    //         ".pdf" => "application/pdf",
    //         _ => "application/octet-stream"
    //     };
    // }
}
