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
// DbContext _context
) : ControllerBase
{
    // private readonly DbContext _context = _context;
    private readonly DbContext _context = db;

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
        Guid id
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
        Guid id
    )
    {
        using var ms = new MemoryStream();

        using (
            var fs = new FileStream(
                "Templates/ficha_operaciones_new.ods",
                FileMode.Open,
                FileAccess.Read
            )
        )
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

    [EndpointSummary("Update an existing operation sheet")]
    [HttpPost("operation-sheet")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectOperationSheet>> UpdateOperationSheet(
        [FromBody] ProjectOperationSheetPatchDTO updateDTO
    )
    {
        // Buscar la ficha operativa asociada al ProjectAppointment
        var operationSheet = await _context
            .Set<ProjectOperationSheet>()
            .Include(x => x.ProjectAppointment) // Incluir la relación con ProjectAppointment
            .FirstOrDefaultAsync(x => x.ProjectAppointment.Id == updateDTO.ProjectAppointmentId);

        if (operationSheet == null)
        {
            return NotFound("No se encontró una ficha operativa para la cita especificada.");
        }

        // Aplicar los cambios al objeto existente
        updateDTO.ApplyPatch(operationSheet);

        // Guardar los cambios en la base de datos
        _context.Update(operationSheet);
        await _context.SaveChangesAsync();

        return Ok(operationSheet);
    }

    [EndpointSummary("Find operation sheet by project ID")]
    [HttpGet("operation-sheet/by-project/{projectId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectOperationSheet>> FindByIdProject(Guid projectId)
    {
        // Buscar la ficha operativa asociada al ProjectAppointment del proyecto
        var operationSheet = await _context
            .Set<ProjectOperationSheet>()
            .Include(x => x.ProjectAppointment) // Incluir la relación con ProjectAppointment
            .ThenInclude(pa => pa.Project) // Incluir la relación con el Project
            .FirstOrDefaultAsync(x => x.ProjectAppointment.Project.Id == projectId);

        if (operationSheet == null)
        {
            return NotFound("No se encontró una ficha operativa para el proyecto especificado.");
        }

        return Ok(operationSheet);
    }
}
