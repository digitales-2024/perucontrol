using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;
using PeruControl.Utils;

namespace PeruControl.Controllers;

/// <summary>
/// Controller responsible for managing appointment-related operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController(
    AppointmentService appointmentService,
    DatabaseContext db,
    LibreOfficeConverterService pdfConverterService,
    S3Service s3Service,
    EmailService emailService,
    WhatsappService whatsappService
) : ControllerBase
{
    private readonly EmailService _emailService = emailService;
    private readonly WhatsappService _whatsappService = whatsappService;

    /// <summary>
    /// Retrieves appointments within a specified time range.
    /// </summary>
    /// <param name="start">The start date and time of the range.</param>
    /// <param name="end">The end date and time of the range.</param>
    /// <returns>A collection of appointments that fall within the specified time range.</returns>
    /// <response code="200">Returns the list of appointments in the specified date range.</response>
    [EndpointSummary("Get by time range")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<AppointmentGetDTO>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AppointmentGetDTO>>> GetByTimeRange(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end
    )
    {
        var appointments = await db
            .ProjectAppointments.Where(a => a.DueDate >= start && a.DueDate <= end)
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .ToListAsync();

        return Ok(
            appointments.Select(a => new AppointmentGetDTO
            {
                Project = a.Project,
                CertificateNumber = a.CertificateNumber,
                DueDate = a.DueDate,
                ActualDate = a.ActualDate,
                Client = a.Project.Client,
                Id = a.Id,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                ModifiedAt = a.ModifiedAt,
                EnterTime = a.EnterTime,
                LeaveTime = a.LeaveTime,
            })
        );
    }

    [EndpointSummary("Get by ID")]
    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentGetOutDTO>> GetAppointmentById(Guid id)
    {
        var result = await appointmentService.GetById(id);

        return result switch
        {
            SuccessResult<AppointmentGetOutDTO> success => Ok(success.Data),
            NotFoundResult<AppointmentGetOutDTO> error => NotFound(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }

    [EndpointSummary("Get all appointments")]
    [HttpGet("all")]
    [ProducesResponseType<IEnumerable<AppointmentGetDTO2>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AppointmentGetDTO2>>> GetAllAppointments()
    {
        var appointments = await db
            .ProjectAppointments.Include(a => a.Services)
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .ToListAsync();

        var result = appointments.Select(a => new AppointmentGetDTO2
        {
            Id = a.Id,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            ModifiedAt = a.ModifiedAt,
            AppointmentNumber = a.AppointmentNumber,
            CertificateNumber = a.CertificateNumber,
            DueDate = a.DueDate,
            ActualDate = a.ActualDate ?? DateTime.MinValue,
            Services = a.Services,
            Project = a.Project,
            Client = a.Project.Client,
            EnterTime = a.EnterTime,
            LeaveTime = a.LeaveTime,
        });

        return Ok(result);
    }

    // Certificate endpoints have been moved to CertificateController

    [EndpointSummary("Generate Rodents Excel")]
    [EndpointDescription(
        "Generates the Rodents Template in Ods format for an Appointment. The id parameter is the Appointment ID."
    )]
    [HttpPost("{id}/rodents/excel")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GenerateRodentsExcel(Guid id)
    {
        var (odsBytes, errormsg) = await appointmentService.FillRodentsExcel(id);
        if (errormsg is not null)
        {
            return BadRequest(errormsg);
        }

        // send
        return File(odsBytes, "application/vnd.oasis.opendocument.spreadsheet", "roedores.ods");
    }

    [EndpointSummary("Generate Rodents PDF")]
    [EndpointDescription(
        "Generates the Rodents Template in PDF format for an Appointment. The id parameter is the Appointment ID."
    )]
    [HttpPost("{id}/rodents/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GenerateRodentsPdf(Guid id)
    {
        var (odsBytes, errormsg) = await appointmentService.FillRodentsExcel(id);
        if (errormsg is not null)
        {
            return BadRequest(errormsg);
        }

        var (pdfBytes, errorStr) = pdfConverterService.ConvertToPdf(odsBytes, "ods");

        if (errorStr != "")
        {
            return BadRequest(errorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "roedores.pdf");
    }

    [EndpointSummary("Send Rodents PDF via Email")]
    [HttpPost("{id}/rodents/email-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendRodentsPdfViaEmail(
        Guid id,
        [FromQuery]
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
            string email
    )
    {
        var (odsBytes, errormsg) = await appointmentService.FillRodentsExcel(id);
        if (errormsg is not null)
        {
            return BadRequest(errormsg);
        }

        var (pdfBytes, pdfErrorStr) = pdfConverterService.ConvertToPdf(odsBytes, "ods");

        if (!string.IsNullOrEmpty(pdfErrorStr))
        {
            return BadRequest(pdfErrorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF de roedores");
        }

        var (ok, serviceError) = await _emailService.SendEmailAsync(
            to: email,
            subject: "ENVIO DE DOCUMENTOS DE PERUCONTROL.COM EIRL",
            htmlBody: """
                <p>¡Buen día Estimados!</p>
                <br />
                <p>Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo.</p>
            """,
            textBody: "¡Buen día Estimados! Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo. ",
            attachments:
            [
                new()
                {
                    FileName = "registro_roedores_perucontrol.pdf",
                    Content = new MemoryStream(pdfBytes),
                    ContentType = "application/pdf",
                },
            ]
        );

        if (!ok)
        {
            return StatusCode(
                500,
                serviceError ?? "Error enviando el correo con el registro de roedores"
            );
        }

        return Ok();
    }

    [EndpointSummary("Send Rodents PDF via WhatsApp")]
    [HttpPost("{id}/rodents/whatsapp-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendRodentsPdfViaWhatsapp(
        Guid id,
        [FromQuery] [System.ComponentModel.DataAnnotations.Required] string phoneNumber
    )
    {
        var (odsBytes, errormsg) = await appointmentService.FillRodentsExcel(id);
        if (errormsg is not null)
        {
            return BadRequest(errormsg);
        }

        var (pdfBytes, pdfErrorStr) = pdfConverterService.ConvertToPdf(odsBytes, "ods");

        if (!string.IsNullOrEmpty(pdfErrorStr))
        {
            return BadRequest(pdfErrorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF de roedores");
        }

        // Ensure you have a valid ContentSid for WhatsApp document messages if applicable
        // This SID might be specific to a template or a generic one for documents.
        // For now, using a placeholder or a known generic SID if available.
        // Example SID from QuotationController: "HXc9bee467c02d529435b97f7694ad3b87"
        // This might need adjustment based on actual Twilio setup.
        await _whatsappService.SendWhatsappServiceMessageAsync(
            fileBytes: pdfBytes,
            contentSid: "HXc9bee467c02d529435b97f7694ad3b87", // Placeholder or generic SID
            fileName: "registro_roedores.pdf",
            phoneNumber: phoneNumber // Using the provided phone number
        );

        return Ok();
    }

    [EndpointSummary("Update Rodent Register")]
    [EndpointDescription(
        "Updates the Rodent Register for a specific appointment. The appointmentId parameter is the ID of the appointment."
    )]
    [HttpPatch("{appointmentId}/rodent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateRodentRegister(
        [FromRoute] Guid appointmentId,
        [FromBody] RodentRegisterUpdateDTO updateDTO
    )
    {
        if (updateDTO == null)
            return BadRequest("El cuerpo de la solicitud no puede estar vacío");

        // Get the appointment with its rodent register and areas
        var appointment = await db.Set<ProjectAppointment>()
            .Include(r => r.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .FirstOrDefaultAsync(r => r.Id == appointmentId);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (appointment.RodentRegister == null)
            return NotFound("Rodent register not found for this appointment");

        try
        {
            // Update the rodent register properties
            updateDTO.ApplyPatch(appointment.RodentRegister);

            // Handle the rodent areas
            var areasToRemove = appointment
                .RodentRegister.RodentAreas.Where(ra =>
                    !updateDTO.RodentAreas.Any(dto => dto.Id == ra.Id)
                )
                .ToList();

            // Remove areas not present in the update DTO
            foreach (var area in areasToRemove)
            {
                db.Remove(area);
            }

            // Update existing areas and add new ones
            foreach (var areaDto in updateDTO.RodentAreas)
            {
                var existingArea = appointment.RodentRegister.RodentAreas.FirstOrDefault(ra =>
                    ra.Id == areaDto.Id
                );

                if (existingArea != null)
                {
                    // Update existing area
                    existingArea.Name = areaDto.Name;
                    existingArea.CebaderoTrampa = areaDto.CebaderoTrampa;
                    existingArea.Frequency = areaDto.Frequency;
                    existingArea.RodentConsumption = areaDto.RodentConsumption;
                    existingArea.RodentResult = areaDto.RodentResult;
                    existingArea.RodentMaterials = areaDto.RodentMaterials;
                    existingArea.ProductName = areaDto.ProductName;
                    existingArea.ProductDose = areaDto.ProductDose;

                    // Mark as modified to ensure it gets updated
                    db.Update(existingArea);
                }
                else
                {
                    // Add new area
                    var newArea = new RodentArea
                    {
                        Name = areaDto.Name,
                        CebaderoTrampa = areaDto.CebaderoTrampa,
                        Frequency = areaDto.Frequency,
                        RodentConsumption = areaDto.RodentConsumption,
                        RodentResult = areaDto.RodentResult,
                        RodentMaterials = areaDto.RodentMaterials,
                        ProductName = areaDto.ProductName,
                        ProductDose = areaDto.ProductDose,
                        RodentRegister = appointment.RodentRegister,
                    };

                    // Add to context and to collection
                    db.Add(newArea);
                }
            }

            // Make sure we mark the rodent register as modified
            db.Update(appointment.RodentRegister);

            // Save changes
            await db.SaveChangesAsync();

            // Return updated entity
            return Ok();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest($"Error al actualizar: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    [EndpointSummary("Get Rodent of an appointment")]
    [HttpGet("{appointmentid}/rodent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RodentRegister>> FindRodentByAppointmentId(Guid appointmentid)
    {
        var appointment = await db.Set<ProjectAppointment>()
            .Include(p => p.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .FirstOrDefaultAsync(p => p.Id == appointmentid);

        if (appointment == null)
            return NotFound("No se encontró la fecha para el registro de roedores");

        return Ok(appointment.RodentRegister);
    }

    [EndpointSummary("Upload Murino Map")]
    [EndpointDescription("Allows uploading the Murino Map (PNG or PDF)")]
    [HttpPost("{id}/upload-murino-map")]
    public async Task<IActionResult> UploadMurinoMap([FromRoute] Guid id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var projectAppointment = await db.ProjectAppointments.FindAsync(id);
        if (projectAppointment == null)
            return NotFound("Appointment no encontrado");

        // Validar tipo de archivo
        var allowedExtensions = new[] { ".png", ".pdf" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Solo se permiten archivos PNG o PDF");

        try
        {
            // Determinar el tipo de contenido
            var contentType = fileExtension == ".pdf" ? "application/pdf" : "image/png";
            var key = $"mapa-murino-{id}{fileExtension}";
            var bucketName = "perucontrol";

            // Eliminar archivo anterior si existe
            if (!string.IsNullOrEmpty(projectAppointment.MurinoMapKey))
            {
                await s3Service.DeleteObjectAsync(bucketName, projectAppointment.MurinoMapKey);
            }

            // Subir el nuevo archivo
            var result = await s3Service.UploadAsync(key, file.OpenReadStream(), contentType);

            // Actualizar el proyecto
            projectAppointment.MurinoMapKey = result.Key;
            projectAppointment.MurinoMapUrl = result.Url;
            await db.SaveChangesAsync();

            return Ok(new { url = result.Url, type = contentType });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error guardando el archivo: {ex.Message}");
        }
    }

    [EndpointSummary("Get murino map file")]
    [HttpGet("{id}/murino-map")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMurinoMap([FromRoute] Guid id)
    {
        var projectAppointment = await db.ProjectAppointments.FindAsync(id);
        if (projectAppointment == null)
            return NotFound("Appointment no encontrado");

        if (
            string.IsNullOrEmpty(projectAppointment.MurinoMapKey)
            || string.IsNullOrEmpty(projectAppointment.MurinoMapUrl)
        )
            return NotFound("Mapa murino no cargado");

        try
        {
            var bucketName = "perucontrol";
            var stream = await s3Service.DownloadImageAsync(
                projectAppointment.MurinoMapKey,
                bucketName
            );
            if (stream == null)
                return NotFound("Archivo no encontrado en R2");

            // Determinar tipo de contenido basado en la extensión del archivo
            var fileExtension = Path.GetExtension(projectAppointment.MurinoMapKey)
                .ToLowerInvariant();
            var contentType = fileExtension switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                _ => "application/octet-stream", // Tipo genérico si no se reconoce
            };

            // Agregar header personalizado
            Response.Headers.Append("X-Content-Type", contentType);

            var fileName = $"mapa-murino-{id}{fileExtension}";

            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error descargando el archivo: {ex.Message}");
        }
    }

    [HttpGet("mail")]
    public async Task<IActionResult> SendEmailTest()
    {
        var message = new MimeKit.MimeMessage();
        message.From.Add(new MailboxAddress("Fernando Araoz", "fernando.araozu@gmail.com"));
        message.To.Add(new MailboxAddress("", "faraoz@unsa.edu.pe"));
        message.Subject = "Test email";

        var builder = new BodyBuilder();
        builder.HtmlBody = "<h1>Test email</h1>";
        message.Body = builder.ToMessageBody();

        using var client = new MailKit.Net.Smtp.SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 465, true);
        await client.AuthenticateAsync("fernando.araozu@gmail.com", "--app-password-here--");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        return Ok();
    }

    [EndpointSummary("Duplicate data from previous appointment")]
    [EndpointDescription(
        "Duplicates all data from the previous appointment in the same project to the current appointment. This includes operation sheets, rodent registers, certificates, treatment data, and reports."
    )]
    [HttpPost("{id}/duplicate-from-previous")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> DuplicateFromPreviousAppointment(Guid id)
    {
        var result = await appointmentService.DuplicateFromPreviousAppointment(id);

        return result switch
        {
            SuccessResult<string> success => Ok(new { message = success.Data }),
            NotFoundResult<string> notFound => NotFound(new { message = notFound.Message }),
            ErrorResult<string> error => BadRequest(new { message = error.Message }),
            _ => throw new Exception("Unexpected result type"),
        };
    }
}
