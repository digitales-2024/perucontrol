using System.Text;
using PeruControl.Model;

namespace PeruControl.Services;

public class CsvExportService
{
    public byte[] ExportClientsToCsv(IEnumerable<Client> clients)
    {
        var csv = new StringBuilder();
        
        // Header
        csv.AppendLine("ClientNumber,TypeDocument,TypeDocumentValue,RazonSocial,BusinessType,Name,FiscalAddress,Email,PhoneNumber,ContactName,IsActive,CreatedAt,ModifiedAt");
        
        // Data rows
        foreach (var client in clients)
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