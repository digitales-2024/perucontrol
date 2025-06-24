using System.Text;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Services;

public class CsvExportService
{
    public byte[] ExportClientsToCsv(
        IEnumerable<Client> clients,
        DateTime? startDate = null,
        DateTime? endDate = null
    )
    {
        // Apply date filtering if parameters are provided
        var filteredClients = clients.AsQueryable();

        if (startDate.HasValue)
        {
            filteredClients = filteredClients.Where(c => c.CreatedAt >= startDate.Value);
        }
        else
        {
            // If no start date, use Unix epoch start (January 1, 1970)
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            filteredClients = filteredClients.Where(c => c.CreatedAt >= unixStart);
        }

        if (endDate.HasValue)
        {
            // Include the entire end date (until end of day)
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            filteredClients = filteredClients.Where(c => c.CreatedAt <= endOfDay);
        }
        else
        {
            // If no end date, use current UTC time
            filteredClients = filteredClients.Where(c => c.CreatedAt <= DateTime.UtcNow);
        }

        var finalClients = filteredClients.ToList();

        var csv = new StringBuilder();

        // Header
        csv.AppendLine(
            "ClientNumber,TypeDocument,TypeDocumentValue,RazonSocial,BusinessType,Name,FiscalAddress,Email,PhoneNumber,ContactName,IsActive,CreatedAt,ModifiedAt"
        );

        // Data rows
        foreach (var client in finalClients)
        {
            csv.AppendLine(
                $"{client.ClientNumber},"
                    + $"\"{EscapeCsvValue(client.TypeDocument)}\","
                    + $"\"{EscapeCsvValue(client.TypeDocumentValue)}\","
                    + $"\"{EscapeCsvValue(client.RazonSocial)}\","
                    + $"\"{EscapeCsvValue(client.BusinessType)}\","
                    + $"\"{EscapeCsvValue(client.Name)}\","
                    + $"\"{EscapeCsvValue(client.FiscalAddress)}\","
                    + $"\"{EscapeCsvValue(client.Email)}\","
                    + $"\"{EscapeCsvValue(client.PhoneNumber)}\","
                    + $"\"{EscapeCsvValue(client.ContactName)}\","
                    + $"{client.IsActive},"
                    + $"{client.CreatedAt:yyyy-MM-dd HH:mm:ss},"
                    + $"{client.ModifiedAt:yyyy-MM-dd HH:mm:ss}"
            );
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportSuppliersToCsv(
        IEnumerable<Supplier> suppliers,
        DateTime? startDate = null,
        DateTime? endDate = null
    )
    {
        // Apply date filtering if parameters are provided
        var filteredSuppliers = suppliers.AsQueryable();

        if (startDate.HasValue)
        {
            filteredSuppliers = filteredSuppliers.Where(s => s.CreatedAt >= startDate.Value);
        }
        else
        {
            // If no start date, use Unix epoch start (January 1, 1970)
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            filteredSuppliers = filteredSuppliers.Where(s => s.CreatedAt >= unixStart);
        }

        if (endDate.HasValue)
        {
            // Include the entire end date (until end of day)
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            filteredSuppliers = filteredSuppliers.Where(s => s.CreatedAt <= endOfDay);
        }
        else
        {
            // If no end date, use current UTC time
            filteredSuppliers = filteredSuppliers.Where(s => s.CreatedAt <= DateTime.UtcNow);
        }

        var finalSuppliers = filteredSuppliers.ToList();

        var csv = new StringBuilder();

        // Header
        csv.AppendLine(
            "SupplierNumber,RucNumber,BusinessName,BusinessType,Name,FiscalAddress,Email,PhoneNumber,ContactName,IsActive,CreatedAt,ModifiedAt"
        );

        // Data rows
        foreach (var supplier in finalSuppliers)
        {
            csv.AppendLine(
                $"{supplier.SupplierNumber},"
                    + $"\"{EscapeCsvValue(supplier.RucNumber)}\","
                    + $"\"{EscapeCsvValue(supplier.BusinessName)}\","
                    + $"\"{EscapeCsvValue(supplier.BusinessType)}\","
                    + $"\"{EscapeCsvValue(supplier.Name)}\","
                    + $"\"{EscapeCsvValue(supplier.FiscalAddress)}\","
                    + $"\"{EscapeCsvValue(supplier.Email)}\","
                    + $"\"{EscapeCsvValue(supplier.PhoneNumber)}\","
                    + $"\"{EscapeCsvValue(supplier.ContactName)}\","
                    + $"{supplier.IsActive},"
                    + $"{supplier.CreatedAt:yyyy-MM-dd HH:mm:ss},"
                    + $"{supplier.ModifiedAt:yyyy-MM-dd HH:mm:ss}"
            );
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportQuotationsToCsv(
        IEnumerable<Quotation> quotations,
        DateTime? startDate = null,
        DateTime? endDate = null
    )
    {
        // Apply date filtering if parameters are provided
        var filteredQuotations = quotations.AsQueryable();

        if (startDate.HasValue)
        {
            filteredQuotations = filteredQuotations.Where(q => q.CreatedAt >= startDate.Value);
        }
        else
        {
            // If no start date, use Unix epoch start (January 1, 1970)
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            filteredQuotations = filteredQuotations.Where(q => q.CreatedAt >= unixStart);
        }

        if (endDate.HasValue)
        {
            // Include the entire end date (until end of day)
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            filteredQuotations = filteredQuotations.Where(q => q.CreatedAt <= endOfDay);
        }
        else
        {
            // If no end date, use current UTC time
            filteredQuotations = filteredQuotations.Where(q => q.CreatedAt <= DateTime.UtcNow);
        }

        var finalQuotations = filteredQuotations.ToList();

        var csv = new StringBuilder();

        // Header
        csv.AppendLine(
            "QuotationNumber,ClientName,Services,Status,Frequency,HasTaxes,CreationDate,ExpirationDate,ServiceAddress,PaymentMethod,Others,Availability,Desinsectant,Derodent,Disinfectant,TermsAndConditions,IsActive,CreatedAt,ModifiedAt"
        );

        // Data rows
        foreach (var quotation in finalQuotations)
        {
            var servicesString =
                quotation.Services != null
                    ? string.Join("; ", quotation.Services.Select(s => s.Name))
                    : "";

            var termsAndConditionsString =
                quotation.TermsAndConditions != null
                    ? string.Join("; ", quotation.TermsAndConditions)
                    : "";

            csv.AppendLine(
                $"{quotation.QuotationNumber},"
                    + $"\"{EscapeCsvValue(quotation.Client?.Name)}\","
                    + $"\"{EscapeCsvValue(servicesString)}\","
                    + $"\"{quotation.Status}\","
                    + $"\"{quotation.Frequency}\","
                    + $"{quotation.HasTaxes},"
                    + $"{quotation.CreationDate:yyyy-MM-dd},"
                    + $"{quotation.ExpirationDate:yyyy-MM-dd},"
                    + $"\"{EscapeCsvValue(quotation.ServiceAddress)}\","
                    + $"\"{EscapeCsvValue(quotation.PaymentMethod)}\","
                    + $"\"{EscapeCsvValue(quotation.Others)}\","
                    + $"\"{EscapeCsvValue(quotation.Availability)}\","
                    + $"\"{EscapeCsvValue(quotation.Desinsectant)}\","
                    + $"\"{EscapeCsvValue(quotation.Derodent)}\","
                    + $"\"{EscapeCsvValue(quotation.Disinfectant)}\","
                    + $"\"{EscapeCsvValue(termsAndConditionsString)}\","
                    + $"{quotation.IsActive},"
                    + $"{quotation.CreatedAt:yyyy-MM-dd HH:mm:ss},"
                    + $"{quotation.ModifiedAt:yyyy-MM-dd HH:mm:ss}"
            );
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportProjectsToCsv(
        IEnumerable<Project> projects,
        DateTime? startDate = null,
        DateTime? endDate = null
    )
    {
        // Apply date filtering if parameters are provided
        var filteredProjects = projects.AsQueryable();

        if (startDate.HasValue)
        {
            filteredProjects = filteredProjects.Where(p => p.CreatedAt >= startDate.Value);
        }
        else
        {
            // If no start date, use Unix epoch start (January 1, 1970)
            var unixStart = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            filteredProjects = filteredProjects.Where(p => p.CreatedAt >= unixStart);
        }

        if (endDate.HasValue)
        {
            // Include the entire end date (until end of day)
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            filteredProjects = filteredProjects.Where(p => p.CreatedAt <= endOfDay);
        }
        else
        {
            // If no end date, use current UTC time
            filteredProjects = filteredProjects.Where(p => p.CreatedAt <= DateTime.UtcNow);
        }

        var finalProjects = filteredProjects.ToList();

        var csv = new StringBuilder();

        // Header
        csv.AppendLine(
            "ClientName,ProjectNumber,Services,Address,Area,Status,Ambients,Price,AppointmentsCount,IsActive,CreatedAt,ModifiedAt"
        );

        // Data rows
        foreach (var project in finalProjects)
        {
            var servicesString =
                project.Services != null
                    ? string.Join("; ", project.Services.Select(s => s.Name))
                    : "";

            var ambientsString =
                project.Ambients != null ? string.Join("; ", project.Ambients) : "";

            var appointmentsCount = project.Appointments?.Count ?? 0;

            csv.AppendLine(
                $"\"{EscapeCsvValue(project.Client?.Name)}\","
                    + $"{project.ProjectNumber},"
                    + $"\"{EscapeCsvValue(servicesString)}\","
                    + $"\"{EscapeCsvValue(project.Address)}\","
                    + $"{project.Area},"
                    + $"\"{project.Status}\","
                    + $"\"{EscapeCsvValue(ambientsString)}\","
                    + $"{project.Price},"
                    + $"{appointmentsCount},"
                    + $"{project.IsActive},"
                    + $"{project.CreatedAt:yyyy-MM-dd HH:mm:ss},"
                    + $"{project.ModifiedAt:yyyy-MM-dd HH:mm:ss}"
            );
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static string EscapeCsvValue(string? value)
    {
        if (value == null)
            return "";

        // Escape quotes by doubling them and handle line breaks
        return value.Replace("\"", "\"\"").Replace("\n", " ").Replace("\r", " ");
    }
}
