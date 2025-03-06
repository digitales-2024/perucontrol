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
}
