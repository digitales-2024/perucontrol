using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ProjectController(DatabaseContext db)
    : AbstractCrudController<Project, ProjectCreateDTO, ProjectPatchDTO>(db)
{
    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Project>> Create([FromBody] ProjectCreateDTO createDTO)
    {
        var entity = createDTO.MapToEntity();
        entity.Id = Guid.NewGuid();

        // validate the client exists before creating the project
        var client = await _context.Set<Client>().FindAsync(createDTO.ClientId);
        if (client == null)
            return NotFound("Cliente no encontrado");
        entity.Client = client;

        // if a quotation is provided, validate it exists
        Quotation? quotation = null;
        if (createDTO.QuotationId != null)
        {
            quotation = await _context.Set<Quotation>().FindAsync(createDTO.QuotationId);
            if (quotation == null)
                return NotFound("Cotización no encontrada");
            entity.Quotation = quotation;
        }

        // Validate all services exist
        if (createDTO.Services.Count == 0)
            return BadRequest("Debe ingresar al menos un servicio");

        var services = await _context
            .Set<Service>()
            .Where(s => createDTO.Services.Contains(s.Id))
            .ToListAsync();

        if (services.Count != createDTO.Services.Count)
            return NotFound("Algunos servicios no fueron encontrados");
        entity.Services = services;

        // Create and populate the project
        _context.Add(entity);
        await _context.SaveChangesAsync();

        return Created();
    }

    [EndpointSummary("Get all")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<ProjectSummary>>( StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var projects = await _context
          .Projects.Include(c => c.Client)
          .Include(p => p.Services)
          .Include(q => q.Quotation)
          .ToListAsync();

          var projectSummaries = projects.Select(p => new ProjectSummary
          {
              Id = p.Id,
              Client = p.Client,
              Services = p.Services,
              Status = p.Status,
              SpacesCount = p.SpacesCount,
              OrderNumber = p.OrderNumber,
              Area = p.Area,
              Address = p.Address,
              Quotation = p.Quotation
          }).ToList();

        return Ok(projectSummaries);
    }

    [EndpointSummary("Get one by Id")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProjectSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Project>> GetById(Guid id)
    {
        var project = await _context
          .Projects.Include(c => c.Client)
          .Include(p => p.Services)
          .Include(q => q.Quotation)
          .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var projectSummary = new ProjectSummary
        {
            Id = project.Id,
            Client = project.Client,
            Services = project.Services,
            Status = project.Status,
            SpacesCount = project.SpacesCount,
            OrderNumber = project.OrderNumber,
            Area = project.Area,
            Address = project.Address,
            Quotation = project.Quotation
        };

        return Ok(projectSummary);
    }
}
