using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers.TreatmentArea;

public class TreatmentAreaService(DatabaseContext db)
{
    public async Task<Result> UpdateTreatmentAreas(
        Guid appointmentId,
        IList<TreatmentAreaInDTO> dto
    )
    {
        using var transaction = await db.Database.BeginTransactionAsync();

        var appointment = await db
            .ProjectAppointments.Include(pa => pa.TreatmentProducts)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment is null)
            return new NotFoundResult("No se encontró la fecha.");

        var allTreatmentProducts = appointment.TreatmentProducts.ToList();

        foreach (var taDto in dto)
        {
            var area = appointment.TreatmentAreas.FirstOrDefault(ta => ta.Id == taDto.Id);
            if (area == null)
                return new NotFoundResult($"Area con ID {taDto.Id} no se encontró");

            // Update properties
            area.ObservedVector = taDto.ObservedVector;
            area.InfestationLevel = taDto.InfestationLevel;
            area.PerformedService = taDto.PerformedService;
            area.AppliedTechnique = taDto.AppliedTechnique;

            // Update TreatmentProducts relationship
            var newProducts = new List<TreatmentProduct>();
            foreach (var prodId in taDto.TreatmentProductIds)
            {
                var prod = allTreatmentProducts.FirstOrDefault(tp => tp.Id == prodId);
                if (prod == null)
                    return new NotFoundResult($"Producto con ID {prodId} no encontrado");
                newProducts.Add(prod);
            }
            area.TreatmentProducts = newProducts;

            db.Entry(area).State = EntityState.Modified;
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
            return new ErrorResult($"Failed to update treatment areas: {ex.Message}");
        }
    }
}
