using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ProjectOperationSheetController(
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
}
