using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ClientController(
    DatabaseContext db,
    ILogger<ClientController> logger,
    ClientService clientService
) : AbstractCrudController<Client, ClientCreateDTO, ClientPatchDTO>(db)
{
    [EndpointSummary("Get all")]
    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Client>>> GetAll()
    {
        return await _context.Clients.Include(c => c.ClientLocations).ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Client>> GetById(Guid id)
    {
        var entity = await _context
            .Clients.Include(c => c.ClientLocations)
            .FirstOrDefaultAsync(c => c.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpGet("search-by-ruc/{ruc}")]
    [EndpointSummary("Get business data by RUC")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SunatQueryResponse>> SearchByRuc(string ruc)
    {
        try
        {
            // first check if the ruc is already in the db, to not hit SUNAT unnecessarily
            var client = await _context.Clients.FirstOrDefaultAsync(c =>
                c.TypeDocumentValue == ruc
            );
            if (client != null)
            {
                return Ok(
                    new SunatQueryResponse
                    {
                        RazonSocial = client.RazonSocial,
                        Name = client.Name,
                        FiscalAddress = client.FiscalAddress,
                        BusinessType = client.BusinessType,
                    }
                );
            }

            var data = await clientService.ScrapSunat(ruc);
            return Ok(data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogDebug($"HTTP Error when fetching SUNAT: {ex.StatusCode} - {ex.Message}");
            return NotFound();
        }
    }

    // Sobrescribiendo el método Delete para agregar las validaciones
    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        // Verificar si el cliente está asociado a alguna cotización
        var isAssociatedWithQuotation = await _context.Quotations.AnyAsync(q => q.Client.Id == id);
        // Verificar si el cliente está asociado a algún proyecto
        var isAssociatedWithProject = await _context.Projects.AnyAsync(p => p.Client.Id == id);

        if (isAssociatedWithQuotation)
        {
            return BadRequest(
                "No se puede desactivar el cliente porque está asociado a una cotización."
            );
        }

        if (isAssociatedWithProject)
        {
            return BadRequest(
                "No se puede desactivar el cliente porque está asociado a un proyecto."
            );
        }

        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
    public string? BusinessType { get; set; }
}
