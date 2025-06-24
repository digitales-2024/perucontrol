using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class CertificateController(CertificateService certificateService) : ControllerBase
{
    [EndpointSummary("Get Certificates for table")]
    [EndpointDescription(
        "This endpoint returns a list of Certificates, sorted by most recent, and only ones with status != Created"
    )]
    [HttpGet("[controller]/for-table")]
    public async Task<IList<GetCertificateForTableOutDto>> GetOperationSheetsForTable()
    {
        var list = await certificateService.GetCertificatesForTable();
        return list;
    }

    [EndpointSummary("Get Certificates for creation")]
    [EndpointDescription(
        "Returns a list of certificates and their appointments for creation, where the certificate has status == Created"
    )]
    [HttpGet("[controller]/for-creation")]
    public async Task<IList<GetCertificateForCreationOutDto>> GetOperationSheetsForCreation()
    {
        var list = await certificateService.GetCertificatesForCreation();
        return list;
    }

    [EndpointSummary("Mark a Certificate as 'Started'")]
    [EndpointDescription(
        "Marks the selected certificate as 'Started', thus showing it in its table UI"
    )]
    [HttpPatch("[controller]/{certificateId:guid}/mark-started")]
    public async Task<ActionResult> MarkOperationSheetCreated(Guid certificateId)
    {
        await certificateService.MarkCertificateCreated(certificateId);
        return Ok();
    }

    [EndpointSummary("Get all certificates")]
    [HttpGet("[controller]")]
    [ProducesResponseType<IEnumerable<CertificateGet>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CertificateGet>>> GetAllCertificates()
    {
        var certificates = await certificateService.GetAllCertificates();
        return Ok(certificates);
    }

    [EndpointSummary("Get Certificate by appointment ID")]
    [HttpGet("Appointment/{appointmentId}/[controller]")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Certificate>> GetCertificateByAppointmentId(Guid appointmentId)
    {
        var result = await certificateService.GetByAppointmentId(appointmentId);

        return result switch
        {
            SuccessResult<Certificate> success => Ok(success.Data),
            NotFoundResult<Certificate> notFound => NotFound(notFound.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Update a certificate")]
    [HttpPatch("[controller]/{certificateId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Certificate>> UpdateCertificate(
        Guid certificateId,
        [FromBody] AppointmentCertificatePatchDTO updateDTO
    )
    {
        var result = await certificateService.UpdateCertificate(certificateId, updateDTO);

        return result switch
        {
            SuccessResult<Certificate> success => Ok(success.Data),
            NotFoundResult<Certificate> notFound => NotFound(notFound.Message),
            ErrorResult<Certificate> error => BadRequest(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Generate Certificate Word")]
    [HttpPost("[controller]/{certificateId:guid}/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult GenerateCertificateWord(Guid certificateId)
    {
        var result = certificateService.GenerateCertificateWord(certificateId);

        return result switch
        {
            SuccessResult<byte[]> success => File(
                success.Data,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "certificado_servicio.docx"
            ),
            NotFoundResult<byte[]> notFound => NotFound(notFound.Message),
            ErrorResult<byte[]> error => BadRequest(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Generate Certificate PDF")]
    [EndpointDescription(
        "Generates the Certificate in PDF format for an Appointment. The appointmentId parameter is the Appointment ID."
    )]
    [HttpPost("[Controller]/{certificateId:guid}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult GenerateCertificatePdf(Guid certificateId)
    {
        var result = certificateService.GenerateCertificatePdf(certificateId);

        return result switch
        {
            SuccessResult<byte[]> success => File(
                success.Data,
                "application/pdf",
                "certificate.pdf"
            ),
            NotFoundResult<byte[]> notFound => NotFound(notFound.Message),
            ErrorResult<byte[]> error => BadRequest(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Send Certificate PDF via Email")]
    [HttpPost("[Controller]/{certificateId:guid}/email-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendCertificatePdfViaEmail(
        Guid certificateId,
        [FromQuery]
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
            string email
    )
    {
        var result = await certificateService.SendCertificatePdfViaEmail(certificateId, email);

        return result switch
        {
            SuccessResult<string> => Ok(),
            ErrorResult<string> error => StatusCode(500, error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Send Certificate PDF via WhatsApp")]
    [HttpPost("[Controller]/{certificateId:guid}/whatsapp-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendCertificatePdfViaWhatsapp(
        Guid certificateId,
        [FromQuery] [System.ComponentModel.DataAnnotations.Required] string phoneNumber
    )
    {
        var result = await certificateService.SendCertificatePdfViaWhatsapp(
            certificateId,
            phoneNumber
        );

        return result switch
        {
            SuccessResult<string> => Ok(),
            ErrorResult<string> error => StatusCode(500, error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }
}
