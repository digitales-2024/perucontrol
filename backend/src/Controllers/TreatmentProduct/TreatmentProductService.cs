using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

public class TreatmentProductService(DatabaseContext db)
{
    public async Task<Result> PatchTreatmentProducts(Guid id, IList<TreatmentProductInDTO> dto)
    {
        // Start a transaction - important for consistency!
        using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            var appointment = await db
                .ProjectAppointments.Include(app => app.TreatmentProducts)
                .ThenInclude(tp => tp.Product)
                .Include(app => app.TreatmentProducts)
                .ThenInclude(tp => tp.ProductAmountSolvent)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment is null)
                return new NotFoundResult("No se encontró la fecha.");

            var products = await db.Products.Include(p => p.ProductAmountSolvents).ToListAsync();

            // Process DTOs that have IDs - update or delete
            var existingIds = appointment.TreatmentProducts.Select(tp => tp.Id).ToHashSet();
            var dtoIds = dto.Where(tp => tp.Id != null).Select(tp => tp.Id!.Value).ToHashSet();

            // Find items to remove (in DB but not in DTO)
            var toRemoveIds = existingIds.Except(dtoIds).ToList();

            // Remove items from context
            foreach (var tpId in toRemoveIds)
            {
                var tpToRemove = appointment.TreatmentProducts.FirstOrDefault(tp => tp.Id == tpId);
                if (tpToRemove != null)
                {
                    db.TreatmentProducts.Remove(tpToRemove);
                    // No need to remove from collection - EF will do this automatically
                }
            }

            // Update existing items
            foreach (var tpDto in dto.Where(tp => tp.Id != null))
            {
                var existingTp = appointment.TreatmentProducts.FirstOrDefault(tp =>
                    tp.Id == tpDto.Id!.Value
                );

                if (existingTp != null)
                {
                    // Detach and re-attach to ensure clean tracking state
                    db.Entry(existingTp).State = EntityState.Detached;

                    // Fetch fresh from DB to avoid concurrency issues
                    var freshTp = await db
                        .TreatmentProducts.Include(tp => tp.Product)
                        .Include(tp => tp.ProductAmountSolvent)
                        .FirstOrDefaultAsync(tp => tp.Id == tpDto.Id!.Value);

                    if (freshTp == null)
                        return new NotFoundResult(
                            $"Treatment product with ID {tpDto.Id} no longer exists."
                        );

                    // Update properties
                    freshTp.EquipmentUsed = tpDto.EquipmentUsed;
                    freshTp.AppliedTechnique = tpDto.AppliedTechnique;
                    freshTp.AppliedService = tpDto.AppliedService;

                    // Update relationships if they changed
                    if (freshTp.Product.Id != tpDto.ProductId)
                    {
                        var newProduct = products.FirstOrDefault(p => p.Id == tpDto.ProductId);
                        if (newProduct == null)
                            return new NotFoundResult(
                                $"Product with ID {tpDto.ProductId} not found."
                            );

                        freshTp.Product = newProduct;
                    }

                    if (freshTp.ProductAmountSolvent.Id != tpDto.ProductAmountSolventId)
                    {
                        var product = products.FirstOrDefault(p => p.Id == tpDto.ProductId);
                        if (product == null)
                            return new NotFoundResult(
                                $"Product with ID {tpDto.ProductId} not found."
                            );

                        var solvent = product.ProductAmountSolvents.FirstOrDefault(s =>
                            s.Id == tpDto.ProductAmountSolventId
                        );
                        if (solvent == null)
                            return new NotFoundResult(
                                $"Solvent with ID {tpDto.ProductAmountSolventId} not found for product {tpDto.ProductId}."
                            );

                        freshTp.ProductAmountSolvent = solvent;
                    }

                    // Mark as modified
                    db.Entry(freshTp).State = EntityState.Modified;
                }
            }

            // Add new treatment products
            foreach (var tpDto in dto.Where(tp => tp.Id == null))
            {
                var product = products.FirstOrDefault(p => p.Id == tpDto.ProductId);
                if (product is null)
                    return new NotFoundResult($"Product with ID {tpDto.ProductId} not found.");

                var solvent = product.ProductAmountSolvents.FirstOrDefault(s =>
                    s.Id == tpDto.ProductAmountSolventId
                );
                if (solvent is null)
                    return new NotFoundResult(
                        $"Solvent with ID {tpDto.ProductAmountSolventId} not found for product {tpDto.ProductId}."
                    );

                var newTreatmentProduct = new TreatmentProduct
                {
                    Product = product,
                    ProductAmountSolvent = solvent,
                    EquipmentUsed = tpDto.EquipmentUsed,
                    AppliedTechnique = tpDto.AppliedTechnique,
                    AppliedService = tpDto.AppliedService,
                    ProjectAppointment = appointment,
                };

                db.TreatmentProducts.Add(newTreatmentProduct);
                appointment.TreatmentProducts.Add(newTreatmentProduct);
            }

            try
            {
                // Save all changes in one go
                await db.SaveChangesAsync();
                await transaction.CommitAsync();
                return new SuccessResult();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Specific handling for concurrency issues
                await transaction.RollbackAsync();

                // Log the detailed error
                // logger.LogError(ex, "Concurrency error when updating treatment products");

                return new ErrorResult(
                    "The data was modified by another user. Please refresh and try again."
                );
            }
            catch (Exception ex)
            {
                // General error handling
                await transaction.RollbackAsync();

                // logger.LogError(ex, "Error updating treatment products");
                return new ErrorResult($"Failed to update treatment products: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions during setup
            // logger.LogError(ex, "Error in PatchTreatmentProducts");
            return new ErrorResult($"An error occurred: {ex.Message}");
        }
    }
}
