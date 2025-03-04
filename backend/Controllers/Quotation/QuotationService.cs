using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace PeruControl.Controllers;

public class QuotationService
{
    public byte[] GenerateQuotationFromTemplate(
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

        // Get the first worksheet - because who needs multiple sheets anyway?
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
        foreach (var cell in worksheetPart.Worksheet.Descendants<Cell>())
        {
            if (cell.DataType != null && cell.DataType == CellValues.SharedString)
            {
                var stringId = int.Parse(cell.InnerText);
                var text = sharedStringPart.SharedStringTable.ElementAt(stringId).InnerText;

                // Check if text contains any placeholder
                foreach (var placeholder in placeholders)
                {
                    if (text.Contains(placeholder.Key))
                    {
                        text = text.Replace(placeholder.Key, placeholder.Value);
                        cell.CellValue = new CellValue(text);
                        cell.DataType = CellValues.String;
                    }
                }
            }
        }

        newPackage.Save();

        return ms.ToArray();
    }
}
