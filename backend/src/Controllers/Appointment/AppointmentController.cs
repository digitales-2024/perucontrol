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
    ExcelTemplateService excelTemplate,
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
                OrderNumber = a.OrderNumber,
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

    [EndpointSummary("Generate Operations Sheet excel")]
    [HttpPost("{id}/gen-operations-sheet/excel")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheetExcel(
        Guid id,
        [FromBody] ProjectOperationSheetExport export
    )
    {
        var appointment = db
            .Appointments.Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefault(a => a.Id == id);
        if (appointment == null)
            return NotFound("Evento no encontrado.");

        var project = appointment.Project;

        if (project == null)
        {
            return NotFound(
                $"Proyecto no encontrado (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var placeholders = new Dictionary<string, string>
        {
            { "{{fecha_op}}", export.OperationDate },
            { "{{hora_ingreso}}", export.EnterTime },
            { "{{hora_salida}}", export.LeaveTime },
            { "{{razon_social}}", project.Client.RazonSocial ?? "" },
            { "{{direccion}}", project.Address },
            { "{{giro_empresa}}", project.Client.BusinessType },
            { "{{condicion_sanitaria}}", export.SanitaryCondition },
            { "{{areas_tratadas}}", export.TreatedAreas },
            { "{{servicio}}", serviceNamesStr },
            { "{{certificado_nro}}", "--prov--" },
            { "{{insectos}}", export.Insects },
            { "{{roedores}}", export.Rodents },
            { "{{otros}}", export.OtherPlagues },
            { "{{insecticida}}", export.Insecticide },
            { "{{insecticida_2}}", export.Insecticide2 },
            { "{{rodenticida}}", export.Rodenticide },
            { "{{desinfectante}}", export.Desinfectant },
            { "{{producto_otros}}", export.OtherProducts },
            { "{{insecticida_cantidad}}", export.InsecticideAmount },
            { "{{insecticida_cantidad_2}}", export.InsecticideAmount2 },
            { "{{rodenticida_cantidad}}", export.RodenticideAmount },
            { "{{desinfectante_cantidad}}", export.DesinfectantAmount },
            { "{{producto_otros_cantidad}}", export.OtherProductsAmount },
            { "{{monitoreo_desratizacion_1}}", export.RatExtermination1 },
            { "{{monitoreo_desratizacion_2}}", export.RatExtermination2 },
            { "{{monitoreo_desratizacion_3}}", export.RatExtermination3 },
            { "{{monitoreo_desratizacion_4}}", export.RatExtermination4 },
            { "{{personal_1}}", export.Staff1 },
            { "{{personal_2}}", export.Staff2 },
            { "{{personal_3}}", export.Staff3 },
            { "{{personal_4}}", export.Staff4 },
            { "{{aspersion_manual}}", export.aspersionManual ? "Sí" : "No" },
            { "{{aspersion_motor}}", export.aspersionMotor ? "Sí" : "No" },
            { "{{nebulizacion_frio}}", export.nebulizacionFrio ? "Sí" : "No" },
            { "{{nebulizacion_caliente}}", export.nebulizacionCaliente ? "Sí" : "No" },
            { "{{nebulizacion_cebos_total}}", export.nebulizacionCebosTotal ? "Sí" : "No" },
            { "{{colocacion_cebos_cebaderos}}", export.colocacionCebosCebaderos ? "Sí" : "No" },
            { "{{colocacion_cebos_repuestos}}", export.colocacionCebosRepuestos ? "Sí" : "No" },
            { "{{observations}}", export.observations },
            { "{{recommendations}}", export.recommendations },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/ficha_operaciones.xlsx"
        );
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "quotation.xlsx"
        );
    }

    [EndpointSummary("Generate Operations Sheet pdf")]
    [HttpPost("{id}/gen-operations-sheet/pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheetPdf(
        Guid id,
        [FromBody] ProjectOperationSheetExport export
    )
    {
        var appointment = db
            .Appointments.Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefault(a => a.Id == id);
        if (appointment == null)
            return NotFound("Evento no encontrado.");

        var project = appointment.Project;

        if (project == null)
        {
            return NotFound(
                $"Proyecto no encontrado (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var placeholders = new Dictionary<string, string>
        {
            { "{{fecha_op}}", export.OperationDate },
            { "{{hora_ingreso}}", export.EnterTime },
            { "{{hora_salida}}", export.LeaveTime },
            { "{{razon_social}}", project.Client.RazonSocial ?? "" },
            { "{{direccion}}", project.Address },
            { "{{giro_empresa}}", project.Client.BusinessType },
            { "{{condicion_sanitaria}}", export.SanitaryCondition },
            { "{{areas_tratadas}}", export.TreatedAreas },
            { "{{servicio}}", serviceNamesStr },
            { "{{certificado_nro}}", "--prov--" },
            { "{{insectos}}", export.Insects },
            { "{{roedores}}", export.Rodents },
            { "{{otros}}", export.OtherPlagues },
            { "{{insecticida}}", export.Insecticide },
            { "{{insecticida_2}}", export.Insecticide2 },
            { "{{rodenticida}}", export.Rodenticide },
            { "{{desinfectante}}", export.Desinfectant },
            { "{{producto_otros}}", export.OtherProducts },
            { "{{insecticida_cantidad}}", export.InsecticideAmount },
            { "{{insecticida_cantidad_2}}", export.InsecticideAmount2 },
            { "{{rodenticida_cantidad}}", export.RodenticideAmount },
            { "{{desinfectante_cantidad}}", export.DesinfectantAmount },
            { "{{producto_otros_cantidad}}", export.OtherProductsAmount },
            { "{{monitoreo_desratizacion_1}}", export.RatExtermination1 },
            { "{{monitoreo_desratizacion_2}}", export.RatExtermination2 },
            { "{{monitoreo_desratizacion_3}}", export.RatExtermination3 },
            { "{{monitoreo_desratizacion_4}}", export.RatExtermination4 },
            { "{{personal_1}}", export.Staff1 },
            { "{{personal_2}}", export.Staff2 },
            { "{{personal_3}}", export.Staff3 },
            { "{{personal_4}}", export.Staff4 },
            { "{{aspersion_manual}}", export.aspersionManual ? "Sí" : "No" },
            { "{{aspersion_motor}}", export.aspersionMotor ? "Sí" : "No" },
            { "{{nebulizacion_frio}}", export.nebulizacionFrio ? "Sí" : "No" },
            { "{{nebulizacion_caliente}}", export.nebulizacionCaliente ? "Sí" : "No" },
            { "{{nebulizacion_cebos_total}}", export.nebulizacionCebosTotal ? "Sí" : "No" },
            { "{{colocacion_cebos_cebaderos}}", export.colocacionCebosCebaderos ? "Sí" : "No" },
            { "{{colocacion_cebos_repuestos}}", export.colocacionCebosRepuestos ? "Sí" : "No" },
            { "{{observations}}", export.observations },
            { "{{recommendations}}", export.recommendations },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/ficha_operaciones.xlsx"
        );

        var (pdfBytes, errorStr) = pDFConverterService.convertToPdf(fileBytes, "xlsx");

        if (errorStr != "")
        {
            return BadRequest(errorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "ficha_operaciones.pdf");
    }

    [EndpointSummary("Generate pdf test")]
    [HttpPost("/gen-operations-sheet/pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheetPdf2(
    )
    {
        using var ms = new MemoryStream();

        using (var fs = new FileStream("Templates/ficha_operaciones_new.ods", FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        var (pdfBytes, errorStr) = pDFConverterService.convertToPdf(ms.ToArray(), "xlsx");

        if (errorStr != "")
        {
            return BadRequest(errorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "ficha_operaciones.pdf");
    }
}
