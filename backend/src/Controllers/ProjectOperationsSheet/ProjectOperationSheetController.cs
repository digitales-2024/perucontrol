using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ProjectOperationSheetController(DatabaseContext db)
    : AbstractCrudController<ProjectOperationSheet, ProjectOperationSheetCreateDTO, ProjectOperationSheetPatchDTO>(db)
{
    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<ProjectOperationSheet>> Create([FromBody] ProjectOperationSheetCreateDTO createDTO)
    {
        /* var project = await _context.Projects.AnyAsync(p => p.Id == createDTO.ProjectId);
        if (!project)
        {
            return BadRequest("El project no existe");
        } */
        
        var project = await _context.Set<Project>().FindAsync(createDTO.ProjectId);
        if (project == null)
            return NotFound("Proyecto no encontrado");

        if (createDTO.OperationDate.HasValue)
        {
            createDTO.OperationDate = createDTO.OperationDate.Value.ToUniversalTime();
        }

        var entity = createDTO.MapToEntity();
        entity.Id = Guid.NewGuid();

        entity.Project = project;

        // Create the Project Operation Sheet
        _context.Add(entity);
        await _context.SaveChangesAsync();

        return Created();
    }

    [EndpointSummary("Partial edit one by id")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<IActionResult> Patch(Guid id, [FromBody] ProjectOperationSheetPatchDTO patchDTO)
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
}
