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
        Table? table = body.Elements<Table>().ToList()[3] ?? throw new InvalidOperationException("No table found in the document.");

        // Find the template row - assuming it's a row that contains "{product.name}"
        // This is a simplistic way to find it. A more robust way might involve a specific bookmark or style.
        TableRow? templateRow = null;
        foreach (var row in table.Elements<TableRow>())
        {
            bool foundPlaceholder = false;
            foreach (var cell in row.Elements<TableCell>())
            {
                foreach (var textElement in cell.Descendants<Text>())
                {
                    if (textElement.Text.Contains("{product.name}"))
                    {
                        foundPlaceholder = true;
                        break;
                    }
                }
                if (foundPlaceholder) break;
            }
            if (foundPlaceholder)
            {
                templateRow = row;
                break;
            }
        }

        if (templateRow == null)
        {
            // If you want to return the original template if no template row is found:
            // wordDoc.Save();
            // return ms.ToArray();
            throw new InvalidOperationException("Template row with placeholder '{product.name}' not found in the table.");
        }

        // Dummy data for 2 rows, as requested
        var productData = new List<Dictionary<string, string>>
        {
            new() {
                { "{product.name}", "Awesome Product 1" },
                { "{product.ingredient}", "Magic Ingredient A" },
                { "{product.amount}", "100g" },
                { "{product.equipment}", "Standard Sprayer" }
            },
            new() {
                { "{product.name}", "Super Product 2" },
                { "{product.ingredient}", "Secret Sauce B" },
                { "{product.amount}", "20ml" },
                { "{product.equipment}", "Ultra Fogger" }
            }
        };

        // Create and append new rows based on the template row
        foreach (var data in productData)
        {
            var newRow = (TableRow)templateRow.CloneNode(true); // Deep clone
            foreach (var cell in newRow.Elements<TableCell>())
            {
                foreach (var textElement in cell.Descendants<Text>())
                {
                    // It's important to iterate through placeholders for each text element
                    // as a single text element might, in rare cases, be split by Word but still contain parts of a placeholder,
                    // or a text element might contain multiple placeholders (though less common for simple templates).
                    // For simplicity, we'll assume a full placeholder is within a single Text element for now.
                    string originalText = textElement.Text;
                    string modifiedText = originalText;
                    foreach (var placeholderEntry in data)
                    {
                        if (modifiedText.Contains(placeholderEntry.Key))
                        {
                            modifiedText = modifiedText.Replace(placeholderEntry.Key, placeholderEntry.Value);
                        }
                    }
                    if (originalText != modifiedText) {
                        textElement.Text = modifiedText;
                    }
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
