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
    DatabaseContext db,
    OdsTemplateService odsTemplate,
    PDFConverterService pDFConverterService
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
            .Appointments.Where(a => a.DueDate >= start && a.DueDate <= end)
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
            })
        );
    }

    private (byte[], string) OperationSheetSpreadsheetTemplate(Guid id)
    {
        var appointment = db
            .Appointments.Include(a => a.Project)
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
                new byte[0],
                $"Proyecto no encontrado (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var (r_p, r_t, r_d, r_s) = sheet.RodentConsumption?.ToCheckbox() ?? ("", "", "", "");
        var (in_a, in_m, in_b, in_i) =
            sheet.DegreeInsectInfectivity?.ToCheckbox() ?? ("", "", "", "");
        var (ro_a, ro_m, ro_b, ro_i) =
            sheet.DegreeRodentInfectivity?.ToCheckbox() ?? ("", "", "", "");

        var placeholders = new Dictionary<string, string>
        {
            { "{fecha}", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "{hora_ingreso}", sheet.EnterTime.ToString(@"hh\:mm") },
            { "{hora_salida}", sheet.LeaveTime.ToString(@"hh\:mm") },
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
            { "{insecticida_2_cantidad}", sheet.Insecticide2 },
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

        var (pdfBytes, pdfErr) = pDFConverterService.convertToPdf(fileBytes, "ods");
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

    [EndpointSummary("Update a certfificate")]
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

    [EndpointSummary("Generate Certificate excel")]
    [HttpPost("{id}/certificate/excel")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateCertificateExcel(Guid id)
    {
        // FIXME: use a different template
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

    [EndpointSummary("Generate Certificate PDF")]
    [HttpPost("{id}/certificate/pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateCertificatePdf(Guid id)
    {
        // FIXME: use a different template
        var (fileBytes, odsErr) = OperationSheetSpreadsheetTemplate(id);
        if (odsErr != "")
        {
            return BadRequest(odsErr);
        }

        var (pdfBytes, pdfErr) = pDFConverterService.convertToPdf(fileBytes, "ods");
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
}
