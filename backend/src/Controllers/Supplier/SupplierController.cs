using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class SupplierController(
    DatabaseContext db,
    ILogger<SupplierController> logger,
    CsvExportService csvExportService
) : AbstractCrudController<Supplier, SupplierCreateDTO, SupplierPatchDTO>(db)
{
    [EndpointSummary("Get all")]
    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Supplier>>> GetAll()
    {
        return await _context
            .Suppliers
            .OrderByDescending(s => s.SupplierNumber)
            .ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Supplier>> GetById(Guid id)
    {
        var entity = await _context
            .Suppliers
            .FirstOrDefaultAsync(s => s.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Supplier>> Create([FromBody] SupplierCreateDTO createDTO)
    {
        var duplicateExists = await _context.Suppliers.AnyAsync(s =>
            s.RucNumber == createDTO.RucNumber
        );
        if (duplicateExists)
        {
            return BadRequest("Ya existe un proveedor con el mismo RUC.");
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

    [HttpPatch("/api/Supplier/update/{id}")]
    [EndpointSummary("Actualizar proveedor por ID")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] SupplierPatchDTO patchDTO)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Load supplier WITHOUT tracking to avoid concurrency issues
            var supplier = await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier == null)
                return NotFound("Proveedor no encontrado");

            // Create a fresh tracked entity with the original values
            _context.Attach(supplier);

            // Apply basic supplier property updates
            patchDTO.ApplyPatch(supplier);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error de concurrencia al actualizar proveedor {Id}", id);
            return Conflict(
                "Los datos fueron modificados por otro usuario. Por favor refresque e intente nuevamente."
            );
        }
        catch (DbUpdateException ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error de base de datos al actualizar proveedor {Id}", id);
            return StatusCode(500, "Error al guardar los cambios");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Error inesperado al actualizar proveedor {Id}", id);
            return StatusCode(500, "Error interno del servidor");
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

        // Aquí puedes agregar validaciones adicionales según sea necesario

        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Reactive
    [EndpointSummary("Reactive supplier by Id")]
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

    [EndpointSummary("Export all suppliers to CSV with optional date range filtering")]
    [EndpointDescription(
        "Export suppliers to CSV. Use startDate and endDate query parameters to filter by creation date. If startDate is not specified, exports from Unix epoch start (1970-01-01). If endDate is not specified, exports until current time."
    )]
    [HttpGet("export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    public async Task<IActionResult> ExportSuppliersCsv(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
    )
    {
        var suppliers = await _context.Suppliers.OrderByDescending(s => s.SupplierNumber).ToListAsync();

        var csvBytes = csvExportService.ExportSuppliersToCsv(suppliers, startDate, endDate);

        // Create a more descriptive filename with date range info
        var fileName = "suppliers_export";
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