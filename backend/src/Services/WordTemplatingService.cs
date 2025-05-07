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
        // Access the 4th table (index 3) more safely
        Table table = body.Elements<Table>().ElementAtOrDefault(3) 
            ?? throw new InvalidOperationException("The fourth table was not found in the document.");

        // Find the template row using LINQ and ensure it's found
        TableRow templateRow = table.Elements<TableRow>()
            .FirstOrDefault(row => row.Descendants<Text>().Any(text => text.Text.Contains("{product.name}")))
            ?? throw new InvalidOperationException("Template row with placeholder '{product.name}' not found in the table.");

        // Populate productsToInsert from the appointment's TreatmentProducts
        if (appointment.TreatmentProducts == null || !appointment.TreatmentProducts.Any())
        {
            // Optional: Handle case where there are no products.
            // For now, we'll proceed, and no new rows will be added if TreatmentProducts is empty.
            // Or, you could throw an exception or return the template with no products:
            // wordDoc.Save(); 
            // return ms.ToArray();
            // throw new InvalidOperationException("No treatment products found in the appointment.");
        }

        var productsToInsert = appointment.TreatmentProducts!
            .Select(tp => new Dictionary<string, string>
            {
                { "{product.name}", tp.Product.Name },
                { "{product.ingredient}", tp.Product.ActiveIngredient },
                { "{product.amount}", tp.ProductAmountSolvent.AmountAndSolvent },
                { "{product.equipment}", tp.EquipmentUsed ?? "" } // Use empty string if EquipmentUsed is null
            }).ToList();

        // Create and append new rows based on the template row
        foreach (var productDataEntry in productsToInsert) // Renamed 'data' to 'productDataEntry' for clarity
        {
            var newRow = (TableRow)templateRow.CloneNode(true); // Deep clone
            foreach (var cell in newRow.Elements<TableCell>())
            {
                foreach (var textElement in cell.Descendants<Text>())
                {
                    string currentText = textElement.Text;
                    foreach (var placeholderEntry in productDataEntry)
                    {
                        // String.Replace doesn't throw if Key is not found, it just returns original string.
                        currentText = currentText.Replace(placeholderEntry.Key, $"\n{placeholderEntry.Value}\n");
                    }
                    textElement.Text = currentText;
                }
            }
            table.AppendChild(newRow);
        }

        // Remove the original template row
        templateRow.Remove();

        wordDoc.Save();
        return ms.ToArray();
    }
}
