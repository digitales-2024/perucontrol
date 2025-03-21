using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        // get cert, service and client
        var cert = _context
            .Certificates.Include(c => c.Project)
            .ThenInclude(p => p.Services)
            .Include(c => c.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefault(c => c.Id == id);
        if (cert == null)
        {
            return NotFound("Certificado no encontrado");
        }

        var project = cert.Project;
        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{{s1}}", "???" },
            { "{{s2}}", "???" },
            { "{{s3}}", "???" },
            { "{{s4}}", "???" },
            { "{{l1}}", "???" },
            { "{{l2}}", "???" },
            { "{{client_name}}", client.Name },
            { "{{client_address}}", project.Address },
            { "{{client_business_type}}", client.BusinessType },
            { "{{client_area}}", "--" },
            { "{{cert_creation_date}}", cert.CreationDate.ToString("dd/MM/yyyy") },
            { "{{cert_expiration_date}}", cert.ExpirationDate.ToString("dd/MM/yyyy") },
        };

        return BadRequest("Generacion en PDF no implementada");
    }
}
