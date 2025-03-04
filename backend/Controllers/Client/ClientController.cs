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
            var data = await clientService.ScrapSunat(ruc);
            return Ok(data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogDebug($"HTTP Error when fetching SUNAT: {ex.StatusCode} - {ex.Message}");
            return NotFound();
        }
    }
}

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
    public string? BusinessType { get; set; }
}
