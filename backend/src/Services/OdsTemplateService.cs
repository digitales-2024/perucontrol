using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using PeruControl.Model;

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

                    var paragraphs = xmlDoc.Descendants(textns + "p").ToList();
                    foreach (var paragraph in paragraphs)
                    {
                        ReplacePlaceholdersInElement(paragraph, placeholders);
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
                                while (
                                    i + spanCount < mockData.Count
                                    && mockData[i + spanCount].MonthName == mockData[i].MonthName
                                )
                                    spanCount++;

                                for (int j = 0; j < spanCount; j++)
                                {
                                    var data = mockData[i + j];
                                    var newRow = new XElement(templateRow);

                                    // Replace placeholders
                                    foreach (var cell in newRow.Descendants(textns + "p"))
                                    {
                                        cell.Value = cell
                                            .Value.Replace("{{MONTH}}", data.MonthName)
                                            .Replace("{{DATE}}", data.Date.ToString("yyyy-MM-dd"))
                                            .Replace("{{DAY}}", data.ServiceDayName)
                                            .Replace("{{SERVICE}}", data.Service)
                                            .Replace("{{DOCUMENTS}}", data.Doucuments);
                                    }

                                    // Handle merging for the first row of the group
                                    if (j == 0)
                                    {
                                        // Set number-rows-spanned on the first cell
                                        var monthCell = newRow
                                            .Elements(tablens + "table-cell")
                                            .FirstOrDefault();
                                        monthCell?.SetAttributeValue(
                                            tablens + "number-rows-spanned",
                                            spanCount
                                        );
                                    }
                                    else
                                    {
                                        // Remove the first cell for subsequent rows (merged cell)
                                        var monthCell = newRow
                                            .Elements(tablens + "table-cell")
                                            .FirstOrDefault();
                                        if (monthCell != null)
                                        {
                                            // Replace with a covered cell
                                            var coveredCell = new XElement(
                                                tablens + "table-cell",
                                                new XAttribute(
                                                    tablens + "number-columns-repeated",
                                                    1
                                                ),
                                                new XAttribute(
                                                    tablens + "covered-table-cell",
                                                    "true"
                                                )
                                            );
                                            monthCell.ReplaceWith(coveredCell);
                                        }
                                    }

                                    lastInserted.AddAfterSelf(newRow);
                                    lastInserted = newRow;
                                }

                                i += spanCount;
                            }

                            // Remove the original template row (row 6)
                            insertAfterRow.Remove();
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

    public (byte[], string?) GenerateQuotation(Quotation quotation, Business business)
    {
        var areAddressesDifferent = quotation.Client.FiscalAddress != quotation.ServiceAddress;
        var quotationNumber =
            quotation.CreatedAt.ToString("yy") + "-" + quotation.QuotationNumber.ToString("D4");
        var totalCost = quotation.QuotationServices.Sum(s => s.Price ?? 0);

        var placeholders = new Dictionary<string, string>
        {
            { "{{digesa_habilitacion}}", business.DigesaNumber },
            { "{{direccion_perucontrol}}", business.Address },
            { "{{ruc_perucontrol}}", business.RUC },
            { "{{celulares_perucontrol}}", business.Phones },
            { "{{gerente_perucontrol}}", business.DirectorName },
            { "{{fecha_cotizacion}}", quotation.CreationDate.ToString("dd/MM/yyyy") },
            { "{{cod_cotizacion}}", quotationNumber },
            { "{{nro_cliente}}", quotation.Client.ClientNumber.ToString("D4") },
            { "{{fecha_exp_cotizacion}}", quotation.ExpirationDate.ToString("dd/MM/yyyy") },
            { "{{nombre_cliente}}", quotation.Client.RazonSocial ?? quotation.Client.Name },
            { "{{direccion_fiscal_cliente}}", quotation.Client.FiscalAddress },
            { "{{trabajos_realizar_en}}", areAddressesDifferent ? "Trabajos a realizar en:" : "" },
            {
                "{{direccion_servicio_cliente}}",
                areAddressesDifferent ? quotation.ServiceAddress : ""
            },
            { "{{contacto_cliente}}", quotation.Client.ContactName ?? "" },
            { "{{banco_perucontrol}}", business.BankName },
            { "{{cuenta_banco_perucontrol}}", business.BankAccount },
            { "{{cci_perucontrol}}", business.BankCCI },
            { "{{detracciones_perucontrol}}", business.Deductions },
            { "{{forma_pago}}", quotation.PaymentMethod },
            { "{{disponibilidad}}", quotation.Availability },
            { "{{observaciones}}", quotation.Others },
            { "{{frecuencia_servicio}}", quotation.Frequency.ToSpanishString() },
            { "{servicio_impuestos}", quotation.HasTaxes ? "Si" : "No" },
            { "{{tiene_igv_2}}", quotation.HasTaxes ? "SI" : "NO" },
            { "{costo_total}", $"S/. {totalCost.ToString("0.00")}" },
            { "{productos_desinsectacion}", quotation.Desinsectant ?? "" },
            { "{productos_desratizacion}", quotation.Derodent ?? "" },
            { "{productos_desinfeccion}", quotation.Disinfectant ?? "" },
        };

        var templatePath = "Templates/cotizacion_plantilla.ods";
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

                    // Replace global placeholders as before
                    var textSpans = xmlDoc.Descendants(textns + "span").ToList();
                    foreach (var span in textSpans)
                    {
                        ReplaceInTextSpan(span, placeholders);
                    }
                    var paragraphs = xmlDoc.Descendants(textns + "p").ToList();
                    foreach (var paragraph in paragraphs)
                    {
                        ReplacePlaceholdersInElement(paragraph, placeholders);
                    }

                    // Find the first table in the document
                    var table = xmlDoc.Descendants(tablens + "table").FirstOrDefault();
                    if (table != null)
                    {
                        // 1. Generate TermsAndConditions rows at row 31 (index 30, before service rows are added)
                        var rows = table.Elements(tablens + "table-row").ToList();
                        if (rows.Count > 30)
                        {
                            var termsRow = table
                                .Elements(tablens + "table-row")
                                .FirstOrDefault(r =>
                                    r.Descendants(textns + "p")
                                        .Any(p => p.Value.Contains("{terms}"))
                                );

                            if (termsRow != null && quotation.TermsAndConditions != null)
                            {
                                XElement lastInserted = termsRow;
                                for (int i = 0; i < quotation.TermsAndConditions.Count; i++)
                                {
                                    var term = quotation.TermsAndConditions[i];
                                    if (term == null || term == "")
                                    {
                                        continue;
                                    }

                                    var newRow = new XElement(termsRow);
                                    foreach (var cell in newRow.Descendants(textns + "p"))
                                    {
                                        cell.Value = cell
                                            .Value.Replace("{terms}", term)
                                            .Replace("{idx}", (i + 2).ToString());
                                    }
                                    lastInserted.AddAfterSelf(newRow);
                                    lastInserted = newRow;
                                }
                                termsRow.Remove();
                            }
                        }

                        // ...now continue with your service row generation as before...
                        // (your existing code for finding and replacing the service row template)
                        rows = table.Elements(tablens + "table-row").ToList();
                        if (rows.Count > 20)
                        {
                            var templateRow = table
                                .Elements(tablens + "table-row")
                                .FirstOrDefault(r =>
                                    r.Descendants(textns + "p")
                                        .Any(p => p.Value.Contains("{servicio_cantidad}"))
                                );

                            if (templateRow != null)
                            {
                                XElement lastInserted = templateRow;
                                foreach (var service in quotation.QuotationServices)
                                {
                                    var newRow = new XElement(templateRow);
                                    var price = "";
                                    if (service.Price == null || service.Price == 0.0m)
                                    {
                                        price = "plus";
                                    }
                                    else
                                    {
                                        price = service.Price?.ToString("0.00") ?? "plus";
                                    }

                                    foreach (var cell in newRow.Descendants(textns + "p"))
                                    {
                                        cell.Value = cell
                                            .Value.Replace(
                                                "{servicio_cantidad}",
                                                service.Amount.ToString()
                                            )
                                            .Replace(
                                                "{servicio_descripcion}",
                                                service.NameDescription
                                            )
                                            .Replace("{servicio_costo}", $"S/. {price}")
                                            .Replace(
                                                "{servicio_accesorios}",
                                                service.Accesories ?? ""
                                            );
                                    }

                                    lastInserted.AddAfterSelf(newRow);
                                    lastInserted = newRow;
                                }
                                templateRow.Remove();
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

    public (
        byte[]?,
        string?
    ) GenerateOdsWithRepeatedRows(
        Dictionary<string, string> globalPlaceholders,
        List<Dictionary<string, string>> rowDataList,
        string templatePath,
        int templateRowIndex, // 0-indexed
        List<string> rowPlaceholdersToClear // placeholders in the template row that need to be set
    )
    {
        using var ms = new MemoryStream();

        try
        {
            using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                fs.CopyTo(ms);
            }
            ms.Position = 0;
        }
        catch (Exception ex)
        {
            return (null, $"Error reading template file: {ex.Message}");
        }

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
                    XNamespace officens = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";

                    // 1. Replace global placeholders
                    var textSpans = xmlDoc.Descendants(textns + "span").ToList();
                    foreach (var span in textSpans)
                    {
                        ReplaceInTextSpan(span, globalPlaceholders);
                    }
                    var paragraphs = xmlDoc.Descendants(textns + "p").ToList();
                    foreach (var paragraph in paragraphs)
                    {
                        ReplacePlaceholdersInElement(paragraph, globalPlaceholders);
                    }

                    // 2. Find the first table and process rows
                    var table = xmlDoc.Descendants(tablens + "table").FirstOrDefault();
                    if (table != null)
                    {
                        var rows = table.Elements(tablens + "table-row").ToList();

                        if (rows.Count > templateRowIndex)
                        {
                            var originalTemplateRow = rows[templateRowIndex];
                            var clonedTemplateRow = new XElement(originalTemplateRow); // Clone for multiple uses

                            XElement lastInsertedElement = originalTemplateRow;

                            foreach (var rowSpecificData in rowDataList)
                            {
                                var newRow = new XElement(clonedTemplateRow); // Clone the template for each new row

                                // Replace placeholders within this new row
                                foreach (
                                    var cellP in newRow.Descendants(textns + "p")
                                )
                                {
                                    string currentText = cellP.Value;
                                    foreach (var placeholder in rowSpecificData)
                                    {
                                        currentText = currentText.Replace(
                                            placeholder.Key,
                                            placeholder.Value
                                        );
                                    }
                                    // Clear any template placeholders not filled by this row's specific data
                                    foreach (var toClear in rowPlaceholdersToClear)
                                    {
                                        if (!rowSpecificData.ContainsKey(toClear)) // only clear if not set
                                        {
                                             //This is a bit naive, assumes the placeholder is the entire cell content
                                             // or part of it. If it's not found, it does nothing.
                                            currentText = currentText.Replace(toClear, "");
                                        }
                                    }
                                    cellP.Value = currentText;
                                }
                                lastInsertedElement.AddAfterSelf(newRow);
                                lastInsertedElement = newRow;
                            }
                            originalTemplateRow.Remove(); // Remove the original template row
                        }
                        else
                        {
                            return (
                                null,
                                $"Template row index {templateRowIndex} is out of bounds. Table has {rows.Count} rows."
                            );
                        }
                    }
                    else
                    {
                        return (null, "No table found in content.xml.");
                    }

                    using var newEntryStream = contentEntry.Open();
                    using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8)
                    {
                        Formatting = Formatting.None
                    };
                    xmlDoc.Save(writer);
                }
            }
        }
        return (outputMs.ToArray(), null);
    }
}

public record RowData(Dictionary<string, string> Placeholders);

public record Schedule2Data(
    string MonthName,
    DateTime Date,
    string ServiceDayName,
    string Service,
    string Doucuments
) { }
