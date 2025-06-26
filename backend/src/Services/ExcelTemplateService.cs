using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
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
