using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class ClientController(
    DatabaseContext db,
    ILogger<ClientController> logger,
    ClientService clientService,
    CsvExportService csvExportService
) : AbstractCrudController<Client, ClientCreateDTO, ClientPatchDTO>(db)
{
    [EndpointSummary("Get all")]
    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Client>>> GetAll()
    {
        return await _context
            .Clients.Include(c => c.ClientLocations)
            .OrderByDescending(c => c.ClientNumber)
            .ToListAsync();
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

    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Client>> Create([FromBody] ClientCreateDTO createDTO)
    {
        var duplicateExists = await _context.Clients.AnyAsync(c =>
            c.TypeDocumentValue == createDTO.TypeDocumentValue
        );
        if (duplicateExists)
        {
            return BadRequest("Ya existe un cliente con el mismo Documento.");
        }

        var entity = createDTO.MapToEntity();
        if (entity.Id == Guid.Empty)
        {
            entity.Id = Guid.NewGuid();
        }

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPatch("/update/{id}")]
    [EndpointSummary("Actualizar cliente por ID")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateClient(Guid id, [FromBody] ClientPatchDTO patchDTO)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Load client WITHOUT tracking to avoid concurrency issues
            var client = await _dbSet
                .AsNoTracking()
                .Include(c => c.ClientLocations)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
                return NotFound("Cliente no encontrado");

            // Create a fresh tracked entity with the original values
            _context.Attach(client);

            // Apply basic client property updates
            patchDTO.ApplyPatch(client);

            // Handle locations separately
            if (patchDTO.ClientLocations is not null)
            {
                // Get IDs of existing locations
                var existingLocationIds = client.ClientLocations.Select(l => l.Id).ToHashSet();
                var processedIds = new HashSet<Guid>();

                foreach (var patchLocation in patchDTO.ClientLocations)
                {
                    if (patchLocation.Id is not null)
                    {
                        var locationId = patchLocation.Id.Value;

                        if (existingLocationIds.Contains(locationId))
                        {
                            // Get the location directly from the database
                            var existingLocation = await _context
                                .Set<ClientLocation>()
                                .FindAsync(locationId);

                            if (existingLocation != null)
                            {
                                // Update properties
                                existingLocation.Address = patchLocation.Address;
                                processedIds.Add(locationId);
                            }
                        }
                        else
                        {
                            // ID provided but not found, create new with client reference
                            var newLocation = new ClientLocation
                            {
                                Id = locationId,
                                Address = patchLocation.Address,
                                Client = client,
                            };
                            await _context.Set<ClientLocation>().AddAsync(newLocation);
                            processedIds.Add(locationId);
                        }
                    }
                    else
                    {
                        // Create new location without specified ID
                        var newLocation = new ClientLocation
                        {
                            Address = patchLocation.Address,
                            Client = client,
                        };
                        await _context.Set<ClientLocation>().AddAsync(newLocation);
                    }
                }

                // Delete any locations not included in the update
                var locationsToDelete = await _context
                    .Set<ClientLocation>()
                    .Where(l => l.Client.Id == id && !processedIds.Contains(l.Id))
                    .ToListAsync();

                if (locationsToDelete.Any())
                {
                    _context.Set<ClientLocation>().RemoveRange(locationsToDelete);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error de concurrencia al actualizar cliente {Id}", id);
            return Conflict(
                "Los datos fueron modificados por otro usuario. Por favor refresque e intente nuevamente."
            );
        }
        catch (DbUpdateException ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error de base de datos al actualizar cliente {Id}", id);
            return StatusCode(500, "Error al guardar los cambios");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error inesperado al actualizar cliente {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    private async Task ApplyClientChanges(Client client, ClientPatchDTO patchDTO)
    {
        // Aplicar cambios a propiedades simples
        patchDTO.ApplyPatch(client);

        // Manejar ubicaciones si vienen en el DTO
        if (patchDTO.ClientLocations != null)
        {
            // 1. Eliminar ubicaciones existentes (con consulta directa para evitar problemas de tracking)
            await _context
                .ClientLocations.Where(cl => cl.Client.Id == client.Id)
                .ExecuteDeleteAsync();

            // 2. Limpiar colección en memoria
            client.ClientLocations.Clear();

            // 3. Agregar nuevas ubicaciones con validación
            foreach (var locationDto in patchDTO.ClientLocations.Where(dto => dto != null))
            {
                var newLocation = locationDto.MapToEntity();
                newLocation.Client.Id = client.Id; // Establecer relación
                _context.ClientLocations.Add(newLocation);
            }
        }
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
                        ContactName = client.ContactName,
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

    // Delete con validaciones
    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        // Verificar si el cliente está asociado a alguna cotización activa
        var isAssociatedWithQuotation = await _context.Quotations.AnyAsync(q =>
            q.Client.Id == id && q.IsActive
        );
        // Verificar si el cliente está asociado a algún proyecto activo
        var isAssociatedWithProject = await _context.Projects.AnyAsync(p =>
            p.Client.Id == id && p.IsActive
        );

        if (isAssociatedWithQuotation)
        {
            return BadRequest(
                "No se puede desactivar el cliente porque está asociado a una cotización activa."
            );
        }

        if (isAssociatedWithProject)
        {
            return BadRequest(
                "No se puede desactivar el cliente porque está asociado a un proyecto activo."
            );
        }

        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Reactive
    [EndpointSummary("Reactive client by Id")]
    [HttpPatch("{id}/reactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<IActionResult> Reactivate(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        entity.IsActive = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [EndpointSummary("Export all clients to CSV with optional date range filtering")]
    [EndpointDescription(
        "Export clients to CSV. Use startDate and endDate query parameters to filter by creation date. If startDate is not specified, exports from Unix epoch start (1970-01-01). If endDate is not specified, exports until current time."
    )]
    [HttpGet("export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    public async Task<IActionResult> ExportClientsCsv(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
    )
    {
        var clients = await _context.Clients.OrderByDescending(c => c.ClientNumber).ToListAsync();

        var csvBytes = csvExportService.ExportClientsToCsv(clients, startDate, endDate);

        // Create a more descriptive filename with date range info
        var fileName = "clients_export";
        if (startDate.HasValue || endDate.HasValue)
        {
            fileName += "_";
            if (startDate.HasValue)
                fileName += $"from_{startDate.Value:yyyyMMdd}";
            if (endDate.HasValue)
                fileName += $"_to_{endDate.Value:yyyyMMdd}";
        }
        fileName += $"_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return File(csvBytes, "text/csv", fileName);
    }
}

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
    public string? BusinessType { get; set; }
    public string? ContactName { get; set; }
}
