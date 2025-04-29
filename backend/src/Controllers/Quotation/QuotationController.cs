using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class QuotationController(
    DatabaseContext db,
    ExcelTemplateService excelTemplate,
    LibreOfficeConverterService pDFConverterService
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
        entity.QuotationServices = createDto
            .QuotationServices.Select(qs => new QuotationService
            {
                Amount = qs.Amount,
                NameDescription = qs.NameDescription,
                Price = qs.Price,
                Accesories = qs.Accesories,
            })
            .ToList();

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
                        var newQuotationService = new QuotationService
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
                    var newQuotationService = new QuotationService
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

        // Actualizar el estado de la cotizacion y guardar en la base de datos
        quotation.Status = patchDto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Generate PDF")]
    [HttpPost("{id}/gen-pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GeneratePDF(Guid id)
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

        var business = _context.Businesses.FirstOrDefault();
        if (business == null)
            return StatusCode(500, "Estado del sistema invalido, no se encontro la empresa");

        var serviceNames = quotation.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);
        var hasTaxes = quotation.HasTaxes ? "SI" : "NO";
        var expiryDaysAmount = (quotation.ExpirationDate - quotation.CreationDate).Days;

        var igv1 = quotation.HasTaxes ? "SI" : "NO";
        var quotationNumber =
            quotation.CreatedAt.ToString("yy") + "-" + quotation.QuotationNumber.ToString("D4");

        var areAddressesDifferent = quotation.Client.FiscalAddress != quotation.ServiceAddress;

        var placeholders = new Dictionary<string, string>
        {
            { "{{digesa_habilitacion}}", business.DigesaNumber },
            { "{{direccion_perucontrol}}", business.Address },
            { "{{ruc_perucontrol}}", business.RUC },
            { "{{celulares_perucontrol}}", business.Phones },
            { "{{gerente_perucontrol}}", business.DirectorName },
            { "{{fecha_cotizacion}}", quotation.CreationDate.ToString("dd/MM/yyyy") },
            { "{{cod_cotizacion}}", quotationNumber },
            { "{{nro_cliente}}", quotation.Client.ClientNumber.ToString("D4") },
            { "{{fecha_exp_cotizacion}}", quotation.ExpirationDate.ToString("dd/MM/yyyy") },
            { "{{nombre_cliente}}", quotation.Client.RazonSocial ?? quotation.Client.Name },
            { "{{direccion_fiscal_cliente}}", quotation.Client.FiscalAddress },
            { "{{trabajos_realizar_en}}", areAddressesDifferent ? "Trabajos a realizar en:" : "" },
            {
                "{{direccion_servicio_cliente}}",
                areAddressesDifferent ? quotation.ServiceAddress : ""
            },
            { "{{contacto_cliente}}", quotation.Client.ContactName ?? "" },
            { "{{banco_perucontrol}}", business.BankName },
            { "{{cuenta_banco_perucontrol}}", business.BankAccount },
            { "{{cci_perucontrol}}", business.BankCCI },
            { "{{detracciones_perucontrol}}", business.Deductions },
            { "{{forma_pago}}", quotation.PaymentMethod },
            { "{{otros}}", quotation.Others },
            { "{{frecuencia_servicio}}", quotation.Frequency.ToSpanishString() },
            // FIXME: update fields
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/cotizacion_plantilla.xlsx"
        );

        var (pdfBytes, errorStr) = pDFConverterService.convertToPdf(fileBytes, "xlsx");

        if (errorStr != "")
        {
            return BadRequest(errorStr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "quotation.pdf");
    }

    [EndpointSummary("Generate Excel")]
    [HttpPost("{id}/gen-excel")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateExcel(Guid id)
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

        var business = _context.Businesses.FirstOrDefault();
        if (business == null)
            return StatusCode(500, "Estado del sistema invalido, no se encontro la empresa");

        var serviceNames = quotation.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);
        var hasTaxes = quotation.HasTaxes ? "SI" : "NO";
        var expiryDaysAmount = (quotation.ExpirationDate - quotation.CreationDate).Days;

        var igv1 = quotation.HasTaxes ? "SI" : "NO";
        var quotationNumber =
            quotation.CreatedAt.ToString("yy") + "-" + quotation.QuotationNumber.ToString("D4");

        var areAddressesDifferent = quotation.Client.FiscalAddress != quotation.ServiceAddress;

        var placeholders = new Dictionary<string, string>
        {
            { "{{digesa_habilitacion}}", business.DigesaNumber },
            { "{{direccion_perucontrol}}", business.Address },
            { "{{ruc_perucontrol}}", business.RUC },
            { "{{celulares_perucontrol}}", business.Phones },
            { "{{gerente_perucontrol}}", business.DirectorName },
            { "{{fecha_cotizacion}}", quotation.CreationDate.ToString("dd/MM/yyyy") },
            { "{{cod_cotizacion}}", quotationNumber },
            { "{{nro_cliente}}", quotation.Client.ClientNumber.ToString("D4") },
            { "{{fecha_exp_cotizacion}}", quotation.ExpirationDate.ToString("dd/MM/yyyy") },
            { "{{nombre_cliente}}", quotation.Client.RazonSocial ?? quotation.Client.Name },
            { "{{direccion_fiscal_cliente}}", quotation.Client.FiscalAddress },
            { "{{trabajos_realizar_en}}", areAddressesDifferent ? "Trabajos a realizar en:" : "" },
            {
                "{{direccion_servicio_cliente}}",
                areAddressesDifferent ? quotation.ServiceAddress : ""
            },
            { "{{contacto_cliente}}", quotation.Client.ContactName ?? "" },
            { "{{banco_perucontrol}}", business.BankName },
            { "{{cuenta_banco_perucontrol}}", business.BankAccount },
            { "{{cci_perucontrol}}", business.BankCCI },
            { "{{detracciones_perucontrol}}", business.Deductions },
            { "{{forma_pago}}", quotation.PaymentMethod },
            { "{{otros}}", quotation.Others },
            { "{{frecuencia_servicio}}", quotation.Frequency.ToSpanishString() },
            // FIXME: update fields
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/cotizacion_plantilla_excel.xlsx"
        );

        // send
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
}
