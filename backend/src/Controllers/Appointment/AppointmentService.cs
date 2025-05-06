using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;
using PeruControl.Utils;

namespace PeruControl.Controllers;

public class AppointmentService(DatabaseContext db, OdsTemplateService odsTemplate)
{
    public async Task<Result<AppointmentGetOutDTO>> GetById(Guid id)
    {
        var appointment = await db
            .ProjectAppointments.Include(app => app.Services)
            .Include(app => app.Project)
            .ThenInclude(proj => proj.Services)
            .Include(app => app.TreatmentAreas)
            .Include(app => app.TreatmentProducts)
            .ThenInclude(treatmentArea => treatmentArea.Product)
            .Include(app => app.TreatmentProducts)
            .ThenInclude(treatmentArea => treatmentArea.ProductAmountSolvent)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment is null)
            return new NotFoundResult<AppointmentGetOutDTO>("No se encontró la fecha.");

        return new SuccessResult<AppointmentGetOutDTO>(
            AppointmentGetOutDTO.FromEntity(appointment)
        );
    }

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
                    freshTp.AppliedTime = tpDto.AppliedTime;

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
                    AppliedTime = tpDto.AppliedTime,
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
            catch (DbUpdateConcurrencyException ex)
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

    public async Task<(byte[], string?)> FillRodentsExcel(Guid id)
    {
        var business = await db.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return ([], ("Datos de la empresa no encontrados."));
        }

        var appointment = await db.Set<ProjectAppointment>()
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .Include(a => a.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return ([], ("No se encontró la fecha."));
        }

        var project = appointment.Project;
        var client = project.Client;
        var rodentRegister = appointment.RodentRegister;

        var placeholders = new Dictionary<string, string>
        {
            { "{empresa_contratante}", client.RazonSocial ?? client.Name },
            { "{empresa_autorizada}", "PeruControl" },
            { "{direccion_servicio}", project.Address },
            { "{fecha_servicio}", rodentRegister.ServiceDate.ToString("dd/MM/yyyy") },
            { "{hora_ingreso}", appointment.EnterTime?.ToString(@"hh\:mm") ?? "" },
            { "{hora_salida}", appointment.LeaveTime?.ToString(@"hh\:mm") ?? "" },
            { "{incidencias_encontradas}", rodentRegister.Incidents ?? "" },
            { "{medidas_correctivas}", rodentRegister.CorrectiveMeasures ?? "" },
            { "{fecha}", rodentRegister.ServiceDate.ToString("dd/MM/yyyy") },
        };

        List<string> areasplaceholders =
        [
            "area_",
            "tr_",
            "quinc",
            "mensual",
            "trimes",
            "semes",
            "parcial",
            "total",
            "deterio",
            "sincons",
            "activa",
            "inactiva",
            "roed",
            "otros",
            "fungi",
            "cebo",
            "trampa",
            "jaula",
            "principia",
            "dosis",
        ];

        // Fill Areas, up to 12
        for (var i = 1; i <= 12; i += 1)
        {
            foreach (var placeh in areasplaceholders)
            {
                placeholders[$"{{{placeh}{i}}}"] = "";
            }
        }

        var idx = 0;
        foreach (var area in rodentRegister.RodentAreas)
        {
            idx += 1;

            placeholders[$"{{area_{idx}}}"] = area.Name;
            placeholders[$"{{tr_{idx}}}"] = area.CebaderoTrampa.ToString();
            placeholders[$"{{principia{idx}}}"] = area.ProductName;
            placeholders[$"{{dosis{idx}}}"] = area.ProductDose;
            var (q1, q2, _, q3, q4) = area.Frequency.GetFrequencyMarkers();
            var (r1, r2, r3, r4) = area.RodentConsumption.ToCheckbox();
            var (rr1, rr2, rr3, rr4) = area.RodentResult.GetResultMarkers();
            var (m1, m2, m3, m4) = area.RodentMaterials.GetMaterialMarkers();

            placeholders[$"{{quinc{idx}}}"] = q1;
            placeholders[$"{{mensual{idx}}}"] = q2;
            placeholders[$"{{trimes{idx}}}"] = q3;
            placeholders[$"{{semes{idx}}}"] = q4;

            placeholders[$"{{parcial{idx}}}"] = r1;
            placeholders[$"{{total{idx}}}"] = r2;
            placeholders[$"{{deterio{idx}}}"] = r3;
            placeholders[$"{{sincons{idx}}}"] = r4;

            placeholders[$"{{activa{idx}}}"] = rr1;
            placeholders[$"{{inactiva{idx}}}"] = rr2;
            placeholders[$"{{roed{idx}}}"] = rr3;
            placeholders[$"{{otros{idx}}}"] = rr4;

            placeholders[$"{{fungi{idx}}}"] = m1;
            placeholders[$"{{cebo{idx}}}"] = m2;
            placeholders[$"{{trampa{idx}}}"] = m3;
            placeholders[$"{{jaula{idx}}}"] = m4;
        }

        var odsBytes = odsTemplate.GenerateOdsFromTemplate(
            placeholders,
            "Templates/roedores_plantilla.ods"
        );

        return (odsBytes, null);
    }
}
