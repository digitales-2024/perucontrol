using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

public class ProjectService(DatabaseContext db, ExcelTemplateService excelTemplateService)
{
    /// <summary>
    /// Collects all appointments, organizes them, and generates an excel file
    /// with a worksheet for each month, in order.
    /// </summary>
    public async Task<(byte[]?, string?)> GenerateAppointmentScheduleExcel(Guid projectId)
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

        // Send the data to the excel generation system
        var bytes = excelTemplateService.GenerateMultiMonthSchedule(
            "Templates/cronograma_plantilla.xlsx",
            sortedMonths,
            project
        );
        return (bytes, null);
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
