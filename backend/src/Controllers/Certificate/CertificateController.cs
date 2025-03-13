using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class CertificateController(DatabaseContext db)
    : AbstractCrudController<Certificate, CertificateCreateDTO, CertificatePatchDTO>(db)
{
    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Certificate>> Create([FromBody] CertificateCreateDTO createDTO)
    {
        // check parent project exists
        var project = await _context.Projects.FindAsync(createDTO.ProjectId);
        if (project == null)
        {
            return BadRequest("Proyecto no encontrado");
        }

        var entity = createDTO.MapToEntity();
        entity.Project = project;

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }
}


