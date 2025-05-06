using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

public class ProjectService(
    DatabaseContext db,
    ExcelTemplateService excelTemplateService,
    OdsTemplateService odsTemplateService
)
{
    public async Task<(int, string)> CreateProject(ProjectCreateDTO createDTO)
    {
        var entity = createDTO.MapToEntity();

        // validate the client exists before creating the project
        var client = await db.Set<Client>().FindAsync(createDTO.ClientId);
        if (client == null)
            return (404, "Cliente no encontrado");

        entity.Client = client;

        // if a quotation is provided, validate it exists
        Quotation? quotation = null;
        if (createDTO.QuotationId != null)
        {
            quotation = await db.Set<Quotation>().FindAsync(createDTO.QuotationId);
            if (quotation == null)
                return (404, "Cotización no encontrada");
            entity.Quotation = quotation;
        }

        // Validate all services exist
        if (createDTO.Services.Count == 0)
            return (400, "Debe ingresar al menos un servicio");

        // Fetch services from the database by IDs
        var serviceEntities = await db
            .Services.Where(s => createDTO.Services.Contains(s.Id))
            .ToListAsync();

        if (serviceEntities.Count != createDTO.Services.Count)
            return (404, "Algunos servicios no fueron encontrados");

        entity.Services = serviceEntities;

        // merge all appointments with the same date
        var mergedAppointments = createDTO
            .AppointmentCreateDTOs.GroupBy(a => a.DueDate)
            .Select(g => new AppointmentCreateDTOThroughProject
            {
                DueDate = g.Key,
                Services = g.SelectMany(a => a.Services).Distinct().ToList(),
            })
            .ToList();

        createDTO.AppointmentCreateDTOs = mergedAppointments;

        // Validate all appointments have valid service IDs, present in the parent service list
        foreach (var appointment in createDTO.AppointmentCreateDTOs)
        {
            foreach (var serviceId in appointment.Services)
            {
                if (!entity.Services.Any(s => s.Id == serviceId))
                {
                    return (
                            400,
                        $"El servicio {serviceId} no está en la lista de servicios del proyecto"
                    );
                }
            }
        }

        // Create Appointments
        var appointments = new List<ProjectAppointment>();
        foreach (var app in createDTO.AppointmentCreateDTOs)
        {
            var appointmentServices = serviceEntities
                .Where(s => app.Services.Contains(s.Id))
                .ToList();

            appointments.Add(
                new ProjectAppointment
                {
                    DueDate = app.DueDate,
                    Services = appointmentServices,
                    Certificate = new(),
                    RodentRegister = new() { ServiceDate = app.DueDate },
                    ProjectOperationSheet = new() { OperationDate = app.DueDate },
                }
            );
        }
        entity.Appointments = appointments;

        // Create and populate the project
        db.Add(entity);
        await db.SaveChangesAsync();

        return (201, "");
    }


    /// <summary>
    /// Collects all appointments, organizes them, and generates an excel file
    /// with a worksheet for each month, in order.
    /// </summary>
    public async Task<(byte[]?, string?)> GenerateAppointmentScheduleExcel(
        Guid projectId,
        bool isPdf = false
    )
    {
        var project = await db
            .Projects.Include(p => p.Client)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        if (project is null)
        {
            return (null, "No se encontró el servicio.");
        }

        // collect all appoinments into a dictionary, ordered by month
        // Dictionary<string, List<Appointment>>
        var appointmentsByMonth = new Dictionary<DateTime, List<AppointmentInfo>>();
        foreach (var appointment in project.Appointments)
        {
            var month = appointment.DueDate.GetSpanishMonthName();
            var yearMonth = appointment.DueDate.YearMonthOnly();

            if (!appointmentsByMonth.TryGetValue(yearMonth, out List<AppointmentInfo>? value))
            {
                value = [];
                appointmentsByMonth[yearMonth] = value;
            }

            value.Add(
                new()
                {
                    DateTime = appointment.DueDate,
                    ServiceNames = appointment
                        .Services.Select(s => s.Name)
                        .Distinct()
                        .OrderBy(s => s),
                }
            );
        }

        // Sort all appointments inside all months
        foreach (var month in appointmentsByMonth.Keys)
        {
            appointmentsByMonth[month] = [.. appointmentsByMonth[month].OrderBy(a => a.DateTime)];
        }

        // Sort the months
        var sortedMonths = appointmentsByMonth.OrderBy(m => m.Key).ToDictionary();
        var templateFile = isPdf
            ? "Templates/cronograma_plantilla_pdf.xlsx"
            : "Templates/cronograma_plantilla.xlsx";

        // Send the data to the excel generation system
        var bytes = excelTemplateService.GenerateMultiMonthSchedule(
            templateFile,
            sortedMonths,
            project
        );
        return (bytes, null);
    }

    public async Task<(byte[], string?)> GenerateAppointmentSchedule2Excel(Guid projectId)
    {
        var project = await db
            .Projects.Include(p => p.Client)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        if (project is null)
        {
            return ([], "No se encontró el servicio.");
        }

        // Transform appointments into Schedule2Data
        var scheduleData = project
            .Appointments.OrderBy(a => a.DueDate)
            .Select(a => new Schedule2Data(
                a.DueDate.GetSpanishMonthName(),
                a.DueDate,
                a.DueDate.ToString("dddd", new System.Globalization.CultureInfo("es-PE")),
                string.Join(",", a.Services.Select(s => s.Name.Trim()).OrderBy(n => n)),
                "Documentos"
            ))
            .ToList();

        // Send the data to the ODS generation system
        return odsTemplateService.GenerateSchedule2(scheduleData);
    }
}

public class AppointmentInfo
{
    public required DateTime DateTime { get; set; }
    public required IEnumerable<string> ServiceNames { get; set; }

    public string ServiceLetterList() =>
        ServiceNames == null || !ServiceNames.Any()
            ? string.Empty
            : string.Join(",", ServiceNames.Select(name => ServiceToLetter(name)));

    public static char ServiceToLetter(string service)
    {
        if (service == "Fumigación")
            return 'F';
        if (service == "Desinfección")
            return 'I';
        if (service == "Desinsectación")
            return 'D';
        if (service == "Desratización")
            return 'R';
        if (service == "Limpieza de tanque")
            return 'T';

        throw new ArgumentException($"No se encontró la letra para el servicio {service}");
    }
}

public static class DateHelper
{
    public static string GetSpanishMonthName(this DateTime date)
    {
        return date.ToString("MMMM", new System.Globalization.CultureInfo("es-PE"));
    }

    public static string GetSpanishMonthYear(this DateTime date)
    {
        return date.ToString("MMMM yyyy", new System.Globalization.CultureInfo("es-PE"));
    }

    public static DateTime YearMonthOnly(this DateTime date)
    {
        return new DateTime(date.Year, date.Month, 1);
    }
}
