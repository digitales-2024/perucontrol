using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

public class TreatmentProductService(DatabaseContext db)
{
    public async Task<Result> PatchTreatmentProducts(Guid id, IList<TreatmentProductInDTO> dto)
    {
        using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            var appointment = await db
                .ProjectAppointments.Include(app => app.TreatmentProducts)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment is null)
                return new NotFoundResult("No se encontró la fecha.");

            // IDs existentes en la BD y en el DTO
            var existingIds = appointment.TreatmentProducts.Select(tp => tp.Id).ToHashSet();
            var dtoIds = dto.Where(tp => tp.Id != null).Select(tp => tp.Id!.Value).ToHashSet();

            // Eliminar los que están en la BD pero no en el DTO
            var toRemoveIds = existingIds.Except(dtoIds).ToList();
            foreach (var tpId in toRemoveIds)
            {
                var tpToRemove = appointment.TreatmentProducts.FirstOrDefault(tp => tp.Id == tpId);
                if (tpToRemove != null)
                {
                    db.TreatmentProducts.Remove(tpToRemove);
                }
            }

            // Actualizar los existentes
            foreach (var tpDto in dto.Where(tp => tp.Id != null))
            {
                var existingTp = appointment.TreatmentProducts.FirstOrDefault(tp =>
                    tp.Id == tpDto.Id!.Value
                );

                if (existingTp != null)
                {
                    db.Entry(existingTp).State = EntityState.Detached;

                    var freshTp = await db.TreatmentProducts.FirstOrDefaultAsync(tp =>
                        tp.Id == tpDto.Id!.Value
                    );

                    if (freshTp == null)
                        return new NotFoundResult(
                            $"Treatment product with ID {tpDto.Id} no longer exists."
                        );

                    // Actualizar propiedades simples
                    freshTp.ProductName = tpDto.ProductName;
                    freshTp.AmountAndSolvent = tpDto.AmountAndSolvent;
                    freshTp.EquipmentUsed = tpDto.EquipmentUsed;
                    freshTp.AppliedTechnique = tpDto.AppliedTechnique;
                    freshTp.AppliedService = tpDto.AppliedService;

                    db.Entry(freshTp).State = EntityState.Modified;
                }
            }

            // Agregar nuevos
            foreach (var tpDto in dto.Where(tp => tp.Id == null))
            {
                var newTreatmentProduct = new TreatmentProduct
                {
                    ProductName = tpDto.ProductName,
                    AmountAndSolvent = tpDto.AmountAndSolvent,
                    ActiveIngredient = tpDto.ActiveIngredient,
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
                await db.SaveChangesAsync();
                await transaction.CommitAsync();
                return new SuccessResult();
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                return new ErrorResult(
                    "The data was modified by another user. Please refresh and try again."
                );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ErrorResult($"Failed to update treatment products: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            return new ErrorResult($"An error occurred: {ex.Message}");
        }
    }
}
