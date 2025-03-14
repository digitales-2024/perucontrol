using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class CertificateController(DatabaseContext db, WordTemplateService wordService)
    : AbstractCrudController<Certificate, CertificateCreateDTO, CertificatePatchDTO>(db)
{
    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Certificate>> Create(
        [FromBody] CertificateCreateDTO createDTO
    )
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

    [EndpointSummary("Generate Certificate Word")]
    [HttpPost("{id}/gen-certificate-word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateCertificate(Guid id)
    {
        var placeholders = new Dictionary<string, string> { { "{{placeholder}}", "???" } };
        var fileBytes = wordService.GenerateWordFromTemplate(
            placeholders,
            "Templates/certificado.docx"
        );
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "certificate.docx"
        );
    }
}
