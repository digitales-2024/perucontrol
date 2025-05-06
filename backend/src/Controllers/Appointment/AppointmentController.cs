using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

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
    OdsTemplateService odsTemplate,
    LibreOfficeConverterService pdfConverterService,
    SvgTemplateService svgTemplateService,
    WordTemplateService wordTemplateService,
    ImageService imageService
) : ControllerBase
{
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
    public async Task<ActionResult> GetAppointmentById(Guid id)
    {
        await appointmentService.GetById(id);
        return Ok();
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

    private (byte[], string) OperationSheetSpreadsheetTemplate(Guid id)
    {
        var appointment = db
            .ProjectAppointments.Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .Include(a => a.Project)
            .ThenInclude(p => p.Services)
            .Include(a => a.ProjectOperationSheet)
            .FirstOrDefault(a => a.Id == id);
        if (appointment == null)
            return (new byte[0], "Evento no encontrado.");

        var business = db.Businesses.FirstOrDefault();
        if (business == null)
            return (new byte[0], "Datos de la empresa no encontrados.");

        var project = appointment.Project;
        var sheet = appointment.ProjectOperationSheet;
        var client = project.Client;

        if (project == null || sheet == null || client == null)
        {
            return (
                [],
                $"Proyecto no encontrado (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        // Use the string properties directly instead of the enum/ToCheckbox
        var r_p = sheet.RodentConsumptionPartial;
        var r_t = sheet.RodentConsumptionTotal;
        var r_d = sheet.RodentConsumptionDeteriorated;
        var r_s = sheet.RodentConsumptionNone;

        var (in_a, in_m, in_b, in_i) =
            sheet.DegreeInsectInfectivity?.ToCheckbox() ?? ("", "", "", "");
        var (ro_a, ro_m, ro_b, ro_i) =
            sheet.DegreeRodentInfectivity?.ToCheckbox() ?? ("", "", "", "");

        var placeholders = new Dictionary<string, string>
        {
            { "{fecha}", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "{hora_ingreso}", appointment.EnterTime?.ToString(@"hh\:mm") ?? "" },
            { "{hora_salida}", appointment.LeaveTime?.ToString(@"hh\:mm") ?? "" },
            { "{razon_social}", client.RazonSocial ?? client.Name },
            { "{direccion}", project.Address },
            { "{giro}", client.BusinessType ?? "" },
            { "{areas_tratadas}", sheet.TreatedAreas },
            { "{servicios}", serviceNamesStr },
            { "{diag_insectos}", sheet.Insects },
            { "{diag_roedores}", sheet.Rodents },
            { "{r_p}", r_p },
            { "{r_t}", r_t },
            { "{r_d}", r_d },
            { "{r_s}", r_s },
            { "{diag_otros}", sheet.OtherPlagues },
            { "{ma_manual}", sheet.AspersionManual ? "x" : "" },
            { "{ma_motor}", sheet.AspercionMotor ? "x" : "" },
            { "{ne_f}", sheet.NebulizacionFrio ? "x" : "" },
            { "{ne_c}", sheet.NebulizacionCaliente ? "x" : "" },
            { "{cebaderos}", sheet.ColocacionCebosCebaderos },
            { "{cebos_total}", sheet.NumeroCeboTotal },
            { "{cebos_rep}", sheet.NumeroCeboRepuestos },
            { "{planchas}", sheet.NroPlanchasPegantes },
            { "{jaulas}", sheet.NroJaulasTomahawk },
            { "{insecticida_1}", sheet.Insecticide },
            { "{insecticida_1_cantidad}", sheet.InsecticideAmount },
            { "{insecticida_2}", sheet.Insecticide2 },
            { "{insecticida_2_cantidad}", sheet.InsecticideAmount2 },
            { "{rodenticida}", sheet.Rodenticide },
            { "{rodenticida_cantidad}", sheet.RodenticideAmount },
            { "{desinfectante}", sheet.Desinfectant },
            { "{desinfectante_cantidad}", sheet.DesinfectantAmount },
            { "{otros_productos}", sheet.OtherProducts },
            { "{otros_productos_cantidad}", sheet.OtherProductsAmount },
            { "{in_a}", in_a },
            { "{in_m}", in_m },
            { "{in_b}", in_b },
            { "{in_i}", in_i },
            { "{ro_a}", ro_a },
            { "{ro_m}", ro_m },
            { "{ro_b}", ro_b },
            { "{ro_i}", ro_i },
            { "{personal_1}", sheet.Staff1 },
            { "{personal_2}", sheet.Staff2 },
            { "{personal_3}", sheet.Staff3 },
            { "{personal_4}", sheet.Staff4 },
            { "{observaciones}", sheet.Observations },
            { "{recomendaciones}", sheet.Recommendations },
            { "{direccion_perucontrol}", business.Address },
            { "{celulares_perucontrol}", business.Phones },
            { "{correo_perucontrol}", business.Email },
        };
        var fileBytes = odsTemplate.GenerateOdsFromTemplate(
            placeholders,
            "Templates/ficha_operaciones_new.ods"
        );
        return (fileBytes, "");
    }

    private (
        ProjectAppointment? appointment,
        Business? business,
        string? error,
        string fum,
        string inse,
        string ratiz,
        string infec,
        string cis1,
        string cis2
    ) GetCertificateData(Guid id)
    {
        var projectAppointment = db
            .ProjectAppointments.Include(pa => pa.Services)
            .Include(pa => pa.Certificate)
            .Include(pa => pa.ProjectOperationSheet)
            .Include(pa => pa.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefault(pa => pa.Id == id);

        if (projectAppointment is null)
            return (null, null, "No se encontró el certificado.", "", "", "", "", "", "");

        var business = db.Businesses.FirstOrDefault();
        if (business == null)
            return (
                projectAppointment,
                null,
                "Datos de la empresa no encontrados.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        if (projectAppointment.Certificate.ExpirationDate is null)
            return (
                projectAppointment,
                business,
                "La fecha de vencimiento no está establecida.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        if (projectAppointment.ActualDate is null)
            return (
                projectAppointment,
                business,
                "Este servicio no ha sido terminado.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        var sheetTreatedAreas = projectAppointment.ProjectOperationSheet.TreatedAreas;
        if (string.IsNullOrEmpty(sheetTreatedAreas))
            return (
                projectAppointment,
                business,
                "Las áreas tratadas no se ingresaron en la ficha de operaciones.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        var (fum, inse, ratiz, infec, cis1, cis2) = ("", "", "", "", "", "");
        foreach (var service in projectAppointment.Services)
        {
            switch (service.Name)
            {
                case "Fumigación":
                    fum = "X";
                    break;
                case "Desinfección":
                    inse = "X";
                    break;
                case "Desinsectación":
                    ratiz = "X";
                    break;
                case "Desratización":
                    infec = "X";
                    break;
                case "Limpieza de tanque":
                    cis1 = "X";
                    cis2 = "X";
                    break;
            }
        }

        return (projectAppointment, business, null, fum, inse, ratiz, infec, cis1, cis2);
    }

    [EndpointSummary("Generate Operations Sheet excel")]
    [HttpPost("{id}/gen-operations-sheet/excel")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheetExcel(Guid id)
    {
        var (fileBytes, err) = OperationSheetSpreadsheetTemplate(id);
        if (err != "")
        {
            return BadRequest(err);
        }

        return File(
            fileBytes,
            "application/vnd.oasis.opendocument.spreadsheet",
            "ficha_operaciones.ods"
        );
    }

    [EndpointSummary("Generate Operations Sheet pdf")]
    [HttpPost("{id}/gen-operations-sheet/pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheetPdf(Guid id)
    {
        var (fileBytes, odsErr) = OperationSheetSpreadsheetTemplate(id);
        if (odsErr != "")
        {
            return BadRequest(odsErr);
        }

        var (pdfBytes, pdfErr) = pdfConverterService.convertToPdf(fileBytes, "ods");
        if (pdfErr != "")
        {
            return BadRequest(pdfErr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "ficha_operaciones.pdf");
    }

    [EndpointSummary("Update an operation sheet")]
    [HttpPatch("{appointmentid}/operation-sheet")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectOperationSheet>> UpdateOperationSheet(
        Guid appointmentid,
        [FromBody] ProjectOperationSheetPatchDTO updateDTO
    )
    {
        var operationSheet = await db.Set<ProjectOperationSheet>()
            .Include(x => x.ProjectAppointment)
            .FirstOrDefaultAsync(x => x.ProjectAppointment.Id == appointmentid);

        if (operationSheet == null)
        {
            return NotFound("No se encontró una ficha de operaciones para la cita especificada.");
        }

        // Aplicar los cambios al objeto existente
        updateDTO.ApplyPatch(operationSheet);

        // Guardar los cambios en la base de datos
        db.Update(operationSheet);
        await db.SaveChangesAsync();

        return Ok(operationSheet);
    }

    [EndpointSummary("Find operation sheet by project ID")]
    [HttpGet("operation-sheet/by-project/{projectId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectOperationSheet>> FindByIdProject(Guid projectId)
    {
        // Buscar la ficha operativa asociada al ProjectAppointment del proyecto
        var operationSheet = await db.Set<ProjectOperationSheet>()
            .Include(x => x.ProjectAppointment) // Incluir la relación con ProjectAppointment
            .ThenInclude(pa => pa.Project) // Incluir la relación con el Project
            .FirstOrDefaultAsync(x => x.ProjectAppointment.Project.Id == projectId);

        if (operationSheet == null)
        {
            return NotFound(
                "No se encontró una ficha de operaciones para el proyecto especificado."
            );
        }

        return Ok(operationSheet);
    }

    [EndpointSummary("Update a certtificate")]
    [HttpPatch("{appointmentid}/certificate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectOperationSheet>> UpdateCertificate(
        Guid appointmentid,
        [FromBody] AppointmentCertificatePatchDTO updateDTO
    )
    {
        var certificate = await db.Set<Certificate>()
            .Include(c => c.ProjectAppointment)
            .FirstOrDefaultAsync(c => c.ProjectAppointment.Id == appointmentid);

        if (certificate == null)
        {
            return NotFound("No se encontró una ficha de operaciones para la cita especificada.");
        }

        // Aplicar los cambios al objeto existente
        updateDTO.ApplyPatch(certificate);

        // Guardar los cambios en la base de datos
        db.Update(certificate);
        await db.SaveChangesAsync();

        return Ok(certificate);
    }

    [EndpointSummary("Get Certificate of an appointment")]
    [HttpGet("{appointmentid}/certificate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Certificate>> FindCertificateByAppointmentId(Guid appointmentid)
    {
        var appointment = await db.Set<ProjectAppointment>()
            .Include(p => p.Certificate)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("No se encontró la Cita para el Certificado");

        return Ok(appointment.Certificate);
    }

    [EndpointSummary("Generate Certificate Word")]
    [HttpPost("{id}/certificate/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateCertificateWord(Guid id)
    {
        var (projectAppointment, business, error, fum, inse, ratiz, infec, cis1, cis2) =
            GetCertificateData(id);
        if (error != null)
            return BadRequest(error);
        if (projectAppointment == null)
            return NotFound(error);
        if (business == null)
            return NotFound(error);

        var project = projectAppointment.Project;
        var sheet = projectAppointment.ProjectOperationSheet;
        var client = project.Client;
        var certificate = projectAppointment.Certificate;

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var placeholders = new Dictionary<string, string>
        {
            { "{client_name}", client.Name },
            { "{fecha}", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "{razon_social}", client.RazonSocial ?? "-" },
            { "{client_address}", project.Address },
            { "{client_bysiness_type}", client.BusinessType ?? "" },
            { "{client_area}", sheet.TreatedAreas },
            { "{servicios}", serviceNamesStr },
            { "{fumigacion}", fum },
            { "{desinsectacion}", ratiz },
            { "{desratizacion}", infec },
            { "{desinfeccion}", inse },
            { "{tanques_elevados}", cis1 },
            { "{tanques_cisternas}", cis2 },
            { "cert_creation_date", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "client_expiration_date", certificate.ExpirationDate?.ToString("dd/MM/yyyy") ?? "-" },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/certificado_plantilla_word.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "certificado_servicio.docx"
        );
    }

    [EndpointSummary("Generate Certificate PDF")]
    [EndpointDescription(
        "Generates the Certificate in PDF format for an Appointment. The id parameter is the Appointment ID."
    )]
    [HttpPost("{id}/certificate/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateCertificatePdf(Guid id)
    {
        var (projectAppointment, business, error, fum, inse, ratiz, infec, cis1, cis2) =
            GetCertificateData(id);
        if (error != null)
            return BadRequest(error);
        if (projectAppointment == null)
            return NotFound(error);
        if (business == null)
            return NotFound(error);

        var certificate = projectAppointment.Certificate;
        var project = projectAppointment.Project;
        var client = project.Client;
        var sheetTreatedAreas = projectAppointment.ProjectOperationSheet.TreatedAreas;

        // load signatures as base64 strings
        var signature1 = imageService.GetImageAsBase64("signature1.png");
        var signature2 = imageService.GetImageAsBase64("signature2.png");
        if (signature1 is null || signature2 is null)
        {
            return BadRequest("No se configuraron las firmas de certificado.");
        }

        var placeholders = new Dictionary<string, string>
        {
            { "{nombre_cliente}", client.RazonSocial ?? client.Name },
            { "{direccion_cliente}", project.Address },
            { "{giro_cliente}", client.BusinessType ?? "" },
            { "{servicio_area}", sheetTreatedAreas ?? "" },
            { "{fecha_servicio}", projectAppointment.ActualDate?.ToString("dd/MM/yyyy") ?? "" },
            { "{fecha_vencimiento}", certificate.ExpirationDate?.ToString("dd/MM/yyyy") ?? "" },
            { "{cert_n}", projectAppointment.CertificateNumber?.ToString() ?? "" },
            { "{fum}", fum },
            { "{inse}", inse },
            { "{ratiz}", ratiz },
            { "{infec}", infec },
            { "{cis1}", cis1 },
            { "{cis2}", cis2 },
            { "{constancia_hab}", business.DigesaNumber },
            { "{peruc_ruc}", business.RUC },
            { "{perucontrol_telefonos}", business.Phones },
            { "{perucontrol_correo}", business.Email },
            { "{perucontrol_pagina}", "www.perucontrol.com" },
            { "{imagen_firma_1}", $"data:image/png;base64,{signature1}" },
            { "{imagen_firma_2}", $"data:image/png;base64,{signature2}" },
        };

        var svgBytes = svgTemplateService.GenerateSvgFromTemplate(
            placeholders,
            "Templates/certificado_plantilla.svg"
        );

        var (pdfBytes, errorStr) = pdfConverterService.convertToPdf(svgBytes, "svg");

        if (errorStr != "")
        {
            return BadRequest(errorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "certificate.pdf");
    }

    [EndpointSummary("Get all certificates")]
    [HttpGet("allCertificates")]
    [ProducesResponseType<IEnumerable<CertificateGet>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CertificateGet>>> GetAllCertificates()
    {
        var certificates = await db
            .Certificates.Include(c => c.ProjectAppointment)
            .ThenInclude(pa => pa.Services) // Incluye los servicios directamente del ProjectAppointment
            .Include(c => c.ProjectAppointment)
            .ThenInclude(pa => pa.Project)
            .ThenInclude(p => p.Client) // Incluye el cliente del proyecto
            .Where(c => c.ProjectAppointment.CertificateNumber != null)
            .ToListAsync();

        var result = certificates.Select(a => new CertificateGet
        {
            Id = a.Id,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            ModifiedAt = a.ModifiedAt,
            ProjectAppointment = a.ProjectAppointment,
            ProjectAppointmentId = a.ProjectAppointmentId,
            ExpirationDate = a.ExpirationDate ?? DateTime.MinValue,
            Project = a.ProjectAppointment.Project,
            Client = a.ProjectAppointment.Project.Client,
            Services = a.ProjectAppointment.Services,
        });

        return Ok(result);
    }

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

        var (pdfBytes, errorStr) = pdfConverterService.convertToPdf(odsBytes, "ods");

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
            return NotFound("No se encontró la Cita para el registro de roedores");

        return Ok(appointment.RodentRegister);
    }
}
