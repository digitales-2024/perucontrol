using System.Text;
using PeruControl.Model;

namespace PeruControl.Services;

public class CsvExportService
{
    public byte[] ExportClientsToCsv(IEnumerable<Client> clients, DateTime? startDate = null, DateTime? endDate = null)
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
        csv.AppendLine("ClientNumber,TypeDocument,TypeDocumentValue,RazonSocial,BusinessType,Name,FiscalAddress,Email,PhoneNumber,ContactName,IsActive,CreatedAt,ModifiedAt");
        
        // Data rows
        foreach (var client in finalClients)
        {
            csv.AppendLine($"{client.ClientNumber}," +
                          $"\"{EscapeCsvValue(client.TypeDocument)}\"," +
                          $"\"{EscapeCsvValue(client.TypeDocumentValue)}\"," +
                          $"\"{EscapeCsvValue(client.RazonSocial)}\"," +
                          $"\"{EscapeCsvValue(client.BusinessType)}\"," +
                          $"\"{EscapeCsvValue(client.Name)}\"," +
                          $"\"{EscapeCsvValue(client.FiscalAddress)}\"," +
                          $"\"{EscapeCsvValue(client.Email)}\"," +
                          $"\"{EscapeCsvValue(client.PhoneNumber)}\"," +
                          $"\"{EscapeCsvValue(client.ContactName)}\"," +
                          $"{client.IsActive}," +
                          $"{client.CreatedAt:yyyy-MM-dd HH:mm:ss}," +
                          $"{client.ModifiedAt:yyyy-MM-dd HH:mm:ss}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }
    
    private static string EscapeCsvValue(string? value)
    {
        if (value == null) return "";
        
        // Escape quotes by doubling them and handle line breaks
        return value.Replace("\"", "\"\"").Replace("\n", " ").Replace("\r", " ");
    }
} 