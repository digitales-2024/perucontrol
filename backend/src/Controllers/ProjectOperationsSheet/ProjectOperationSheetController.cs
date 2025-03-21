using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ProjectOperationSheetController(DatabaseContext db)
    : AbstractCrudController<
        ProjectOperationSheet,
        ProjectOperationSheetCreateDTO,
        ProjectOperationSheetPatchDTO
    >(db)
{
    /*[EndpointSummary("Create or Update")]*/
    /*[HttpPost("create-or-update")]*/
    /*[ProducesResponseType(StatusCodes.Status201Created)]*/
    /*[ProducesResponseType(StatusCodes.Status200OK)]*/
    /*[ProducesResponseType(StatusCodes.Status400BadRequest)]*/
    /*public async Task<ActionResult<ProjectOperationSheet>> CreateOrUpdate(*/
    /*    [FromBody] ProjectOperationSheetCreateDTO createDTO*/
    /*)*/
    /*{*/
    /*    var project = await _context.Set<Project>().FindAsync(createDTO.ProjectId);*/
    /*    if (project == null)*/
    /*        return NotFound("Proyecto no encontrado");*/
    /**/
    /*    if (createDTO.OperationDate.HasValue)*/
    /*    {*/
    /*        createDTO.OperationDate = createDTO.OperationDate.Value.ToUniversalTime();*/
    /*    }*/
    /**/
    /*    // Verificar si ya existe una ficha operativa para este proyecto*/
    /*    var existingEntity = await _context*/
    /*        .Set<ProjectOperationSheet>()*/
    /*        .FirstOrDefaultAsync(x => x.Project.Id == createDTO.ProjectId);*/
    /**/
    /*    if (existingEntity != null)*/
    /*    {*/
    /*        // Actualizar la ficha operativa existente*/
    /*        existingEntity = createDTO.MapToEntity(existingEntity);*/
    /*        _context.Update(existingEntity);*/
    /*        await _context.SaveChangesAsync();*/
    /*        return Ok(existingEntity);*/
    /*    }*/
    /**/
    /*    // Crear una nueva ficha operativa*/
    /*    var entity = createDTO.MapToEntity();*/
    /*    entity.Id = Guid.NewGuid();*/
    /*    entity.Project = project;*/
    /**/
    /*    _context.Add(entity);*/
    /*    await _context.SaveChangesAsync();*/
    /**/
    /*    return CreatedAtAction(nameof(CreateOrUpdate), new { id = entity.Id }, entity);*/
    /*}*/

    [EndpointSummary("Partial edit one by id")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<IActionResult> Patch(
        Guid id,
        [FromBody] ProjectOperationSheetPatchDTO patchDTO
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

    /*[EndpointSummary("Find operation sheet by project ID")]*/
    /*[HttpGet("by-project/{projectId}")]*/
    /*[ProducesResponseType(StatusCodes.Status200OK)]*/
    /*[ProducesResponseType(StatusCodes.Status404NotFound)]*/
    /*public async Task<ActionResult<ProjectOperationSheet>> FindByIdProject(Guid projectId)*/
    /*{*/
    /*    // Buscar la ficha operativa asociada al proyecto*/
    /*    var operationSheet = await _context*/
    /*        .Set<ProjectOperationSheet>()*/
    /*        .Include(x => x.Project) // Incluir la relación con el proyecto*/
    /*        .FirstOrDefaultAsync(x => x.Project.Id == projectId);*/
    /**/
    /*    if (operationSheet == null)*/
    /*    {*/
    /*        return NotFound("No se encontró una ficha operativa para el proyecto especificado.");*/
    /*    }*/
    /**/
    /*    return Ok(operationSheet);*/
    /*}*/
}
