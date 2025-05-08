using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace PeruControl.Services;

public class WordTemplateService
{
    public byte[] GenerateWordFromTemplate(
        Dictionary<string, string> placeholders,
        string templatePath
    )
    {
        using var ms = new MemoryStream();

        // Copy the template to memory
        using (var fs = File.OpenRead(templatePath))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        using var wordDoc = WordprocessingDocument.Open(ms, true);
        // Get the main document part
        var mainPart = wordDoc.MainDocumentPart;
        if (mainPart == null)
        {
            throw new InvalidOperationException("The template is not valid.");
        }

        // Get the document text
        var doc = mainPart.Document;
        var body = doc.Body;
        if (body == null)
        {
            throw new InvalidOperationException("The template is not valid. No body found.");
        }

        // Replace text in the main document
        foreach (var text in body.Descendants<Text>())
        {
            foreach (var placeholder in placeholders)
            {
                if (text.Text.Contains(placeholder.Key))
                {
                    text.Text = text.Text.Replace(placeholder.Key, placeholder.Value);
                }
            }
        }

        // Also check headers because Microsoft loves complexity
        if (mainPart.HeaderParts != null)
        {
            foreach (var headerPart in mainPart.HeaderParts)
            {
                foreach (var text in headerPart.Header.Descendants<Text>())
                {
                    foreach (var placeholder in placeholders)
                    {
                        if (text.Text.Contains(placeholder.Key))
                        {
                            text.Text = text.Text.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                }
            }
        }

        // And footers, because why make it simple?
        if (mainPart.FooterParts != null)
        {
            foreach (var footerPart in mainPart.FooterParts)
            {
                foreach (var text in footerPart.Footer.Descendants<Text>())
                {
                    foreach (var placeholder in placeholders)
                    {
                        if (text.Text.Contains(placeholder.Key))
                        {
                            text.Text = text.Text.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                }
            }
        }

        // Save the abomination we just created
        wordDoc.Save();

        // Finally, get our bytes
        return ms.ToArray();
    }

    public byte[] GetClonedWordDocument()
    {
        var templatePath = "Templates/nuevos_informes/informe_01.docx";

        using var ms = new MemoryStream();

        // Copy the template to memory
        using (var fs = File.OpenRead(templatePath))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0; // Reset stream position for reading

        return ms.ToArray();
    }

    private static void ProcessTable(
        Body body,
        int tableIndex,
        string templateRowPlaceholderKey,
        IEnumerable<Dictionary<string, string>> dataEntries
    )
    {
        Table table =
            body.Elements<Table>().ElementAtOrDefault(tableIndex)
            ?? throw new InvalidOperationException(
                $"Table at index {tableIndex} was not found in the document."
            );

        TableRow? templateRow = table
            .Elements<TableRow>()
            .FirstOrDefault(row =>
                row.Descendants<Text>().Any(text => text.Text.Contains(templateRowPlaceholderKey))
            );

        if (templateRow == null)
        {
            if (dataEntries.Any())
            {
                throw new InvalidOperationException(
                    $"Template row with placeholder '{templateRowPlaceholderKey}' not found in table at index {tableIndex}, but data was provided."
                );
            }
            return;
        }

        var newRows = new List<TableRow>();
        foreach (var dataEntry in dataEntries)
        {
            var newRow = (TableRow)templateRow.CloneNode(true);
            foreach (var cell in newRow.Elements<TableCell>())
            {
                // Use ToList() to allow modification of the cell's Run structure while iterating
                foreach (var textElement in cell.Descendants<Text>().ToList())
                {
                    string processedText = textElement.Text;
                    foreach (var placeholderEntry in dataEntry)
                    {
                        if (processedText.Contains(placeholderEntry.Key))
                        {
                            processedText = processedText.Replace(
                                placeholderEntry.Key,
                                placeholderEntry.Value
                            );
                        }
                    }

                    if (processedText.Contains('\n'))
                    {
                        if (textElement.Parent is not Run parentRun)
                        {
                            // Fallback if Text element is not directly in a Run, though unlikely for typical content.
                            textElement.Text = processedText; // Newlines will likely not render correctly here.
                            continue;
                        }

                        string[] lines = processedText.Split('\n');
                        textElement.Text = lines[0]; // Set the first line in the original Text element.

                        Run lastAppendedRun = parentRun;

                        for (int i = 1; i < lines.Length; i++)
                        {
                            Run newRunForLine = new();
                            // Copy RunProperties from the original run to maintain formatting if possible.
                            if (parentRun.RunProperties != null)
                            {
                                newRunForLine.RunProperties = (RunProperties)parentRun.RunProperties.CloneNode(true);
                            }
                            newRunForLine.Append(new Break());
                            newRunForLine.Append(new Text(lines[i]));
                            
                            // Insert the new Run after the last one processed (either original or newly added).
                            parentRun!.Parent!.InsertAfter(newRunForLine, lastAppendedRun);
                            lastAppendedRun = newRunForLine;
                        }
                    }
                    else
                    {
                        textElement.Text = processedText;
                    }
                }
            }
            newRows.Add(newRow);
        }

        foreach (var newRow in newRows)
        {
            table.AppendChild(newRow);
        }

        // Remove the original template row only if it was found and processed.
        templateRow.Remove();
    }

    public byte[] GenerateReport01(Model.ProjectAppointment appointment)
    {
        var templatePath = "Templates/nuevos_informes/informe_01.docx";

        using var ms = new MemoryStream();
        using (var fs = File.OpenRead(templatePath))
        {
            fs.CopyTo(ms);
        }
        ms.Position = 0;

        using var wordDoc = WordprocessingDocument.Open(ms, true);
        var mainPart = wordDoc.MainDocumentPart;
        if (mainPart?.Document?.Body == null)
        {
            throw new InvalidOperationException(
                "Invalid Word document template: MainDocumentPart or Body is null."
            );
        }

        var body = mainPart.Document.Body;

        // Data for Table 2 - Replaces mockDataForTable2
        var dataForTable2 = new List<Dictionary<string, string>>();
        if (appointment.TreatmentAreas != null && appointment.TreatmentAreas.Any()) // Assuming TreatmentAreas exists on ProjectAppointment
        {
            dataForTable2 =
            [
                .. appointment
                    .TreatmentAreas.OrderBy(ta => ta.AreaName) // Order by AreaName
                    .Select(ta => new Dictionary<string, string>
                    {
                        { "{area}", ta.AreaName },
                        { "{vector}", ta.ObservedVector ?? "-" },
                        { "{infestation}", ta.InfestationLevel ?? "-" },
                    }),
            ];
        }
        // If TreatmentAreas is null or empty, dataForTable2 will remain empty, and no rows will be added for this table.

        // Data for Table 3 - Replaces mockDataForTable3
        var dataForTable3 = new List<Dictionary<string, string>>();
        if (appointment.TreatmentAreas != null && appointment.TreatmentAreas.Any())
        {
            dataForTable3 =
            [
                .. appointment
                    .TreatmentAreas.OrderBy(ta => ta.AreaName) // Order by AreaName
                    .Select(ta => new Dictionary<string, string>
                    {
                        { "{treated_area}", ta.AreaName },
                        { "{performed_service}", ta.PerformedService ?? "-" },
                        { "{applied_technique}", ta.AppliedTechnique ?? "-" },
                        {
                            "{applied_product}",
                            (ta.TreatmentProducts != null && ta.TreatmentProducts.Any())
                                ? string.Join(
                                    "\n",
                                    ta.TreatmentProducts.Select(tp => tp.Product.Name)
                                )
                                : "-"
                        },
                    }),
            ];
        }

        // Prepare data for Table 4 (products)
        var productsToInsert = new List<Dictionary<string, string>>();
        if (appointment.TreatmentProducts != null && appointment.TreatmentProducts.Any())
        {
            productsToInsert =
            [
                .. appointment.TreatmentProducts.Select(tp => new Dictionary<string, string>
                {
                    { "{product.name}", tp.Product.Name },
                    { "{product.ingredient}", tp.Product.ActiveIngredient },
                    { "{product.amount}", tp.ProductAmountSolvent.AmountAndSolvent },
                    { "{product.equipment}", tp.EquipmentUsed ?? "-" },
                }),
            ];
        }

        // Data for Table 1 - Replaces mockDataForTable1
        var dataForTable1 = new List<Dictionary<string, string>>();
        if (appointment.TreatmentProducts != null && appointment.TreatmentProducts.Any())
        {
            dataForTable1 = [.. appointment.TreatmentProducts
                // No explicit order mentioned for table 1, process as is or add .OrderBy if needed.
                .Select(tp => new Dictionary<string, string>
                {
                    { "{service_date}", "today" }, // Hardcoded as per requirement
                    { "{service_hour}", tp.AppliedTime ?? "-" },
                    { "{treatment_type}", $"{tp.AppliedService ?? "-"}\n{tp.AppliedTechnique ?? "-"}" },
                    { "{used_products}", $"{tp.Product.Name}\n{tp.Product.ActiveIngredient}" }, // Assuming Product and ProductAmountSolvent are non-null based on schema
                    { "{performed_by}", "me" },      // Hardcoded
                    { "{supervisor}", "them" }       // Hardcoded
                })];
        }

        // Process Tables in Order
        ProcessTable(body, 0, "{service_date}", dataForTable1);
        ProcessTable(body, 1, "{area}", dataForTable2);
        ProcessTable(body, 2, "{treated_area}", dataForTable3);
        ProcessTable(body, 3, "{product.name}", productsToInsert);

        wordDoc.Save();
        return ms.ToArray();
    }
}
