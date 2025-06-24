using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class QuotationController(
    DatabaseContext db,
    EmailService emailService,
    WhatsappService whatsappService,
    CsvExportService csvExportService,
    QuotationService quotationService
) : AbstractCrudController<Quotation, QuotationCreateDTO, QuotationPatchDTO>(db)
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
        if (missingServiceIds.Count != 0)
        {
            return NotFound("Algunos servicios no fueron encontrados");
        }

        var entity = createDto.MapToEntity();
        entity.Id = Guid.NewGuid();
        entity.Client = client;
        entity.Services = services;

        _dbSet.Add(entity);

        // set services
        entity.QuotationServices =
        [
            .. createDto.QuotationServices.Select(qs => new Infrastructure.Model.QuotationService
            {
                Amount = qs.Amount,
                NameDescription = qs.NameDescription,
                Price = qs.Price,
                Accesories = qs.Accesories,
            }),
        ];

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
            .Include(q => q.QuotationServices)
            .Include(s => s.Services)
            .OrderByDescending(q => q.QuotationNumber)
            .ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType<QuotationGetDTO>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Quotation>> GetById(Guid id)
    {
        var entity = await _dbSet
            .Include(q => q.QuotationServices)
            .Include(c => c.Client)
            .Include(s => s.Services)
            .FirstOrDefaultAsync(q => q.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [EndpointSummary("Patch a Quotation by ID")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<IActionResult> Patch(Guid id, [FromBody] QuotationPatchDTO patchDto)
    {
        // Use AsNoTracking() to avoid tracking issues with the first query
        var quotation = await _dbSet
            .AsNoTracking() // Add this
            .Include(q => q.Services)
            .Include(q => q.QuotationServices)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation == null)
            return NotFound();

        // Now get a clean tracked entity for updating
        var trackedQuotation = await _dbSet.FindAsync(id);
        if (trackedQuotation == null)
            return NotFound();

        // Load related entities for the tracked entity
        await _context.Entry(trackedQuotation).Collection(q => q.Services).LoadAsync();

        await _context.Entry(trackedQuotation).Collection(q => q.QuotationServices).LoadAsync();

        if (patchDto.ClientId != null)
        {
            var client = await _context.Clients.FindAsync(patchDto.ClientId.Value);
            if (client == null)
            {
                return NotFound("Cliente no encontrado");
            }
            trackedQuotation.Client = client;
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

            // Clear existing services and add the new ones
            trackedQuotation.Services.Clear();

            var servicesToAdd = await _context
                .Services.Where(s => newServiceIds.Contains(s.Id))
                .ToListAsync();

            foreach (var service in servicesToAdd)
                trackedQuotation.Services.Add(service);
        }

        if (patchDto.QuotationServices is not null)
        {
            // Get existing services
            var existingServices = trackedQuotation.QuotationServices.ToList();
            var existingIds = existingServices.Select(x => x.Id).ToList();

            // Keep track of processed IDs to determine what to delete later
            var processedIds = new List<Guid>();

            foreach (var patchQs in patchDto.QuotationServices)
            {
                if (patchQs.Id != null)
                {
                    // Try to find existing service
                    var existingService = existingServices.FirstOrDefault(e => e.Id == patchQs.Id);

                    if (existingService != null)
                    {
                        // Update existing service
                        existingService.Amount = patchQs.Amount;
                        if (patchQs.NameDescription != null)
                            existingService.NameDescription = patchQs.NameDescription;
                        if (patchQs.Price != null)
                            existingService.Price = patchQs.Price;
                        existingService.Accesories = patchQs.Accesories;

                        processedIds.Add(existingService.Id);
                    }
                    else
                    {
                        // ID specified but not found - create new with specific ID
                        // Note: This might not work if ID is auto-generated
                        // Alternative: Ignore the ID and just create new
                        var newQuotationService = new Infrastructure.Model.QuotationService
                        {
                            Quotation = trackedQuotation,
                            Amount = patchQs.Amount,
                            NameDescription = patchQs.NameDescription ?? "",
                            Price = patchQs.Price,
                            Accesories = patchQs.Accesories,
                        };

                        _context.Add(newQuotationService);
                        // We'll get the ID after save, can't add to processedIds yet
                    }
                }
                else
                {
                    // Create new without specified ID
                    var newQuotationService = new Infrastructure.Model.QuotationService
                    {
                        Quotation = trackedQuotation,
                        Amount = patchQs.Amount,
                        NameDescription = patchQs.NameDescription ?? "",
                        Price = patchQs.Price,
                        Accesories = patchQs.Accesories,
                    };

                    _context.Add(newQuotationService);
                    // We'll get the ID after save, can't add to processedIds yet
                }
            }

            // Delete any existing services that weren't processed
            var toDelete = existingServices.Where(e => !processedIds.Contains(e.Id)).ToList();

            foreach (var service in toDelete)
            {
                _context.Remove(service);
            }
        }

        // Apply other property updates
        patchDto.ApplyPatch(trackedQuotation);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(trackedQuotation);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _dbSet.AnyAsync(q => q.Id == id))
                return NotFound();
            throw;
        }
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

        // Validar si la cotización está asociada a un proyecto cuando se intenta rechazar
        if (patchDto.Status == QuotationStatus.Rejected)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p =>
                p.Quotation != null && p.Quotation.Id == id
            );
            if (project != null)
            {
                return BadRequest(
                    "No se puede rechazar una cotización que está asociada a un proyecto"
                );
            }
        }

        // Actualizar el estado de la cotizacion y guardar en la base de datos
        quotation.Status = patchDto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Generate Quotation PDF")]
    [HttpPost("{id:guid}/gen-pdf")]
    public async Task<IActionResult> GeneratePDF(Guid id)
    {
        var (pdfBytes, error) = await quotationService.GeneratePdfAsync(id);

        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest(error);
        }

        return File(pdfBytes!, "application/pdf", "quotation.pdf");
    }

    [EndpointSummary("Generate Quotation Excel")]
    [HttpGet("{id:guid}/gen-excel")]
    public async Task<IActionResult> GenerateExcel(Guid id)
    {
        var (odsBytes, error) = await quotationService.GenerateExcelAsync(id);

        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest(error);
        }

        return File(odsBytes!, "application/vnd.oasis.opendocument.spreadsheet", "quotation.ods");
    }

    [EndpointSummary("Send Quotation PDF via Email")]
    [HttpPost("{id:guid}/email-pdf")]
    public async Task<ActionResult> SendPDFViaEmail(
        Guid id,
        [FromQuery] [Required] [EmailAddress] string email
    )
    {
        var (pdfBytes, generationError) = await quotationService.GeneratePdfAsync(id);

        if (!string.IsNullOrEmpty(generationError) || pdfBytes == null)
        {
            return BadRequest(generationError ?? "Error generando el PDF");
        }

        // send email
        var (ok, error) = await emailService.SendEmailAsync(
            to: email,
            subject: "PROPUESTA ECONÓMICA DE PERUCONTROL.COM EIRL",
            htmlBody: """
                <p>¡Buen día Estimados!</p>
                <br />
                <p>Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo.</p>
            """,
            textBody: "¡Buen día Estimados! Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo. ",
            attachments:
            [
                new()
                {
                    FileName = "cotizacion_perucontrol.pdf",
                    Content = new MemoryStream(pdfBytes),
                    ContentType = "application/pdf",
                },
            ]
        );

        if (!ok)
        {
            return StatusCode(500, error ?? "Error enviando el correo");
        }

        return Ok();
    }

    [EndpointSummary("Send Quotation PDF via WhatsApp")]
    [HttpPost("{id}/whatsapp-pdf")]
    public async Task<ActionResult> SendPDFViaWhatsapp(
        Guid id,
        [FromQuery] [Required] string phoneNumber
    )
    {
        var (pdfBytes, error) = await quotationService.GeneratePdfAsync(id);

        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest(error);
        }

        await whatsappService.SendWhatsappServiceMessageAsync(
            fileBytes: pdfBytes!,
            contentSid: "HXc9bee467c02d529435b97f7694ad3b87",
            fileName: "quotation.pdf",
            phoneNumber: phoneNumber
        );
        return Ok();
    }

    [EndpointSummary("Deactivate a Quotation by ID")]
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

    [EndpointSummary("Reactive quotation by Id")]
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

    [EndpointSummary("Get approved and not associated project")]
    [HttpGet("approved/not-associated")]
    [ProducesResponseType(typeof(IEnumerable<Quotation>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Quotation>>> GetApprovedNotAssociated()
    {
        var approvedQuotations = await _context
            .Quotations.Include(c => c.Client)
            .Include(q => q.QuotationServices)
            .Include(s => s.Services)
            .Where(q => q.Status == QuotationStatus.Approved)
            .Where(q => !_context.Projects.Any(p => p.Quotation!.Id == q.Id))
            .ToListAsync();

        return Ok(approvedQuotations);
    }

    [EndpointSummary("Export all quotations to CSV")]
    [EndpointDescription(
        "Export quotations to CSV. Use startDate and endDate query parameters to filter by creation date. If startDate is not specified, exports from Unix epoch start (1970-01-01). If endDate is not specified, exports until current time."
    )]
    [HttpGet("export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    public async Task<IActionResult> ExportQuotationsCsv(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
    )
    {
        var quotations = await _context
            .Quotations.Include(q => q.Client)
            .Include(q => q.Services)
            .Include(q => q.QuotationServices)
            .OrderByDescending(q => q.QuotationNumber)
            .ToListAsync();

        var csvBytes = csvExportService.ExportQuotationsToCsv(quotations, startDate, endDate);

        // Create a more descriptive filename with date range info
        var fileName = "quotations_export";
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
