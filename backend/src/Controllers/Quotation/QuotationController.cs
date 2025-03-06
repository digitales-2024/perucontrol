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
    [ProducesResponseType<IEnumerable<QuotationGetDTO>>(StatusCodes.Status200OK)]
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
    public async Task<IActionResult> UpdateState(Guid id, [FromBody] QuotationStatusPatchDTO patchDto)
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
    [HttpGet("{id}/gen-excel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateExcel()
    {
        var placeholders = new Dictionary<string, string>
        {
            // sample values
            { "{{digesa_habilitacion}}", "322" },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(placeholders, "template.xlsx");
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "quotation.xlsx"
        );
    }
}
