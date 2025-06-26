using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PurchaseOrderController(
    PurchaseOrderService purchaseOrderService,
    DatabaseContext context,
    ILogger<PurchaseOrderController> logger
) : ControllerBase
{
    // Create
    [HttpPost]
    public async Task<ActionResult<PurchaseOrder>> Create([FromBody] PurchaseOrderCreateDTO dto)
    {
        if (dto == null)
            return BadRequest("Request body is required.");

        if (dto.Products == null || !dto.Products.Any())
            return BadRequest("At least one product is required.");

        if (string.IsNullOrWhiteSpace(dto.TermsAndConditions))
            return BadRequest("Terms and conditions are required.");

        var supplierExists = await context.Suppliers.AnyAsync(s => s.Id == dto.SupplierId);
        if (!supplierExists)
            return BadRequest("Supplier does not exist.");

        // Asegura que las fechas sean UTC
        dto.IssueDate = DateTime.SpecifyKind(dto.IssueDate, DateTimeKind.Utc);
        dto.ExpirationDate = DateTime.SpecifyKind(dto.ExpirationDate, DateTimeKind.Utc);

        try
        {
            var entity = dto.MapToEntity();
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            context.PurchaseOrders.Add(entity);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating purchase order");
            return StatusCode(
                500,
                "An unexpected error occurred while creating the purchase order."
            );
        }
    }

    // Update
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PurchaseOrderPatchDTO dto)
    {
        if (dto == null)
            return BadRequest("Request body is required.");

        // Si el PATCH permite actualizar productos, puedes validar aquí si es necesario
        if (dto.Products != null && !dto.Products.Any())
            return BadRequest("At least one product is required.");

        if (dto.TermsAndConditions != null && string.IsNullOrWhiteSpace(dto.TermsAndConditions))
            return BadRequest("Terms and conditions are required.");

        var entity = await context.PurchaseOrders.FindAsync(id);
        if (entity == null)
            return NotFound("Purchase order not found.");

        // Si el PATCH permite cambiar el proveedor, valida que exista
        if (dto.SupplierId.HasValue)
        {
            var supplierExists = await context.Suppliers.AnyAsync(s =>
                s.Id == dto.SupplierId.Value
            );
            if (!supplierExists)
                return BadRequest("Supplier does not exist.");
        }

        // Si el PATCH permite cambiar fechas, asegúrate que sean UTC
        if (dto.IssueDate.HasValue)
            dto.IssueDate = DateTime.SpecifyKind(dto.IssueDate.Value, DateTimeKind.Utc);

        if (dto.ExpirationDate.HasValue)
            dto.ExpirationDate = DateTime.SpecifyKind(dto.ExpirationDate.Value, DateTimeKind.Utc);

        try
        {
            dto.ApplyPatch(entity);
            await context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating purchase order");
            return StatusCode(
                500,
                "An unexpected error occurred while updating the purchase order."
            );
        }
    }

    // Get by Id
    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrder>> GetById(Guid id)
    {
        var entity = await context
            .PurchaseOrders.Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (entity == null)
            return NotFound();

        return Ok(entity);
    }

    // List & filter
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetAll(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] PurchaseOrderCurrency? currency = null,
        [FromQuery] PurchaseOrderStatus? status = null
    )
    {
        var query = context.PurchaseOrders.Include(po => po.Supplier).AsQueryable();

        if (startDate.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc);
            query = query.Where(po => po.IssueDate >= startUtc);
        }

        if (endDate.HasValue)
        {
            var endUtc = DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc);
            query = query.Where(po => po.IssueDate <= endUtc);
        }

        if (supplierId.HasValue)
            query = query.Where(po => po.SupplierId == supplierId.Value);

        if (currency.HasValue)
            query = query.Where(po => po.Currency == currency.Value);

        if (status.HasValue)
            query = query.Where(po => po.Status == status.Value);

        var result = await query.OrderByDescending(po => po.IssueDate).ToListAsync();
        return Ok(result);
    }

    // Change status (Accept or Cancel)
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromQuery] PurchaseOrderStatus status)
    {
        var entity = await context.PurchaseOrders.FindAsync(id);
        if (entity == null)
            return NotFound();

        entity.Status = status;
        await context.SaveChangesAsync();
        return NoContent();
    }

    // Export to PDF
    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> ExportToExcel(
            Guid id
    )
    {
        var (pdfBytes, pdfError) = await purchaseOrderService.GeneratePdf(id);
        if (pdfError != null)
        {
            return BadRequest(pdfError);
        }
        return File(pdfBytes, "application/pdf", "orden_de_compra.pdf");
    }
}
