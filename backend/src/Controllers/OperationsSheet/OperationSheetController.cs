using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

[Authorize]
public class OperationSheetController(
    DatabaseContext db,
    OperationSheetService operationSheetService
)
    : AbstractCrudController<
        ProjectOperationSheet,
        OperationSheetCreateDTO,
        OperationSheetPatchDTO
    >(db)
{
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
        if (entity.Status == OperationSheetStatus.Created)
            entity.Status = OperationSheetStatus.Started;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Get Operation Sheets by table")]
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
        if (operationSheet.Status == OperationSheetStatus.Created)
            operationSheet.Status = OperationSheetStatus.Started;

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
}
