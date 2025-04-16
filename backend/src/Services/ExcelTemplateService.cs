using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using PeruControl.Controllers;

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
        Dictionary<DateTime, List<AppointmentInfo>> appointmentsByMonth
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
        using var document = SpreadsheetDocument.Open(ms, true) ?? throw new Exception("Couldnt load spreadsheet");

        // Get the first worksheet
        var workbookPart = document.WorkbookPart ?? throw new Exception("Couldnt load workbook");
        var workbook = workbookPart.Workbook ?? throw new Exception("Couldnt load workbook");
        var sheets = workbook.Descendants<Sheet>().ToList();
        var firstSheet = sheets.FirstOrDefault() ?? throw new Exception("No sheets found in template.");
        var templateWorksheetPart = (WorksheetPart)workbookPart.GetPartById(firstSheet.Id) ?? throw new Exception("Couldnt load template worksheet part");

        // Create a new worksheet for each month in the dictionary
        foreach (var month in appointmentsByMonth.Keys)
        {
            // Clone the worksheet
            var clonedWorksheetPart = CloneWorksheet(workbookPart, templateWorksheetPart);

            // Set the worksheet name to the month name
            string sheetName = month.GetSpanishMonthYear();
            var sheetId = (uint)(sheets.Count + 1); // Generate ID
            var relationshipId = workbookPart.GetIdOfPart(clonedWorksheetPart);

            // Add the new sheet after the last sheet
            var sheet = new Sheet()
            {
                Id = relationshipId,
                SheetId = sheetId,
                Name = sheetName,
            };

            workbook.GetFirstChild<Sheets>()?.AppendChild(sheet);

            // Replace placeholders in the cloned worksheet
            var sharedStringPart = workbookPart.SharedStringTablePart;
            if (sharedStringPart == null)
                throw new Exception("Couldn't load shared string part");

            // TODO:
            // Fill each month template with data from the month appointments
            ReplaceSharedStringPlaceholders(clonedWorksheetPart, sharedStringPart, new() { });
        }

        // Save the excel file
        document.Save();

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
            using (Stream sourceStream = sourceWorksheetPart.DrawingsPart.GetStream())
            using (Stream targetStream = newDrawingsPart.GetStream(FileMode.Create))
            {
                sourceStream.CopyTo(targetStream);
            }
        }

        return newWorksheetPart;
    }
}
