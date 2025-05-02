using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace PeruControl.Services;

public class OdsTemplateService
{
    public byte[] GenerateOdsFromTemplate(
        Dictionary<string, string> placeholders,
        string templatePath
    )
    {
        using var ms = new MemoryStream();

        // Copy the template to memory
        using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        // Create a new memory stream for the output
        using var outputMs = new MemoryStream();

        // ODS files are ZIP files, so use ZipArchive to manipulate the contents
        using (var inputArchive = new ZipArchive(ms, ZipArchiveMode.Read))
        using (var outputArchive = new ZipArchive(outputMs, ZipArchiveMode.Create))
        {
            // Copy all entries except content.xml (which we'll modify)
            foreach (var entry in inputArchive.Entries)
            {
                if (entry.FullName != "content.xml")
                {
                    // Simply copy the entry
                    var newEntry = outputArchive.CreateEntry(entry.FullName);
                    using var entryStream = entry.Open();
                    using var newEntryStream = newEntry.Open();
                    entryStream.CopyTo(newEntryStream);
                }
                else
                {
                    // Process content.xml - this contains the spreadsheet cells
                    var contentEntry = outputArchive.CreateEntry("content.xml");
                    using var entryStream = entry.Open();

                    // Load the XML
                    var xmlDoc = XDocument.Load(entryStream);

                    // Define namespaces used in ODS files
                    XNamespace officens = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";
                    XNamespace textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
                    XNamespace tablens = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";

                    // Find all text spans that might contain placeholders
                    var textSpans = xmlDoc.Descendants(textns + "span").ToList();
                    foreach (var span in textSpans)
                    {
                        ReplaceInTextSpan(span, placeholders);
                    }

                    // Find all paragraph elements that might contain placeholders
                    var paragraphs = xmlDoc.Descendants(textns + "p").ToList();
                    foreach (var paragraph in paragraphs)
                    {
                        // Only process direct text in paragraphs (not in child spans)
                        if (!paragraph.Descendants(textns + "span").Any() && paragraph.Value != "")
                        {
                            string text = paragraph.Value;
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
                                paragraph.Value = text;
                            }
                        }
                    }

                    // Write the modified XML back to the entry
                    using var newEntryStream = contentEntry.Open();
                    using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8);
                    writer.Formatting = Formatting.None; // Preserve original formatting
                    xmlDoc.Save(writer);
                }
            }
        }

        // Return the modified ODS file as a byte array
        return outputMs.ToArray();
    }

    private void ReplaceInTextSpan(XElement span, Dictionary<string, string> placeholders)
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

public (byte[], string?) GenerateSchedule2(List<Schedule2Data> mockData)
{
    var templatePath = "Templates/cronograma_plantilla_2.ods";
    using var ms = new MemoryStream();
    using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
    {
        fs.CopyTo(ms);
    }
    ms.Position = 0;
    using var outputMs = new MemoryStream();

    using (var inputArchive = new ZipArchive(ms, ZipArchiveMode.Read))
    using (var outputArchive = new ZipArchive(outputMs, ZipArchiveMode.Create))
    {
        foreach (var entry in inputArchive.Entries)
        {
            if (entry.FullName != "content.xml")
            {
                var newEntry = outputArchive.CreateEntry(entry.FullName);
                using var entryStream = entry.Open();
                using var newEntryStream = newEntry.Open();
                entryStream.CopyTo(newEntryStream);
            }
            else
            {
                var contentEntry = outputArchive.CreateEntry("content.xml");
                using var entryStream = entry.Open();
                var xmlDoc = XDocument.Load(entryStream);

                XNamespace tablens = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
                XNamespace textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

                // Find the first table in the document
                var table = xmlDoc.Descendants(tablens + "table").FirstOrDefault();
                if (table != null)
                {
                    // Get all rows in the table
                    var rows = table.Elements(tablens + "table-row").ToList();

                    // Ensure there are at least 6 rows
                    if (rows.Count > 6)
                    {
                        var insertAfterRow = rows[5]; // 6th row (index 5)
                        var templateRow = new XElement(insertAfterRow); // Clone as template

                        XElement lastInserted = insertAfterRow;

                        int i = 0;
                        while (i < mockData.Count)
                        {
                            // Find how many consecutive rows share the same MonthName
                            int spanCount = 1;
                            while (i + spanCount < mockData.Count && mockData[i + spanCount].MonthName == mockData[i].MonthName)
                                spanCount++;

                            for (int j = 0; j < spanCount; j++)
                            {
                                var data = mockData[i + j];
                                var newRow = new XElement(templateRow);

                                // Replace placeholders
                                foreach (var cell in newRow.Descendants(textns + "p"))
                                {
                                    cell.Value = cell.Value
                                        .Replace("{{MONTH}}", data.MonthName)
                                        .Replace("{{DATE}}", data.Date.ToString("yyyy-MM-dd"))
                                        .Replace("{{DAY}}", data.ServiceDayName)
                                        .Replace("{{SERVICE}}", data.Service)
                                        .Replace("{{DOCUMENTS}}", data.Doucuments);
                                }

                                // Handle merging for the first row of the group
                                if (j == 0)
                                {
                                    // Set number-rows-spanned on the first cell
                                    var monthCell = newRow.Elements(tablens + "table-cell").FirstOrDefault();
                                    monthCell?.SetAttributeValue(tablens + "number-rows-spanned", spanCount);
                                }
                                else
                                {
                                    // Remove the first cell for subsequent rows (merged cell)
                                    var monthCell = newRow.Elements(tablens + "table-cell").FirstOrDefault();
                                    if (monthCell != null)
                                    {
                                        // Replace with a covered cell
                                        var coveredCell = new XElement(tablens + "table-cell",
                                            new XAttribute(tablens + "number-columns-repeated", 1),
                                            new XAttribute(tablens + "covered-table-cell", "true")
                                        );
                                        monthCell.ReplaceWith(coveredCell);
                                    }
                                }

                                lastInserted.AddAfterSelf(newRow);
                                lastInserted = newRow;
                            }

                            i += spanCount;
                        }
                    }
                }

                // Write the modified XML back to the entry
                using var newEntryStream = contentEntry.Open();
                using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8);
                writer.Formatting = Formatting.None;
                xmlDoc.Save(writer);
            }
        }
    }

    return (outputMs.ToArray(), null);
}
}

public record Schedule2Data(
    string MonthName,
    DateTime Date,
    string ServiceDayName,
    string Service,
    string Doucuments
) {}