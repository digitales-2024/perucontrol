using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Linq;

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
        Table table = body.Elements<Table>().ElementAtOrDefault(tableIndex)
            ?? throw new InvalidOperationException($"Table at index {tableIndex} was not found in the document.");

        TableRow? templateRow = table.Elements<TableRow>()
            .FirstOrDefault(row => row.Descendants<Text>().Any(text => text.Text.Contains(templateRowPlaceholderKey)));
        
        if (templateRow == null)
        {
            // If there are no data entries, not finding a template row might be acceptable if the table was meant to be empty.
            // However, if there are data entries, then a template row is essential.
            if (dataEntries.Any())
            {
                throw new InvalidOperationException($"Template row with placeholder '{templateRowPlaceholderKey}' not found in table at index {tableIndex}, but data was provided.");
            }
            // No data entries and no template row, nothing to do for this table.
            return;
        }

        var newRows = new List<TableRow>();
        foreach (var dataEntry in dataEntries)
        {
            var newRow = (TableRow)templateRow.CloneNode(true); // Deep clone
            foreach (var cell in newRow.Elements<TableCell>())
            {
                foreach (var textElement in cell.Descendants<Text>()) // Process all Text descendants in a cell
                {
                    string currentCellText = textElement.Text;
                    foreach (var placeholderEntry in dataEntry)
                    {
                            currentCellText = currentCellText.Replace(placeholderEntry.Key, placeholderEntry.Value);
                    }
                    textElement.Text = currentCellText;
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
            throw new InvalidOperationException("Invalid Word document template: MainDocumentPart or Body is null.");
        }

        var body = mainPart.Document.Body;

        // Mock data for Table 1
        var mockDataForTable1 = new List<Dictionary<string, string>>
        {
            new() {
                { "{service_date}", "2024-07-29" },
                { "{service_hour}", "09:00 AM" },
                { "{treatment_type}", "Fumigation" },
                { "{used_products}", "Product X, Product Y" },
                { "{performed_by}", "John Doe" },
                { "{supervisor}", "Jane Smith" }
            },
            new() {
                { "{service_date}", "2024-07-30" },
                { "{service_hour}", "10:30 AM" },
                { "{treatment_type}", "Disinfection" },
                { "{used_products}", "Product Z" },
                { "{performed_by}", "Peter Pan" },
                { "{supervisor}", "Wendy Darling" }
            },
            new() {
                { "{service_date}", "2024-07-31" },
                { "{service_hour}", "02:15 PM" },
                { "{treatment_type}", "Pest Control" },
                { "{used_products}", "Product A, Product B, Product C" },
                { "{performed_by}", "Alice Wonderland" },
                { "{supervisor}", "Mad Hatter" }
            }
        };

        // Mock data for Table 2
        var mockDataForTable2 = new List<Dictionary<string, string>>
        {
            new() { { "{area}", "Residential Area Alpha" }, { "{vector}", "Aedes aegypti" }, { "{infestation}", "High" } },
            new() { { "{area}", "Commercial Zone Beta" }, { "{vector}", "Culex quinquefasciatus" }, { "{infestation}", "Medium" } },
            new() { { "{area}", "Industrial Park Gamma" }, { "{vector}", "Anopheles darlingi" }, { "{infestation}", "Low" } }
        };
        
        // Mock data for Table 3
        var mockDataForTable3 = new List<Dictionary<string, string>>
        {
            new() { { "{treated_area}", "Mock Area 1" }, { "{performed_service}", "Mock Service A" }, { "{applied_technique}", "Mock Technique X" }, { "{applied_product}", "Mock Product P1" } },
            new() { { "{treated_area}", "Mock Area 2" }, { "{performed_service}", "Mock Service B" }, { "{applied_technique}", "Mock Technique Y" }, { "{applied_product}", "Mock Product P2" } },
            new() { { "{treated_area}", "Mock Area 3" }, { "{performed_service}", "Mock Service C" }, { "{applied_technique}", "Mock Technique Z" }, { "{applied_product}", "Mock Product P3" } }
        };

        // Prepare data for Table 4 (products)
        var productsToInsert = new List<Dictionary<string, string>>();
        if (appointment.TreatmentProducts != null && appointment.TreatmentProducts.Any())
        {
            productsToInsert = appointment.TreatmentProducts
                .Select(tp => new Dictionary<string, string>
                {
                    { "{product.name}", tp.Product.Name },
                    { "{product.ingredient}", tp.Product.ActiveIngredient },
                    { "{product.amount}", tp.ProductAmountSolvent.AmountAndSolvent },
                    { "{product.equipment}", tp.EquipmentUsed ?? "-" }
                }).ToList();
        }

        // Process Tables in Order
        ProcessTable(body, 0, "{service_date}", mockDataForTable1);
        ProcessTable(body, 1, "{area}", mockDataForTable2);
        ProcessTable(body, 2, "{treated_area}", mockDataForTable3);
        ProcessTable(body, 3, "{product.name}", productsToInsert);

        wordDoc.Save();
        return ms.ToArray();
    }
}
