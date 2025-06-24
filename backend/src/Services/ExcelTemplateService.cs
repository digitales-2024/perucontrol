using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using PeruControl.Controllers;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Services;

public class ExcelTemplateService
{
    public byte[] GenerateExcelFromTemplate(
        Dictionary<string, string> placeholders,
        string templatePath
    )
    {
        using var ms = new MemoryStream();

        using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        // duplicate the stream as writeable
        using var newPackage = SpreadsheetDocument.Open(ms, true);
        if (newPackage == null)
        {
            throw new Exception("Couldnt load spreadsheet");
        }

        // Get the first worksheet
        var workbookPart = newPackage.WorkbookPart;
        if (workbookPart == null)
        {
            throw new Exception("Couldnt load workbook");
        }

        var worksheetPart = workbookPart.WorksheetParts.First();
        var sharedStringPart = workbookPart.SharedStringTablePart;

        if (sharedStringPart == null)
        {
            throw new Exception("Couldnt load shared string part");
        }

        // Replace placeholders in cells
        ReplaceSharedStringPlaceholders(worksheetPart, sharedStringPart, placeholders);

        newPackage.Save();

        return ms.ToArray();
    }

    private void ReplaceSharedStringPlaceholders(
        WorksheetPart worksheetPart,
        SharedStringTablePart sharedStringPart,
        Dictionary<string, string> placeholders
    )
    {
        // Get all cells that use shared strings
        var cells = worksheetPart
            .Worksheet.Descendants<Cell>()
            .Where(c => c.DataType != null && c.DataType == CellValues.SharedString)
            .ToList();

        // Track which shared strings have been modified
        var modifiedSharedStrings = new Dictionary<int, bool>();

        foreach (var cell in cells)
        {
            var stringId = int.Parse(cell.InnerText);

            // Skip if we've already processed this shared string
            if (modifiedSharedStrings.ContainsKey(stringId))
                continue;

            var sharedStringItem = sharedStringPart
                .SharedStringTable.Elements<SharedStringItem>()
                .ElementAt(stringId);

            // Check if the shared string contains placeholders
            bool hasPlaceholder = placeholders.Keys.Any(key =>
                sharedStringItem.InnerText.Contains(key)
            );

            if (hasPlaceholder)
            {
                // Mark this shared string as modified
                modifiedSharedStrings[stringId] = true;

                // Handle rich text (with formatting)
                if (sharedStringItem.Elements<Run>().Any())
                {
                    ReplaceInRichText(sharedStringItem, placeholders);
                }
                // Handle plain text
                else if (sharedStringItem.Elements<Text>().Any())
                {
                    var textElement = sharedStringItem.Elements<Text>().First();
                    var text = textElement.Text;
                    foreach (var placeholder in placeholders)
                    {
                        if (text.Contains(placeholder.Key))
                        {
                            text = text.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                    textElement.Text = text;
                }
            }
        }

        // Save the changes
        sharedStringPart.SharedStringTable.Save();
    }

    private void ReplaceSharedStringPlaceholders2(
        WorksheetPart worksheetPart,
        SharedStringTablePart sharedStringPart,
        Dictionary<string, string> placeholders
    )
    {
        // Get all cells IN THIS SPECIFIC WORKSHEET that use shared strings
        var cells = worksheetPart
            .Worksheet.Descendants<Cell>()
            .Where(c => c.DataType != null && c.DataType == CellValues.SharedString)
            .ToList();

        // Track which shared string indices we've already processed for this worksheet
        var processedIndices = new HashSet<int>();

        foreach (var cell in cells)
        {
            var stringId = int.Parse(cell.InnerText);

            // Skip if we've already processed this shared string index for this worksheet
            if (processedIndices.Contains(stringId))
                continue;

            var sharedStringItem = sharedStringPart
                .SharedStringTable.Elements<SharedStringItem>()
                .ElementAtOrDefault(stringId);

            if (sharedStringItem == null)
                continue;

            // Check if this shared string has placeholders by examining all text parts
            bool hasPlaceholder = false;
            foreach (var textElement in sharedStringItem.Descendants<Text>())
            {
                if (placeholders.Keys.Any(key => textElement.Text.Contains(key)))
                {
                    hasPlaceholder = true;
                    break;
                }
            }

            if (hasPlaceholder)
            {
                // Mark this index as processed
                processedIndices.Add(stringId);

                // Replace placeholders directly in the shared string item
                // Handle rich text (with formatting)
                if (sharedStringItem.Elements<Run>().Any())
                {
                    foreach (var run in sharedStringItem.Elements<Run>())
                    {
                        var textElement = run.Elements<Text>().FirstOrDefault();
                        if (textElement != null)
                        {
                            string text = textElement.Text;
                            foreach (var placeholder in placeholders)
                            {
                                if (text.Contains(placeholder.Key))
                                {
                                    text = text.Replace(placeholder.Key, placeholder.Value);
                                }
                            }
                            textElement.Text = text;
                        }
                    }
                }
                // Handle plain text
                else if (sharedStringItem.Elements<Text>().Any())
                {
                    var textElement = sharedStringItem.Elements<Text>().First();
                    string text = textElement.Text;
                    foreach (var placeholder in placeholders)
                    {
                        if (text.Contains(placeholder.Key))
                        {
                            text = text.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                    textElement.Text = text;
                }
            }
        }

        // Don't save individual worksheet here - let the main method handle saving
    }

    private void ReplaceInRichText(
        SharedStringItem sharedString,
        Dictionary<string, string> placeholders
    )
    {
        // For each Run element that contains text
        foreach (var run in sharedString.Elements<Run>())
        {
            var textElement = run.Elements<Text>().FirstOrDefault();
            if (textElement != null)
            {
                var text = textElement.Text;
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
                    textElement.Text = text;
                }
            }
        }
    }

    public byte[] GenerateMultiMonthSchedule(
        string templatePath,
        Dictionary<DateTime, List<AppointmentInfo>> appointmentsByMonth,
        Infrastructure.Model.Project project
    )
    {
        // Load the template excel
        using var ms = new MemoryStream();

        using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        // duplicate the stream as writeable
        using var document =
            SpreadsheetDocument.Open(ms, true) ?? throw new Exception("Couldnt load spreadsheet");

        // Get the first worksheet
        var workbookPart = document.WorkbookPart ?? throw new Exception("Couldnt load workbook");
        var workbook = workbookPart.Workbook ?? throw new Exception("Couldnt load workbook");
        var sheets = workbook.Descendants<Sheet>().ToList();
        var firstSheet =
            sheets.FirstOrDefault() ?? throw new Exception("No sheets found in template.");
        var templateWorksheetPart =
            (WorksheetPart)workbookPart.GetPartById(firstSheet.Id!)
            ?? throw new Exception("Couldnt load template worksheet part");

        // Get the shared string part once outside the loop
        var sharedStringPart =
            workbookPart.SharedStringTablePart
            ?? throw new Exception("Couldn't load shared string part");

        // Get the current maximum sheet ID to avoid conflicts
        var maxSheetId = sheets.Max(s => s.SheetId?.Value ?? 0);
        var currentSheetId = maxSheetId;

        // Create a new worksheet for each month in the dictionary
        foreach (var entry in appointmentsByMonth)
        {
            var month = entry.Key;

            // Clone the worksheet
            var clonedWorksheetPart = CloneWorksheet(workbookPart, templateWorksheetPart);

            // Set the worksheet name to the month name
            string sheetName = month.GetSpanishMonthYear();
            currentSheetId++; // Increment for each new sheet
            var relationshipId = workbookPart.GetIdOfPart(clonedWorksheetPart);

            // Add the new sheet after the last sheet
            var sheet = new Sheet()
            {
                Id = relationshipId,
                SheetId = currentSheetId,
                Name = sheetName,
            };

            workbook.GetFirstChild<Sheets>()?.AppendChild(sheet);

            // Collect unique service combinations for this month
            var uniqueServiceCombinations = entry
                .Value.Select(appointment => appointment.ServiceNames.OrderBy(s => s).ToList())
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

            // Join all labels for the {service_labels} placeholder
            var labelsText = string.Join("; ", labelsList);

            var placeholders = new Dictionary<string, string>()
            {
                { "{empresa_contratante}", project.Client.RazonSocial ?? project.Client.Name },
                { "{direccion}", project.Address },
                { "{periodo}", "-" },
                { "{service_labels}", labelsText },
            };

            // Fill Ambients, up to 8
            var projectAmbients = project.Ambients;
            var projectAmbientsCount = projectAmbients.Count();
            for (var i = 1; i <= 8; i += 1)
            {
                if (i > projectAmbientsCount)
                {
                    placeholders[$"{{ambiente_{i}}}"] = "";
                }
                else
                {
                    var ambient = projectAmbients[i - 1];
                    placeholders[$"{{ambiente_{i}}}"] = ambient;
                }
            }

            // Generate placeholders for every day available on the list
            for (var i = 1; i <= 8; i += 1)
            {
                for (var j = 1; j <= 31; j += 1)
                {
                    placeholders[$"{{{i}_{j}}}"] = "";
                }
            }

            foreach (var appointment in entry.Value)
            {
                var day = appointment.DateTime.Day.ToString();
                var serviceNames = appointment.ServiceNames.OrderBy(s => s).ToList();

                // Find the label for this service combination
                var combinationKey = string.Join("|", serviceNames);
                var combinationLabel = combinationLabels[combinationKey];

                for (var i = 1; i <= projectAmbientsCount; i += 1)
                {
                    placeholders[$"{{{i}_{day}}}"] = combinationLabel;
                }
            }

            ReplaceSharedStringPlaceholders2(clonedWorksheetPart, sharedStringPart, placeholders);
        }

        // Save the shared string table once after all modifications
        sharedStringPart.SharedStringTable.Save();

        // Remove the template sheet safely
        var sheetsElement = workbook.GetFirstChild<Sheets>();
        if (sheetsElement != null && firstSheet != null)
        {
            // Make sure we have other sheets before removing the template
            if (sheetsElement.Elements<Sheet>().Count() > 1)
            {
                sheetsElement.RemoveChild(firstSheet);
                // Remove the corresponding worksheet part
                workbookPart.DeletePart(templateWorksheetPart);
            }
        }

        // Save the excel file
        document.Save();

        // Return the excel file as a byte array
        // Profit
        return ms.ToArray();
    }

    public byte[] GenerateScheduleSecondFormat(string templatePath, Project project)
    {
        // Load the template excel
        using var ms = new MemoryStream();

        using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        // Return the excel file as a byte array
        // Profit
        return ms.ToArray();
    }

    private WorksheetPart CloneWorksheet(
        WorkbookPart workbookPart,
        WorksheetPart sourceWorksheetPart
    )
    {
        // Create a new worksheet part
        WorksheetPart newWorksheetPart = workbookPart.AddNewPart<WorksheetPart>();

        // Copy content from the source worksheet
        using (Stream sourceStream = sourceWorksheetPart.GetStream())
        using (Stream targetStream = newWorksheetPart.GetStream(FileMode.Create))
        {
            sourceStream.CopyTo(targetStream);
        }

        // Copy any drawing, etc.
        if (sourceWorksheetPart.DrawingsPart != null)
        {
            DrawingsPart newDrawingsPart = newWorksheetPart.AddNewPart<DrawingsPart>();

            // This is critical for floating images
            newWorksheetPart
                .Worksheet.Descendants<DocumentFormat.OpenXml.Spreadsheet.Drawing>()
                .First()
                .Id = newWorksheetPart.GetIdOfPart(newDrawingsPart);

            using (Stream sourceStream = sourceWorksheetPart.DrawingsPart.GetStream())
            using (Stream targetStream = newDrawingsPart.GetStream(FileMode.Create))
            {
                sourceStream.CopyTo(targetStream);
            }

            // Copy all image parts associated with the drawing
            foreach (ImagePart imagePart in sourceWorksheetPart.DrawingsPart.ImageParts)
            {
                ImagePart newImagePart = newDrawingsPart.AddImagePart(imagePart.ContentType);
                using (Stream sourceStream = imagePart.GetStream())
                using (Stream targetStream = newImagePart.GetStream(FileMode.Create))
                {
                    sourceStream.CopyTo(targetStream);
                }

                // Fix the relationship ID between drawing and image
                string oldImageId = sourceWorksheetPart.DrawingsPart.GetIdOfPart(imagePart);
                string newImageId = newDrawingsPart.GetIdOfPart(newImagePart);
                var rootEl =
                    newDrawingsPart.RootElement ?? throw new Exception("Root element is null");

                // Update all references in the drawing
                foreach (var element in rootEl.Descendants())
                {
                    List<OpenXmlAttribute> attributes = element.GetAttributes().ToList();
                    for (int i = 0; i < attributes.Count; i++)
                    {
                        var attr = attributes[i];
                        if (attr.Value == oldImageId)
                        {
                            // Remove old attribute and add new one with updated value
                            element.RemoveAttribute(attr.LocalName, attr.NamespaceUri);
                            element.SetAttribute(
                                new OpenXmlAttribute(
                                    attr.Prefix,
                                    attr.LocalName,
                                    attr.NamespaceUri,
                                    newImageId
                                )
                            );
                        }
                    }
                }
            }

            // Copy any chart parts if they exist
            foreach (ChartPart chartPart in sourceWorksheetPart.DrawingsPart.ChartParts)
            {
                ChartPart newChartPart = newDrawingsPart.AddNewPart<ChartPart>();
                using (Stream sourceStream = chartPart.GetStream())
                using (Stream targetStream = newChartPart.GetStream(FileMode.Create))
                {
                    sourceStream.CopyTo(targetStream);
                }
            }
        }

        return newWorksheetPart;
    }
}

// Helper class to compare lists for equality
public class ListComparer<T> : IEqualityComparer<List<T>>
{
    public bool Equals(List<T>? x, List<T>? y)
    {
        if (x == null && y == null)
            return true;
        if (x == null || y == null)
            return false;
        if (x.Count != y.Count)
            return false;

        for (int i = 0; i < x.Count; i++)
        {
            if (!EqualityComparer<T>.Default.Equals(x[i], y[i]))
                return false;
        }
        return true;
    }

    public int GetHashCode(List<T> obj)
    {
        if (obj == null)
            return 0;

        int hash = 17;
        foreach (var item in obj)
        {
            hash = hash * 31 + (item?.GetHashCode() ?? 0);
        }
        return hash;
    }
}
