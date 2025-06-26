using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using Microsoft.EntityFrameworkCore;
using PeruControl.Controllers;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Services;

public class ScheduleGeneratorService(
    DatabaseContext db,
    LibreOfficeConverterService libreOfficeConverterService
)
{
    public async Task<(byte[] pdfBytes, string? ErrorMessage)> GenerateSchedule01Pdf(Guid id)
    {
        var (odsBytes, errorMsg) = await GenerateSchedule01Sheet(id);
        if (errorMsg != null)
        {
            return ([], errorMsg);
        }

        var (pdfBytes, pdfError) = libreOfficeConverterService.convertTo(odsBytes, "ods", "pdf");
        if (pdfError != null)
        {
            return ([], pdfError);
        }
        return (pdfBytes, null);
    }

    public async Task<(byte[] odsBytes, string? ErrorMessage)> GenerateSchedule01Sheet(Guid id)
    {
        var project = await db
            .Projects.Include(p => p.Client)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return ([], "No se encontró el servicio.");
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
        var templateFile = "Templates/cronograma_01.ods";

        try
        {
            var odsBytes = GenerateMultiMonthOdsSchedule(templateFile, sortedMonths, project);
            return (odsBytes, null);
        }
        catch (Exception ex)
        {
            return ([], $"Error generando el cronograma: {ex.Message}");
        }
    }

    private byte[] GenerateMultiMonthOdsSchedule(
        string templatePath,
        Dictionary<DateTime, List<AppointmentInfo>> appointmentsByMonth,
        Infrastructure.Model.Project project
    )
    {
        using var ms = new MemoryStream();

        // Load the template
        using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        using var outputMs = new MemoryStream();

        using (var inputArchive = new ZipArchive(ms, ZipArchiveMode.Read))
        using (var outputArchive = new ZipArchive(outputMs, ZipArchiveMode.Create))
        {
            // Get the original content.xml to use as template
            var originalContentEntry = inputArchive.GetEntry("content.xml");
            if (originalContentEntry == null)
            {
                throw new Exception("No se encontró content.xml en la plantilla");
            }

            XDocument templateContentDoc;
            using (var entryStream = originalContentEntry.Open())
            {
                templateContentDoc = XDocument.Load(entryStream);
            }

            // Copy all entries except content.xml initially
            foreach (var entry in inputArchive.Entries)
            {
                if (entry.FullName != "content.xml")
                {
                    var newEntry = outputArchive.CreateEntry(entry.FullName);
                    using var entryStream = entry.Open();
                    using var newEntryStream = newEntry.Open();
                    entryStream.CopyTo(newEntryStream);
                }
            }

            // Now create the modified content.xml with multiple sheets
            var contentEntry = outputArchive.CreateEntry("content.xml");
            using (var newEntryStream = contentEntry.Open())
            {
                var modifiedContentDoc = CreateMultiSheetContent(
                    templateContentDoc,
                    appointmentsByMonth,
                    project
                );
                using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8);
                writer.Formatting = Formatting.None;
                modifiedContentDoc.Save(writer);
            }
        }

        return outputMs.ToArray();
    }

    private XDocument CreateMultiSheetContent(
        XDocument templateDoc,
        Dictionary<DateTime, List<AppointmentInfo>> appointmentsByMonth,
        Infrastructure.Model.Project project
    )
    {
        // Define namespaces
        XNamespace officens = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";
        XNamespace tablens = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
        XNamespace textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

        var newDoc = new XDocument(templateDoc);

        // Find the spreadsheet element that contains all tables
        var spreadsheet = newDoc.Descendants(officens + "spreadsheet").FirstOrDefault();
        if (spreadsheet == null)
        {
            throw new Exception("No se encontró el elemento spreadsheet en la plantilla");
        }

        // Get the original table to use as template
        var originalTable = spreadsheet.Elements(tablens + "table").FirstOrDefault();
        if (originalTable == null)
        {
            throw new Exception("No se encontró ninguna tabla en la plantilla");
        }

        // Remove the original table - we'll replace it with our month-specific tables
        originalTable.Remove();

        // Create a table for each month
        foreach (var monthEntry in appointmentsByMonth)
        {
            var month = monthEntry.Key;
            var appointments = monthEntry.Value;

            // Clone the original table structure
            var monthTable = new XElement(originalTable);

            // Set the table name to the month name
            monthTable.SetAttributeValue(tablens + "name", month.GetSpanishMonthYear());

            // Collect unique service combinations for this month
            var uniqueServiceCombinations = appointments
                .Select(appointment => appointment.ServiceNames.OrderBy(s => s).ToList())
                .Distinct(new ListComparer<string>())
                .ToList();

            // Create combination labels using predefined label order
            var combinationLabels = new Dictionary<string, string>();
            var labelsList = new List<string>();

            // Predefined labels in order of preference
            var predefinedLabels = new[] { "D", "F", "T", "DF", "DT", "DR", "DTR", "X" };

            for (int i = 0; i < uniqueServiceCombinations.Count; i++)
            {
                var combination = uniqueServiceCombinations[i];
                var combinationKey = string.Join("|", combination);

                // Use predefined label or "X" if we run out of labels
                string label = i < predefinedLabels.Length ? predefinedLabels[i] : "X";
                combinationLabels[combinationKey] = label;

                // Create the label description (e.g., "D=Fumigación, Desinfección")
                var serviceNames = string.Join(", ", combination);
                labelsList.Add($"{label}={serviceNames}");
            }

            // Join all labels for the service_labels placeholder
            var labelsText = string.Join("; ", labelsList);

            var globalPlaceholders = new Dictionary<string, string>()
            {
                { "{empresa_contratante}", project.Client.RazonSocial ?? project.Client.Name },
                { "{direccion}", project.Address },
                { "{periodo}", month.GetSpanishMonthYear() },
                { "{service_labels}", labelsText },
            };

            // Process dynamic ambient rows (row 10 is the template)
            ProcessDynamicAmbientRows(
                monthTable,
                tablens,
                textns,
                project.Ambients,
                appointments,
                combinationLabels,
                globalPlaceholders
            );

            // Add the completed table to the spreadsheet
            spreadsheet.Add(monthTable);
        }

        return newDoc;
    }

    private static void ProcessDynamicAmbientRows(
        XElement table,
        XNamespace tablens,
        XNamespace textns,
        IList<string> ambients,
        List<AppointmentInfo> appointments,
        Dictionary<string, string> combinationLabels,
        Dictionary<string, string> globalPlaceholders
    )
    {
        // First, replace global placeholders
        ReplaceTablePlaceholders(table, globalPlaceholders, textns);

        // Find all rows in the table
        var allRows = table.Elements(tablens + "table-row").ToList();

        // Row 10 (index 9) is our template row
        const int templateRowIndex = 9;
        if (allRows.Count <= templateRowIndex)
        {
            throw new Exception(
                $"La plantilla debe tener al menos {templateRowIndex + 1} filas. Fila {templateRowIndex + 1} es la plantilla para ambientes."
            );
        }

        var templateRow = allRows[templateRowIndex];
        var templateRowClone = new XElement(templateRow);

        // Create appointment lookup by day and ambient
        var appointmentsByDayAndAmbient = new Dictionary<(int day, string ambient), string>();

        foreach (var appointment in appointments)
        {
            var day = appointment.DateTime.Day;
            var serviceNames = appointment.ServiceNames.OrderBy(s => s).ToList();
            var combinationKey = string.Join("|", serviceNames);
            var combinationLabel = combinationLabels.TryGetValue(combinationKey, out var label)
                ? label
                : "X";

            // Apply to all ambients for this appointment
            foreach (var ambient in ambients)
            {
                appointmentsByDayAndAmbient[(day, ambient)] = combinationLabel;
            }
        }

        // Generate rows for each ambient
        XElement lastInsertedRow = templateRow;
        foreach (var ambient in ambients)
        {
            // Clone the template row
            var ambientRow = new XElement(templateRowClone);

            // Create placeholders for this ambient
            var ambientPlaceholders = new Dictionary<string, string> { { "{ambiente}", ambient } };

            // Add day placeholders (c1 to c31)
            for (int day = 1; day <= 31; day++)
            {
                var dayPlaceholder = $"{{c{day}}}";
                var appointmentLabel = appointmentsByDayAndAmbient.TryGetValue(
                    (day, ambient),
                    out var label
                )
                    ? label
                    : "";
                ambientPlaceholders[dayPlaceholder] = appointmentLabel;
            }

            // Replace placeholders in this row
            ReplaceRowPlaceholders(ambientRow, ambientPlaceholders, textns);

            // Insert the new row after the last inserted row
            lastInsertedRow.AddAfterSelf(ambientRow);
            lastInsertedRow = ambientRow;
        }

        // Remove the original template row
        templateRow.Remove();
    }

    private static void ReplaceRowPlaceholders(
        XElement row,
        Dictionary<string, string> placeholders,
        XNamespace textns
    )
    {
        // Find all text spans and paragraphs in this row
        var textSpans = row.Descendants(textns + "span").ToList();
        foreach (var span in textSpans)
        {
            ReplaceInTextSpan(span, placeholders);
        }

        var paragraphs = row.Descendants(textns + "p").ToList();
        foreach (var paragraph in paragraphs)
        {
            ReplacePlaceholdersInElement(paragraph, placeholders);
        }
    }

    private static void ReplaceTablePlaceholders(
        XElement table,
        Dictionary<string, string> placeholders,
        XNamespace textns
    )
    {
        // Find all text spans and paragraphs that might contain placeholders
        var textSpans = table.Descendants(textns + "span").ToList();
        foreach (var span in textSpans)
        {
            ReplaceInTextSpan(span, placeholders);
        }

        var paragraphs = table.Descendants(textns + "p").ToList();
        foreach (var paragraph in paragraphs)
        {
            ReplacePlaceholdersInElement(paragraph, placeholders);
        }
    }

    private static void ReplaceInTextSpan(XElement span, Dictionary<string, string> placeholders)
    {
        // Process text directly in the span (not in child elements)
        if (span.Nodes().All(n => n.NodeType == System.Xml.XmlNodeType.Text))
        {
            string text = span.Value;
            bool replacementMade = false;

            foreach (var placeholder in placeholders)
            {
                if (text.Contains(placeholder.Key))
                {
                    text = text.Replace(placeholder.Key, placeholder.Value);
                    replacementMade = true;
                }
            }

            if (replacementMade)
            {
                span.Value = text;
            }
        }
        // Handle more complex spans that may have rich text content
        else
        {
            foreach (var node in span.Nodes().ToList())
            {
                if (node is XText textNode)
                {
                    string text = textNode.Value;
                    bool replacementMade = false;

                    foreach (var placeholder in placeholders)
                    {
                        if (text.Contains(placeholder.Key))
                        {
                            text = text.Replace(placeholder.Key, placeholder.Value);
                            replacementMade = true;
                        }
                    }

                    if (replacementMade)
                    {
                        textNode.Value = text;
                    }
                }
                else if (node is XElement childElement)
                {
                    // Recursively process child elements that might contain text
                    if (childElement.Name.LocalName == "span")
                    {
                        ReplaceInTextSpan(childElement, placeholders);
                    }
                }
            }
        }
    }

    private static void ReplacePlaceholdersInElement(
        XElement element,
        Dictionary<string, string> placeholders
    )
    {
        foreach (var node in element.DescendantNodesAndSelf())
        {
            if (node is XText textNode)
            {
                string text = textNode.Value;
                bool replacementMade = false;

                foreach (var placeholder in placeholders)
                {
                    if (text.Contains(placeholder.Key))
                    {
                        text = text.Replace(placeholder.Key, placeholder.Value);
                        replacementMade = true;
                    }
                }

                if (replacementMade)
                {
                    textNode.Value = text;
                }
            }
        }
    }
}
