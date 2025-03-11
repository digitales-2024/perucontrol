using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class QuotationController(DatabaseContext db, ExcelTemplateService excelTemplate)
    : AbstractCrudController<Quotation, QuotationCreateDTO, QuotationPatchDTO>(db)
{
    [EndpointSummary("Create a Quotation")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Quotation>> Create(
        [FromBody] QuotationCreateDTO createDto
    )
    {
        var client = await _context.Set<Client>().FindAsync(createDto.ClientId);
        if (client == null)
            return NotFound("Cliente no encontrado");

        var services = await _context
            .Set<Service>()
            .Where(s => createDto.ServiceIds.Contains(s.Id))
            .ToListAsync();

        var missingServiceIds = createDto.ServiceIds.Except(services.Select(s => s.Id)).ToList();
        if (missingServiceIds.Any())
        {
            return NotFound("Algunos servicios no fueron encontrados");
        }

        var entity = createDto.MapToEntity();
        entity.Id = Guid.NewGuid();
        entity.Client = client;
        entity.Services = services;

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [EndpointSummary("Get all")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<Quotation>>(StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<Quotation>>> GetAll()
    {
        return await _context
            .Quotations.Include(c => c.Client)
            .Include(s => s.Services)
            .ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType<QuotationGetDTO>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Quotation>> GetById(Guid id)
    {
        var entity = await _dbSet
            .Include(c => c.Client)
            .Include(s => s.Services)
            .FirstOrDefaultAsync(q => q.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [EndpointSummary("Partial edit one by id")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<IActionResult> Patch(Guid id, [FromBody] QuotationPatchDTO patchDto)
    {
        var quotation = await _dbSet.Include(q => q.Services).FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
            return NotFound();

        if (patchDto.ClientId != null)
        {
            var client = await _context.Clients.FindAsync(patchDto.ClientId.Value);
            if (client == null)
            {
                return NotFound("Cliente no encontrado");
            }
            quotation.Client = client;
        }

        if (patchDto.ServiceIds != null)
        {
            var newServiceIds = await _context
                .Services.Where(s => patchDto.ServiceIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            // Check if we got all the IDs we were sent
            if (newServiceIds.Count != patchDto.ServiceIds.Count)
            {
                var invalidIds = patchDto.ServiceIds.Except(newServiceIds).ToList();

                return BadRequest($"Invalid service IDs: {string.Join(", ", invalidIds)}");
            }

            // Get services to remove (existing ones not in new list)
            var servicesToRemove = quotation
                .Services.Where(s => !newServiceIds.Contains(s.Id))
                .ToList();

            // Get services to add (new ones not in existing list)
            var existingServiceIds = quotation.Services.Select(s => s.Id);
            var servicesToAdd = await _context
                .Services.Where(s =>
                    newServiceIds.Contains(s.Id) && !existingServiceIds.Contains(s.Id)
                )
                .ToListAsync();

            // Apply the changes
            foreach (var service in servicesToRemove)
                quotation.Services.Remove(service);

            foreach (var service in servicesToAdd)
                quotation.Services.Add(service);
        }

        patchDto.ApplyPatch(quotation);
        await _context.SaveChangesAsync();

        return Ok(quotation);
    }

    [EndpointSummary("Update Quotation State")]
    [HttpPatch("{id}/update-state")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateState(
        Guid id,
        [FromBody] QuotationStatusPatchDTO patchDto
    )
    {
        var quotation = await _dbSet.FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
        {
            return NotFound();
        }

        // Actualizar el estado de la cotizacion y guardar en la base de datos
        quotation.Status = patchDto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Generate Excel")]
    [HttpPost("{id}/gen-excel")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateExcel(Guid id, [FromBody] QuotationExportDto export)
    {
        var quotation = _dbSet
            .Include(q => q.Client)
            .Include(q => q.Services)
            .FirstOrDefault(q => q.Id == id);

        if (quotation == null)
        {
            return NotFound(
                $"Cotización no encontrada (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = quotation.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);
        var hasTaxes = quotation.HasTaxes ? "SI" : "NO";
        var expiryDaysAmount = (export.ValidUntil - quotation.CreatedAt).Days;

        var placeholders = new Dictionary<string, string>
        {
            { "{{digesa_habilitacion}}", "123-PROV" },
            { "{{fecha_cotizacion}}", quotation.CreatedAt.ToString("dd/MM/yyyy") },
            { "{{nro_presupuesto}}", "123-PROV" },
            { "{{nro_cliente}}", "123-PROV" },
            { "{{validez_presupuesto}}", export.ValidUntil.ToString("dd/MM/yyyy") },
            { "{{nombre_cliente}}", quotation.Client.RazonSocial ?? quotation.Client.Name },
            { "{{direccion_cliente}}", quotation.Client.FiscalAddress },
            { "{{adicional_cliente}}", "--Provicional--" },
            { "{{garantia}}", export.Guarantee },
            { "{{cantidad_servicio}}", quotation.Services.Count.ToString() },
            { "{{nombre_servicio}}", serviceNamesStr },
            { "{{incluye_igv_str}}", hasTaxes },
            { "{{validez_dias}}", expiryDaysAmount.ToString() },
            { "{{termino_custom}}", quotation.TermsAndConditions },
            { "{{doc_entregados}}", export.Deliverables },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/cotizacion.xlsx"
        );
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "quotation.xlsx"
        );
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }

        // Verificar si la cotización esta asociada a un proyecto
        var isAssociatedWithProject = await _context.Projects.AnyAsync(p =>
            p.Quotation != null && p.Quotation.Id == id
        );

        if (isAssociatedWithProject)
        {
            return BadRequest(
                "No se puede eliminar la cotización porque está asociada a un proyecto."
            );
        }

        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
