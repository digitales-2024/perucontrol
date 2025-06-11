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
            .Include(app => app.ProjectOperationSheet)
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

        // Calculate the ordered number by finding the position of this appointment
        // within all appointments of the same project, ordered by due date
        var projectAppointments = await db
            .ProjectAppointments.Where(a => a.Project.Id == appointment.Project.Id)
            .OrderBy(a => a.DueDate)
            .Select(a => new { a.Id, a.DueDate })
            .ToListAsync();

        var orderedNumber =
            projectAppointments
                .Select((app, index) => new { app.Id, OrderedNumber = index + 1 })
                .FirstOrDefault(x => x.Id == id)
                ?.OrderedNumber ?? 1;

        return new SuccessResult<AppointmentGetOutDTO>(
            AppointmentGetOutDTO.FromEntity(appointment, orderedNumber)
        );
    }

    public async Task<(byte[], string?)> FillRodentsExcel(Guid id)
    {
        var business = await db.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return ([], "Datos de la empresa no encontrados.");
        }

        var appointment = await db.Set<ProjectAppointment>()
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .Include(a => a.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return ([], "No se encontró la fecha.");
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
            { "{contacto_empresa}", appointment.CompanyRepresentative ?? "" },
            { "{fecha}", rodentRegister.ServiceDate.ToString("dd/MM/yyyy") },
        };

        // Define the placeholders that are present in the template row (row 12)
        // These will be filled for each rodent area.
        // IMPORTANT: User needs to confirm these are the exact placeholders in their ODS template's 12th row.
        var rodentRowPlaceholders = new List<string>
        {
            "{area_name}",
            "{cebadero_trampa_count}",
            "{product_active_principle}",
            "{product_dose}",
            "{freq_quincenal}",
            "{freq_mensual}",
            "{freq_trimestral}",
            "{freq_semestral}",
            "{consumo_parcial}",
            "{consumo_total}",
            "{consumo_deterioro}",
            "{consumo_sin}",
            "{resultado_activa}",
            "{resultado_inactiva}",
            "{resultado_roedores_vistos}",
            "{resultado_otros}",
            "{material_fungicida}",
            "{material_cebo}",
            "{material_trampa_pegante}",
            "{material_jaula}",
        };

        var rowDataList = new List<Dictionary<string, string>>();
        foreach (var area in rodentRegister.RodentAreas)
        {
            var (q1, q2, _, q3, q4) = area.Frequency.GetFrequencyMarkers(); // Assuming GetFrequencyMarkers returns markers for quinc, mensual, _, trimes, semes
            var (r1, r2, r3, r4) = area.RodentConsumption.ToCheckbox(); // Assuming ToCheckbox returns markers for parcial, total, deterioro, sincons
            var (rr1, rr2, rr3, rr4) = area.RodentResult.GetResultMarkers(); // Assuming GetResultMarkers returns for activa, inactiva, roed, otros
            var (m1, m2, m3, m4) = area.RodentMaterials.GetMaterialMarkers(); // Assuming GetMaterialMarkers returns for fungi, cebo, trampa, jaula

            var areaData = new Dictionary<string, string>
            {
                { "{area_name}", area.Name },
                { "{cebadero_trampa_count}", area.CebaderoTrampa.ToString() },
                { "{product_active_principle}", area.ProductName },
                { "{product_dose}", area.ProductDose },
                { "{freq_quincenal}", q1 },
                { "{freq_mensual}", q2 },
                { "{freq_trimestral}", q3 },
                { "{freq_semestral}", q4 },
                { "{consumo_parcial}", r1 },
                { "{consumo_total}", r2 },
                { "{consumo_deterioro}", r3 },
                { "{consumo_sin}", r4 },
                { "{resultado_activa}", rr1 },
                { "{resultado_inactiva}", rr2 },
                { "{resultado_roedores_vistos}", rr3 },
                { "{resultado_otros}", rr4 },
                { "{material_fungicida}", m1 },
                { "{material_cebo}", m2 },
                { "{material_trampa_pegante}", m3 },
                { "{material_jaula}", m4 },
            };
            rowDataList.Add(areaData);
        }

        // Ensure there are at least 10 rows for rodent areas, padding with empty data if necessary
        int desiredMinimumRows = 10;
        while (rowDataList.Count < desiredMinimumRows)
        {
            var emptyRowData = new Dictionary<string, string>();
            foreach (var key in rodentRowPlaceholders) // rodentRowPlaceholders is already defined
            {
                emptyRowData[key] = ""; // Fill with empty strings
            }
            rowDataList.Add(emptyRowData);
        }

        var (odsBytes, error) = odsTemplate.GenerateOdsWithRepeatedRows(
            placeholders,
            rowDataList,
            "Templates/roedores_plantilla.ods",
            11, // 0-indexed for row 12
            rodentRowPlaceholders
        );

        if (error != null)
        {
            return ([], error);
        }
        if (odsBytes == null)
        {
            return ([], "Failed to generate ODS file for an unknown reason.");
        }

        return (odsBytes, null);
    }

    public async Task<Result<string>> DuplicateFromPreviousAppointment(Guid appointmentId)
    {
        // Get the target appointment (the one we want to populate)
        var targetAppointment = await db
            .ProjectAppointments.Include(a => a.Project)
            .Include(a => a.Services)
            .Include(a => a.ProjectOperationSheet)
            .Include(a => a.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .Include(a => a.Certificate)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (targetAppointment == null)
            return new NotFoundResult<string>("No se encontró la cita especificada.");

        // Get the previous appointment in the same project (ordered by DueDate)
        var previousAppointment = await db
            .ProjectAppointments.Include(a => a.Services)
            .Include(a => a.ProjectOperationSheet)
            .Include(a => a.RodentRegister)
            .ThenInclude(r => r.RodentAreas)
            .Include(a => a.Certificate)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .Include(a => a.CompleteReport)
            .Include(a => a.Report1)
            .Include(a => a.Report2)
            .Include(a => a.Report3)
            .Include(a => a.Report4)
            .Where(a =>
                a.Project.Id == targetAppointment.Project.Id
                && a.DueDate < targetAppointment.DueDate
            )
            .OrderByDescending(a => a.DueDate)
            .FirstOrDefaultAsync();

        if (previousAppointment == null)
            return new NotFoundResult<string>(
                "No se encontró una cita anterior en este proyecto para duplicar."
            );

        using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            // 1. Duplicate Services (many-to-many relationship)
            targetAppointment.Services.Clear();
            foreach (var service in previousAppointment.Services)
            {
                targetAppointment.Services.Add(service);
            }

            // 2. Remove existing data first
            if (targetAppointment.ProjectOperationSheet != null)
            {
                db.Remove(targetAppointment.ProjectOperationSheet);
            }

            if (targetAppointment.RodentRegister != null)
            {
                var existingAreas = await db
                    .RodentAreas.Where(ra =>
                        ra.RodentRegister.ProjectAppointmentId == targetAppointment.Id
                    )
                    .ToListAsync();
                db.RemoveRange(existingAreas);
                db.Remove(targetAppointment.RodentRegister);
            }

            if (targetAppointment.Certificate != null)
            {
                db.Remove(targetAppointment.Certificate);
            }

            var existingTreatmentProducts = await db
                .TreatmentProducts.Where(tp => tp.ProjectAppointment.Id == targetAppointment.Id)
                .ToListAsync();
            db.RemoveRange(existingTreatmentProducts);

            var existingTreatmentAreas = await db
                .TreatmentAreas.Where(ta => ta.ProjectAppointment.Id == targetAppointment.Id)
                .ToListAsync();
            db.RemoveRange(existingTreatmentAreas);

            // 3. Duplicate ProjectOperationSheet
            if (previousAppointment.ProjectOperationSheet != null)
            {
                var newOperationSheet = new ProjectOperationSheet
                {
                    ProjectAppointmentId = targetAppointment.Id,
                    OperationDate = previousAppointment.ProjectOperationSheet.OperationDate, // Keep original date
                    TreatedAreas = previousAppointment.ProjectOperationSheet.TreatedAreas,
                    Insects = previousAppointment.ProjectOperationSheet.Insects,
                    Rodents = previousAppointment.ProjectOperationSheet.Rodents,
                    RodentConsumptionPartial = previousAppointment
                        .ProjectOperationSheet
                        .RodentConsumptionPartial,
                    RodentConsumptionTotal = previousAppointment
                        .ProjectOperationSheet
                        .RodentConsumptionTotal,
                    RodentConsumptionDeteriorated = previousAppointment
                        .ProjectOperationSheet
                        .RodentConsumptionDeteriorated,
                    RodentConsumptionNone = previousAppointment
                        .ProjectOperationSheet
                        .RodentConsumptionNone,
                    OtherPlagues = previousAppointment.ProjectOperationSheet.OtherPlagues,
                    AspersionManual = previousAppointment.ProjectOperationSheet.AspersionManual,
                    AspercionMotor = previousAppointment.ProjectOperationSheet.AspercionMotor,
                    NebulizacionFrio = previousAppointment.ProjectOperationSheet.NebulizacionFrio,
                    NebulizacionCaliente = previousAppointment
                        .ProjectOperationSheet
                        .NebulizacionCaliente,
                    ColocacionCebosCebaderos = previousAppointment
                        .ProjectOperationSheet
                        .ColocacionCebosCebaderos,
                    NumeroCeboTotal = previousAppointment.ProjectOperationSheet.NumeroCeboTotal,
                    NumeroCeboRepuestos = previousAppointment
                        .ProjectOperationSheet
                        .NumeroCeboRepuestos,
                    NroPlanchasPegantes = previousAppointment
                        .ProjectOperationSheet
                        .NroPlanchasPegantes,
                    NroJaulasTomahawk = previousAppointment.ProjectOperationSheet.NroJaulasTomahawk,
                    Insecticide = previousAppointment.ProjectOperationSheet.Insecticide,
                    Insecticide2 = previousAppointment.ProjectOperationSheet.Insecticide2,
                    InsecticideAmount = previousAppointment.ProjectOperationSheet.InsecticideAmount,
                    InsecticideAmount2 = previousAppointment
                        .ProjectOperationSheet
                        .InsecticideAmount2,
                    Rodenticide = previousAppointment.ProjectOperationSheet.Rodenticide,
                    RodenticideAmount = previousAppointment.ProjectOperationSheet.RodenticideAmount,
                    Desinfectant = previousAppointment.ProjectOperationSheet.Desinfectant,
                    DesinfectantAmount = previousAppointment
                        .ProjectOperationSheet
                        .DesinfectantAmount,
                    OtherProducts = previousAppointment.ProjectOperationSheet.OtherProducts,
                    OtherProductsAmount = previousAppointment
                        .ProjectOperationSheet
                        .OtherProductsAmount,
                    DegreeInsectInfectivity = previousAppointment
                        .ProjectOperationSheet
                        .DegreeInsectInfectivity,
                    DegreeRodentInfectivity = previousAppointment
                        .ProjectOperationSheet
                        .DegreeRodentInfectivity,
                    Staff1 = previousAppointment.ProjectOperationSheet.Staff1,
                    Staff2 = previousAppointment.ProjectOperationSheet.Staff2,
                    Staff3 = previousAppointment.ProjectOperationSheet.Staff3,
                    Staff4 = previousAppointment.ProjectOperationSheet.Staff4,
                    Observations = previousAppointment.ProjectOperationSheet.Observations,
                    Recommendations = previousAppointment.ProjectOperationSheet.Recommendations,
                };

                db.Add(newOperationSheet);
            }

            // 4. Duplicate RodentRegister and RodentAreas
            if (previousAppointment.RodentRegister != null)
            {
                var newRodentRegister = new RodentRegister
                {
                    ProjectAppointmentId = targetAppointment.Id,
                    ServiceDate = previousAppointment.RodentRegister.ServiceDate, // Keep original date
                    Incidents = previousAppointment.RodentRegister.Incidents,
                    CorrectiveMeasures = previousAppointment.RodentRegister.CorrectiveMeasures,
                };

                db.Add(newRodentRegister);

                // Duplicate RodentAreas
                foreach (var area in previousAppointment.RodentRegister.RodentAreas)
                {
                    var newArea = new RodentArea
                    {
                        RodentRegister = newRodentRegister,
                        Name = area.Name,
                        CebaderoTrampa = area.CebaderoTrampa,
                        Frequency = area.Frequency,
                        RodentConsumption = area.RodentConsumption,
                        RodentResult = area.RodentResult,
                        RodentMaterials = area.RodentMaterials,
                        ProductName = area.ProductName,
                        ProductDose = area.ProductDose,
                    };
                    db.Add(newArea);
                }
            }

            // 5. Duplicate Certificate
            if (previousAppointment.Certificate != null)
            {
                var newCertificate = new Certificate
                {
                    ProjectAppointmentId = targetAppointment.Id,
                    ExpirationDate = previousAppointment.Certificate.ExpirationDate, // Keep original expiration date
                };

                db.Add(newCertificate);
            }

            // 6. Duplicate TreatmentProducts
            foreach (var treatmentProduct in previousAppointment.TreatmentProducts)
            {
                var newTreatmentProduct = new TreatmentProduct
                {
                    ProjectAppointment = targetAppointment,
                    Product = treatmentProduct.Product,
                    ProductAmountSolvent = treatmentProduct.ProductAmountSolvent,
                    EquipmentUsed = treatmentProduct.EquipmentUsed,
                    AppliedTechnique = treatmentProduct.AppliedTechnique,
                    AppliedService = treatmentProduct.AppliedService,
                    AppliedTime = treatmentProduct.AppliedTime,
                };
                db.Add(newTreatmentProduct);
            }

            // 7. Duplicate TreatmentAreas
            foreach (var treatmentArea in previousAppointment.TreatmentAreas)
            {
                var newTreatmentArea = new PeruControl.Model.TreatmentArea
                {
                    ProjectAppointment = targetAppointment,
                    AreaName = treatmentArea.AreaName,
                    ObservedVector = treatmentArea.ObservedVector,
                    InfestationLevel = treatmentArea.InfestationLevel,
                    PerformedService = treatmentArea.PerformedService,
                    AppliedTechnique = treatmentArea.AppliedTechnique,
                };
                db.Add(newTreatmentArea);
            }

            // 8. Update only CompanyRepresentative (not dates or other appointment metadata)
            targetAppointment.CompanyRepresentative = previousAppointment.CompanyRepresentative;

            // Save all changes
            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new SuccessResult<string>(
                "Datos duplicados exitosamente desde la cita anterior."
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new ErrorResult<string>($"Error al duplicar los datos: {ex.Message}");
        }
    }

    private static PeruControl.Model.Reports.ContentSection CloneContentSection(
        PeruControl.Model.Reports.ContentSection section
    )
    {
        return section switch
        {
            PeruControl.Model.Reports.TextBlock textBlock => new PeruControl.Model.Reports.TextBlock
            {
                Title = textBlock.Title,
                Numbering = textBlock.Numbering,
                Level = textBlock.Level,
                Sections = textBlock.Sections.Select(CloneContentSection).ToArray(),
            },
            PeruControl.Model.Reports.TextArea textArea => new PeruControl.Model.Reports.TextArea
            {
                Content = textArea.Content,
            },
            _ => throw new ArgumentException($"Unknown content section type: {section.GetType()}"),
        };
    }
}
