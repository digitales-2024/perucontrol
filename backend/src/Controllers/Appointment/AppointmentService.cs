using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

public class AppointmentService(DatabaseContext db, OdsTemplateService odsTemplate)
{
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
            { "{fecha_servicio}", rodentRegister.ServiceDate.ToString("dd/MM/yyy") },
            { "{hora_ingreso}", rodentRegister.EnterTime.ToString(@"hh\:mm") },
            { "{hora_salida}", rodentRegister.LeaveTime.ToString(@"hh\:mm") },
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

            placeholders[$"{{area_{idx}}}"] = area.CebaderoTrampa.ToString();
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
