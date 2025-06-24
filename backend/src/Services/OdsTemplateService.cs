using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using PeruControl.Infrastructure.Model;

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

    public (byte[], string?) GenerateSchedule2(List<Schedule2Data> scheduleData)
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
            // First, copy all entries except content.xml
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

            // Now handle content.xml
            var contentEntry = outputArchive.CreateEntry("content.xml");
            using (var entryStream = inputArchive.GetEntry("content.xml")?.Open())
            {
                if (entryStream == null)
                {
                    return ([], "Could not find content.xml in template");
                }

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
                        while (i < scheduleData.Count)
                        {
                            // Find how many consecutive rows share the same MonthName
                            int spanCount = 1;
                            while (
                                i + spanCount < scheduleData.Count
                                && scheduleData[i + spanCount].MonthName
                                    == scheduleData[i].MonthName
                            )
                                spanCount++;

                            for (int j = 0; j < spanCount; j++)
                            {
                                var data = scheduleData[i + j];
                                var newRow = new XElement(templateRow);

                                // Replace placeholders
                                foreach (var cell in newRow.Descendants(textns + "p"))
                                {
                                    var dayName =
                                        char.ToUpper(data.ServiceDayName[0])
                                        + data.ServiceDayName.Substring(1);
                                    cell.Value = cell
                                        .Value.Replace("{{MONTH}}", data.MonthName.ToUpper())
                                        .Replace(
                                            "{{DATE}}",
                                            data.Date.ToString(
                                                "dd/MM/yyyy",
                                                new System.Globalization.CultureInfo("es-PE")
                                            )
                                        )
                                        .Replace("{{DAY}}", dayName)
                                        .Replace("{{SERVICE}}", data.Service)
                                        .Replace("{{DOCUMENTS}}", data.Documents);
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

        return (outputMs.ToArray(), null);
    }

    /// <summary>
    /// Generates a quotation ODS file, from a ODS template.
    /// </summary>
    /// <param name="quotation"></param>
    /// <param name="business"></param>
    /// <returns></returns>
    public (byte[], string?) GenerateQuotation(
        Quotation quotation,
        Business business,
        string templatePath
    )
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
            { "{costo_total}", $"S/. {totalCost:0.00}" },
            { "{productos_desinsectacion}", quotation.Desinsectant ?? "" },
            { "{productos_desratizacion}", quotation.Derodent ?? "" },
            { "{productos_desinfeccion}", quotation.Disinfectant ?? "" },
        };

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
                if (entry.FullName != "content.xml" && entry.FullName != "styles.xml")
                {
                    var newEntry = outputArchive.CreateEntry(entry.FullName);
                    using var entryStream = entry.Open();
                    using var newEntryStream = newEntry.Open();
                    entryStream.CopyTo(newEntryStream);
                }
                else if (entry.FullName == "styles.xml")
                {
                    // Process styles.xml for header/footer content
                    var stylesEntry = outputArchive.CreateEntry("styles.xml");
                    using var entryStream = entry.Open();
                    var xmlDoc = XDocument.Load(entryStream);

                    XNamespace stylens = "urn:oasis:names:tc:opendocument:xmlns:style:1.0";
                    XNamespace textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

        var footer_placeholders = new Dictionary<string, string>
        {
            { "{footer_contact}", quotation.FooterContact ?? "" },
        };

                    // Find all text elements in headers and footers and replace placeholders
                    var textSpans = xmlDoc.Descendants(textns + "span").ToList();
                    foreach (var span in textSpans)
                    {
                        ReplaceInTextSpan(span, footer_placeholders);
                    }
                    var paragraphs = xmlDoc.Descendants(textns + "p").ToList();
                    foreach (var paragraph in paragraphs)
                    {
                        ReplacePlaceholdersInElement(paragraph, footer_placeholders);
                    }

                    // Write the modified styles.xml back to the entry
                    using var newEntryStream = stylesEntry.Open();
                    using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8);
                    writer.Formatting = Formatting.None;
                    xmlDoc.Save(writer);
                }
                else // entry.FullName == "content.xml"
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

    public (byte[]?, string?) GenerateOdsWithRepeatedRows(
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
                        var allRowsInTable = table.Elements(tablens + "table-row").ToList();

                        if (allRowsInTable.Count > templateRowIndex)
                        {
                            var originalTemplateRow = allRowsInTable[templateRowIndex];
                            var clonedTemplateRowForStructure = new XElement(originalTemplateRow);

                            // --- Pre-computation: Map placeholders to column indices from original row 12 template ---
                            var placeholderToColumnIndexMap = new Dictionary<string, int>();
                            var templateCells = clonedTemplateRowForStructure
                                .Elements(tablens + "table-cell")
                                .ToList();
                            foreach (var placeholderKey in rowPlaceholdersToClear) // rowPlaceholdersToClear is passed from AppointmentService
                            {
                                for (int colIdx = 0; colIdx < templateCells.Count; colIdx++)
                                {
                                    var cell = templateCells[colIdx];
                                    bool cellContainsPlaceholder = cell.Descendants(textns + "p")
                                        .Any(p => p.Value.Contains(placeholderKey));
                                    if (cellContainsPlaceholder)
                                    {
                                        if (
                                            !placeholderToColumnIndexMap.ContainsKey(placeholderKey)
                                        )
                                        {
                                            placeholderToColumnIndexMap[placeholderKey] = colIdx;
                                            break; // Found column for this placeholder, move to next placeholder
                                        }
                                    }
                                }
                            }

                            // --- Pre-computation: Extract styles from style palette row (original row 13) ---
                            var stylePaletteColumnToStyleNameMap = new Dictionary<int, string>();
                            int stylePaletteRowActualIndex = templateRowIndex + 1;
                            if (stylePaletteRowActualIndex < allRowsInTable.Count)
                            {
                                var stylePaletteRowElement = allRowsInTable[
                                    stylePaletteRowActualIndex
                                ];
                                var stylePaletteCells = stylePaletteRowElement
                                    .Elements(tablens + "table-cell")
                                    .ToList();
                                for (int colIdx = 0; colIdx < stylePaletteCells.Count; colIdx++)
                                {
                                    string? styleName = stylePaletteCells[colIdx]
                                        .Attribute(tablens + "style-name")
                                        ?.Value;
                                    if (!string.IsNullOrEmpty(styleName))
                                    {
                                        stylePaletteColumnToStyleNameMap[colIdx] = styleName;
                                    }
                                }
                            }
                            // Else: style palette row not found, styling won't be applied. Consider logging.

                            XElement lastInsertedElement = originalTemplateRow;
                            var newRowElements = new List<XElement>();
                            int currentRowNumber = 1; // For {idx} placeholder, 1-based

                            foreach (var rowSpecificData in rowDataList)
                            {
                                var newRow = new XElement(clonedTemplateRowForStructure); // Clone the structure of original row 12
                                var processingData = new Dictionary<string, string>(
                                    rowSpecificData
                                );
                                processingData["{idx}"] = currentRowNumber.ToString();

                                var cellsInNewRow = newRow
                                    .Elements(tablens + "table-cell")
                                    .ToList();

                                // --- Apply conditional styling based on "x" value and style palette ---
                                foreach (var mapEntry in placeholderToColumnIndexMap)
                                {
                                    string placeholderKey = mapEntry.Key;
                                    int columnIndexInRow = mapEntry.Value;

                                    bool isStylablePlaceholder =
                                        placeholderKey.StartsWith("{freq_")
                                        || placeholderKey.StartsWith("{consumo_")
                                        || placeholderKey.StartsWith("{resultado_")
                                        || placeholderKey.StartsWith("{material_");

                                    if (isStylablePlaceholder)
                                    {
                                        if (
                                            processingData.TryGetValue(
                                                placeholderKey,
                                                out string? placeholderActualValue
                                            )
                                            && placeholderActualValue == "x"
                                        )
                                        {
                                            if (
                                                columnIndexInRow < cellsInNewRow.Count
                                                && stylePaletteColumnToStyleNameMap.TryGetValue(
                                                    columnIndexInRow,
                                                    out string? styleNameToApply
                                                )
                                            )
                                            {
                                                cellsInNewRow[columnIndexInRow]
                                                    .SetAttributeValue(
                                                        tablens + "style-name",
                                                        styleNameToApply
                                                    );
                                            }
                                        }
                                    }
                                }

                                // --- Standard placeholder replacement for cell text content ---
                                foreach (var cellP in newRow.Descendants(textns + "p"))
                                {
                                    string currentText = cellP.Value;
                                    foreach (var placeholder in processingData) // Use processingData which includes {idx}
                                    {
                                        currentText = currentText.Replace(
                                            placeholder.Key,
                                            placeholder.Value
                                        );
                                    }
                                    // Clear any template placeholders not filled by this row's specific data (original rowSpecificData)
                                    foreach (var toClear in rowPlaceholdersToClear)
                                    {
                                        if (
                                            !rowSpecificData.ContainsKey(toClear)
                                            && toClear != "{idx}"
                                        ) // Don't clear {idx} if it was in template, it's always set now
                                        {
                                            //This is a bit naive, assumes the placeholder is the entire cell content
                                            // or part of it. If it's not found, it does nothing.
                                            currentText = currentText.Replace(toClear, "");
                                        }
                                    }
                                    cellP.Value = currentText;
                                }
                                newRowElements.Add(newRow);
                                lastInsertedElement.AddAfterSelf(newRow);
                                lastInsertedElement = newRow;
                                currentRowNumber++; // Increment for the next row
                            }
                            originalTemplateRow.Remove();

                            // Now, delete the row that was originally row 13.
                            var currentTableRowsAfterFirstDelete = table
                                .Elements(tablens + "table-row")
                                .ToList();
                            // Its new index is templateRowIndex (original position of row 12) + newRowElements.Count
                            int indexOfOriginalRow13Now = templateRowIndex + newRowElements.Count;

                            if (indexOfOriginalRow13Now < currentTableRowsAfterFirstDelete.Count)
                            {
                                currentTableRowsAfterFirstDelete[indexOfOriginalRow13Now].Remove();
                            }
                            // else: The calculated row to delete (original row 13) is out of bounds.
                        }
                        else
                        {
                            return (
                                null,
                                $"Template row index {templateRowIndex} is out of bounds. Table has {allRowsInTable.Count} rows."
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
                        Formatting = Formatting.None,
                    };
                    xmlDoc.Save(writer);
                }
            }
        }
        return (outputMs.ToArray(), null);
    }

    /// <summary>
    /// Sets a ODS file's dimensions to A4 vertical, and sets the document scale size.
    /// </summary>
    public byte[] ScaleOds(byte[] odsBytes, int scalePercentage = 100)
    {
        using var inputMs = new MemoryStream(odsBytes);
        using var outputMs = new MemoryStream();

        using (var inputArchive = new ZipArchive(inputMs, ZipArchiveMode.Read))
        using (var outputArchive = new ZipArchive(outputMs, ZipArchiveMode.Create))
        {
            foreach (var entry in inputArchive.Entries)
            {
                if (entry.FullName != "styles.xml")
                {
                    // Copy all other entries as-is
                    var newEntry = outputArchive.CreateEntry(entry.FullName);
                    using var entryStream = entry.Open();
                    using var newEntryStream = newEntry.Open();
                    entryStream.CopyTo(newEntryStream);
                }
                else
                {
                    // Modify styles.xml to set scaling to the specified percentage
                    var stylesEntry = outputArchive.CreateEntry("styles.xml");
                    using var entryStream = entry.Open();
                    var xmlDoc = XDocument.Load(entryStream);

                    XNamespace stylens = "urn:oasis:names:tc:opendocument:xmlns:style:1.0";
                    XNamespace fons = "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0";

                    // Find all page-layout elements and set scale-to to the specified percentage and page size to A4
                    var pageLayouts = xmlDoc.Descendants(stylens + "page-layout").ToList();
                    foreach (var pageLayout in pageLayouts)
                    {
                        var pageLayoutProperties = pageLayout.Element(
                            stylens + "page-layout-properties"
                        );
                        if (pageLayoutProperties != null)
                        {
                            pageLayoutProperties.SetAttributeValue(
                                stylens + "scale-to",
                                $"{scalePercentage}%"
                            );
                            pageLayoutProperties.SetAttributeValue(fons + "page-width", "21cm");
                            pageLayoutProperties.SetAttributeValue(fons + "page-height", "29.7cm");
                        }
                    }

                    // Write the modified XML back to the entry
                    using var newEntryStream = stylesEntry.Open();
                    using var writer = new XmlTextWriter(newEntryStream, Encoding.UTF8);
                    writer.Formatting = Formatting.None;
                    xmlDoc.Save(writer);
                }
            }
        }

        return outputMs.ToArray();
    }
}

public record RowData(Dictionary<string, string> Placeholders);

public record Schedule2Data(
    string MonthName,
    DateTime Date,
    string ServiceDayName,
    string Service,
    string Documents
)
{ }
