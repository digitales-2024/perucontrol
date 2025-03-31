using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

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

    private void ReplaceSharedStringPlaceholders(WorksheetPart worksheetPart, SharedStringTablePart sharedStringPart, Dictionary<string, string> placeholders)
    {
        // Get all cells that use shared strings
        var cells = worksheetPart.Worksheet.Descendants<Cell>()
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

            var sharedStringItem = sharedStringPart.SharedStringTable.Elements<SharedStringItem>().ElementAt(stringId);

            // Check if the shared string contains placeholders
            bool hasPlaceholder = placeholders.Keys.Any(key =>
                sharedStringItem.InnerText.Contains(key));

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

    private void ReplaceInRichText(SharedStringItem sharedString, Dictionary<string, string> placeholders)
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
}
