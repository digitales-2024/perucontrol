using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class OperationSheetController(
    DatabaseContext db,
    OperationSheetService operationSheetService,
    OdsTemplateService odsTemplate,
    LibreOfficeConverterService pdfConverterService,
    EmailService emailService,
    WhatsappService whatsappService
)
    : AbstractCrudController<
        ProjectOperationSheet,
        OperationSheetCreateDTO,
        OperationSheetPatchDTO
    >(db)
{
    private readonly EmailService _emailService = emailService;
    private readonly WhatsappService _whatsappService = whatsappService;

    [EndpointSummary("Partial edit one by id")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<IActionResult> Patch(
        Guid id,
        [FromBody] OperationSheetPatchDTO patchDTO
    )
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        patchDTO.ApplyPatch(entity);
        if (entity.Status == ResourceStatus.Created)
            entity.Status = ResourceStatus.Started;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Get Operation Sheets for table")]
    [EndpointDescription(
        "This endpoint returns a list of Appointments, sorted by most recent, and only ones with status != Created"
    )]
    [HttpGet("for-table")]
    public async Task<IList<GetOperationSheetsForTableOutDto>> GetOperationSheetsForTable()
    {
        var list = await operationSheetService.GetOperationSheetsForTable();
        return list;
    }

    [EndpointSummary("Get Operation Sheets for creation")]
    [EndpointDescription(
        "Returns a list of services and their appointments for creation, where the operation sheet has status == Created"
    )]
    [HttpGet("for-creation")]
    public async Task<IList<GetOperationSheetsForCreationOutDto>> GetOperationSheetsForCreation()
    {
        var list = await operationSheetService.GetOperationSheetsForCreation();
        return list;
    }

    [EndpointSummary("Mark an Operation Sheet as 'Started'")]
    [EndpointDescription(
        "Marks the selected operation sheet as 'Started', thus showing it in its table UI"
    )]
    [HttpPatch("{operationSheetId}/mark-started")]
    public async Task<ActionResult> MarkOperationSheetCreated(Guid operationSheetId)
    {
        await operationSheetService.MarkOperationSheetCreated(operationSheetId);
        return Ok();
    }

    [EndpointSummary("Update an operation sheet by appointment id")]
    [HttpPatch("by-appointment/{appointmentid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectOperationSheet>> UpdateOperationSheetByAppointment(
        Guid appointmentid,
        [FromBody] OperationSheetPatchDTO updateDTO
    )
    {
        var operationSheet = await _dbSet
            .Include(x => x.ProjectAppointment)
            .FirstOrDefaultAsync(x => x.ProjectAppointment.Id == appointmentid);

        if (operationSheet == null)
        {
            return NotFound("No se encontró una ficha de operaciones para la fecha especificada.");
        }

        if (updateDTO.EnterTime is not null)
        {
            operationSheet.ProjectAppointment.EnterTime = updateDTO.EnterTime;
        }
        if (updateDTO.LeaveTime is not null)
        {
            operationSheet.ProjectAppointment.LeaveTime = updateDTO.LeaveTime;
        }
        if (operationSheet.Status == ResourceStatus.Created)
            operationSheet.Status = ResourceStatus.Started;

        // Aplicar los cambios al objeto existente
        updateDTO.ApplyPatch(operationSheet);

        // Guardar los cambios en la base de datos
        _context.Update(operationSheet);
        await _context.SaveChangesAsync();

        return Ok(operationSheet);
    }

    [EndpointSummary("Find operation sheet by project ID")]
    [HttpGet("by-project/{projectId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectOperationSheet>> FindByProjectId(Guid projectId)
    {
        // Buscar la ficha operativa asociada al ProjectAppointment del proyecto
        var operationSheet = await _dbSet
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

    private (byte[], string) OperationSheetSpreadsheetTemplate(Guid id)
    {
        var appointment = _context
            .ProjectAppointments.Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .Include(a => a.Project)
            .ThenInclude(p => p.Services)
            .Include(a => a.ProjectOperationSheet)
            .FirstOrDefault(a => a.Id == id);
        if (appointment == null)
            return (new byte[0], "Evento no encontrado.");

        var business = _context.Businesses.FirstOrDefault();
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
            { "{hora_ingreso}", appointment.EnterTime?.ToString(@"hh\:mm tt") ?? "" },
            { "{hora_salida}", appointment.LeaveTime?.ToString(@"hh\:mm tt") ?? "" },
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

    private (byte[]? PdfBytes, ActionResult? ErrorResult) GenerateOperationsSheetPdfBytes(Guid id)
    {
        var (odsBytes, odsErr) = OperationSheetSpreadsheetTemplate(id);
        if (!string.IsNullOrEmpty(odsErr))
        {
            if (
                odsErr.Contains("no encontrado", StringComparison.OrdinalIgnoreCase)
                || odsErr.Contains("not found", StringComparison.OrdinalIgnoreCase)
            )
                return (null, new NotFoundObjectResult(odsErr));
            return (null, new BadRequestObjectResult(odsErr));
        }
        if (odsBytes == null || odsBytes.Length == 0)
        {
            return (
                null,
                new BadRequestObjectResult(
                    "Error generando la plantilla ODS de la ficha de operaciones."
                )
            );
        }

        var scaledFileBytes = odsTemplate.ScaleOds(odsBytes, 100);

        var (pdfBytes, pdfErr) = pdfConverterService.ConvertToPdf(scaledFileBytes, "ods");
        if (!string.IsNullOrEmpty(pdfErr))
        {
            return (null, new BadRequestObjectResult(pdfErr));
        }
        if (pdfBytes == null)
        {
            return (
                null,
                new BadRequestObjectResult("Error convirtiendo la ficha de operaciones a PDF.")
            );
        }
        return (pdfBytes, null);
    }

    [EndpointSummary("Generate Operations Sheet excel")]
    [HttpGet("{id}/excel")]
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
    [HttpGet("{id}/pdf")]
    public ActionResult GenerateOperationsSheetPdf(Guid id)
    {
        var (pdfBytes, errorResult) = GenerateOperationsSheetPdfBytes(id);
        if (errorResult != null)
        {
            return errorResult;
        }
        return File(pdfBytes!, "application/pdf", "ficha_operaciones.pdf");
    }

    [EndpointSummary("Send Operations Sheet PDF via Email")]
    [HttpPost("{id}/email-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendOperationsSheetPdfViaEmail(
        Guid id,
        [FromQuery]
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
            string email
    )
    {
        var (pdfBytes, errorResult) = GenerateOperationsSheetPdfBytes(id);
        if (errorResult != null)
        {
            return errorResult;
        }

        var (ok, serviceError) = await _emailService.SendEmailAsync(
            to: email,
            subject: "FICHA DE OPERACIONES DE PERUCONTROL.COM EIRL",
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
                    FileName = "ficha_operaciones_perucontrol.pdf",
                    Content = new MemoryStream(pdfBytes!),
                    ContentType = "application/pdf",
                },
            ]
        );

        if (!ok)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                serviceError ?? "Error enviando el correo con la ficha de operaciones."
            );
        }

        return Ok();
    }

    [EndpointSummary("Send Operations Sheet PDF via WhatsApp")]
    [HttpPost("{id}/whatsapp-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendOperationsSheetPdfViaWhatsapp(
        Guid id,
        [FromQuery] [System.ComponentModel.DataAnnotations.Required] string phoneNumber
    )
    {
        var (pdfBytes, errorResult) = GenerateOperationsSheetPdfBytes(id);
        if (errorResult != null)
        {
            return errorResult;
        }

        await _whatsappService.SendWhatsappServiceMessageAsync(
            fileBytes: pdfBytes!,
            contentSid: "HXc9bee467c02d529435b97f7694ad3b87",
            fileName: "ficha_operaciones.pdf",
            phoneNumber: phoneNumber
        );

        return Ok();
    }
}
