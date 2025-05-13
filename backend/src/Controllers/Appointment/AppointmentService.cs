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
}
