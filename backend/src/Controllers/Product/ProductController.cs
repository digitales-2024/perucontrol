using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils; // Needed for Result types

namespace PeruControl.Controllers.Product;

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class ProductController(DatabaseContext context, ProductService productService)
    : ControllerBase
{
    [EndpointSummary("Get all products & solvents")]
    [HttpGet]
    public async Task<ActionResult<IList<ProductGetAllOutputDTO>>> GetAllProducts()
    {
        var products = await context.Products.Include(p => p.ProductAmountSolvents).ToListAsync();

        var result = products.Select(p => ProductGetAllOutputDTO.FromProduct(p)).ToList();
        // var result = products.Select(p => ProductGetAllOutputDTO.FromProduct(p)).ToList();

        return Ok(result);
    }

    [EndpointSummary("Create a product with Solvents")]
    [HttpPost]
    public async Task<ActionResult> CreateProduct([FromBody] ProductCreateInputDTO dto)
    {
        await productService.CreateProduct(dto);
        return Ok();
    }

    [EndpointSummary("Update a product and its solvents")]
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(SuccessResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Utils.NotFoundResult), StatusCodes.Status404NotFound)] // Explicitly use Utils.NotFoundResult
    [ProducesResponseType(typeof(ErrorResult), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResult), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Result>> UpdateProduct(
        Guid id,
        [FromBody] ProductUpdateInputDTO dto
    )
    {
        // Check if Solvents list is null, if so, initialize to prevent null reference downstream
        // Although the check `if (dto.Solvents is not null)` handles it, this can be safer
        // dto.Solvents ??= new List<ProductAmountSolventUpdateDTO>();
        // Decided against this - the explicit check is clear enough.

        using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            var product = await context
                .Products.Include(p => p.ProductAmountSolvents)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product is null)
            {
                await transaction.RollbackAsync();
                // Use the qualified name to resolve ambiguity
                return NotFound(new Utils.NotFoundResult($"Product with ID {id} not found."));
            }

            // Update basic product fields if provided
            if (dto.Name is not null)
            {
                product.Name = dto.Name;
            }
            if (dto.ActiveIngredient is not null)
            {
                product.ActiveIngredient = dto.ActiveIngredient;
            }

            // Update Solvents if provided
            if (dto.Solvents is not null)
            {
                // Process DTOs that have IDs - update or ignore (for now)
                var existingSolventIds = product
                    .ProductAmountSolvents.Select(s => s.Id)
                    .ToHashSet();
                var dtoSolventIds = dto
                    .Solvents.Where(s => s.Id != null)
                    .Select(s => s.Id!.Value)
                    .ToHashSet();

                // Find solvents to remove (in DB but not in DTO with ID)
                var toRemoveIds = existingSolventIds.Except(dtoSolventIds).ToList();

                foreach (var solventId in toRemoveIds)
                {
                    var solventToRemove = product.ProductAmountSolvents.FirstOrDefault(s =>
                        s.Id == solventId
                    );
                    if (solventToRemove != null)
                    {
                        // Access DbSet via context.Set<T>() or a specific property if defined on context
                        context.Set<ProductAmountSolvent>().Remove(solventToRemove);
                    }
                }

                // Update existing and add new solvents
                foreach (var solventDto in dto.Solvents)
                {
                    if (solventDto.Id != null) // Update existing solvent
                    {
                        var existingSolvent = product.ProductAmountSolvents.FirstOrDefault(s =>
                            s.Id == solventDto.Id.Value
                        );
                        if (existingSolvent != null)
                        {
                            // Update properties
                            if (existingSolvent.AmountAndSolvent != solventDto.AmountAndSolvent)
                            {
                                existingSolvent.AmountAndSolvent = solventDto.AmountAndSolvent;
                                // No need to set state explicitly if tracked entity property changes
                                // context.Entry(existingSolvent).State = EntityState.Modified;
                            }
                        }
                        // If ID exists in DTO but not in DB (e.g., due to race condition/bad data),
                        // we might want to log a warning or return an error. For now, we ignore.
                    }
                    else // Add new solvent
                    {
                        var newSolvent = new ProductAmountSolvent
                        {
                            AmountAndSolvent = solventDto.AmountAndSolvent,
                            Product = product,
                        };
                        // Access DbSet via context.Set<T>() or a specific property if defined on context
                        context.Set<ProductAmountSolvent>().Add(newSolvent);
                        // Don't manually add to collection if EF Core relationship fixup is enabled (default)
                        // product.ProductAmountSolvents.Add(newSolvent);
                    }
                }
            }

            // Mark the main product entity as modified if changes were made
            // Only mark as modified if Name or ActiveIngredient changed,
            // EF Core tracks collection changes automatically.
            if (dto.Name is not null || dto.ActiveIngredient is not null)
            {
                context.Entry(product).State = EntityState.Modified;
            }

            try
            {
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                // SuccessResult likely has a parameterless constructor or a static factory method
                return Ok(new SuccessResult()); // Assuming parameterless constructor
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                // Log ex here
                return Conflict(
                    new ErrorResult(
                        "The product was modified by another user. Please refresh and try again."
                    )
                );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log ex here
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ErrorResult($"Failed to update product: {ex.Message}")
                );
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions during setup (e.g., getting the product)
            await transaction.RollbackAsync(); // Ensure rollback even if transaction wasn't fully used
            // Log ex here
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new ErrorResult($"An error occurred: {ex.Message}")
            );
        }
    }

    [EndpointSummary("Delete a product")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        // Verificar si el producto está siendo utilizado en algún tratamiento de alguna cita
        var isProductInUse = await context.TreatmentProducts.AnyAsync(tp =>
            tp.ProductName == product.Name && tp.IsActive
        );

        if (isProductInUse)
        {
            return BadRequest(
                "No se puede eliminar el producto porque está siendo utilizado en tratamientos activos."
            );
        }

        product.IsActive = false;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [EndpointSummary("Reactivate a product")]
    [HttpPatch("{id}/reactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        var product = await context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        product.IsActive = true;
        await context.SaveChangesAsync();
        return NoContent();
    }
}
