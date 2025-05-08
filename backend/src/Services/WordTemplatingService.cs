using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using PeruControl.Model.Reports;
using System;
using System.Collections.Generic;
using System.Xml.Linq;
using DocumentFormat.OpenXml;

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

        // Create a placeholder-based content insertion example
        var mockTextArea = new TextArea
        {
            Content = "This is content generated from a ContentSection.\nIt maintains the style of the placeholder it replaces.\nYou can have multiple lines and they will render properly."
        };
        
        var mockSubTextArea = new TextArea
        {
            Content = "This is nested content in a subsection.\nWith another line of text."
        };
        
        var mockSubSection = new TextBlock
        {
            Title = "Dynamic Subsection",
            Numbering = "1.1.1",
            Level = 3,
            Sections = [mockSubTextArea]
        };
        
        var mockSection = new TextBlock
        {
            Title = "Dynamic Content Section",
            Numbering = "1.1",
            Level = 2,
            Sections = [mockTextArea, mockSubSection]
        };

        // Try to replace a placeholder called "{dynamic_content}" with rich content
        // Make sure your template has this placeholder somewhere
        try 
        {
            ReplacePlaceholderWithContent(wordDoc, "{section_5}", [mockSection]);
        }
        catch (InvalidOperationException ex)
        {
            // Handle the case where the placeholder isn't found
            Console.WriteLine($"Warning: {ex.Message}");
            
            // Optionally, you could append the content at the end of the document if the placeholder isn't found
            // AppendContentSections(wordDoc, [mockSection]);
        }

        wordDoc.Save();
        return ms.ToArray();
    }

    public static void AppendContentSections(WordprocessingDocument wordDoc, IEnumerable<ContentSection> sections)
    {
        ArgumentNullException.ThrowIfNull(wordDoc);
        ArgumentNullException.ThrowIfNull(sections);

        MainDocumentPart mainPart = wordDoc.MainDocumentPart ?? wordDoc.AddMainDocumentPart();
        mainPart.Document ??= new Document();
        mainPart.Document.Body ??= new Body();
        Body body = mainPart.Document.Body;

        foreach (var section in sections)
        {
            List<OpenXmlElement> elements = GenerateElementsForSection(section);
            foreach (var element in elements)
            {
                body.Append(element.CloneNode(true)); // Clone if elements might be reused elsewhere, good practice.
            }
        }
    }

    private static List<OpenXmlElement> GenerateElementsForSection(ContentSection section)
    {
        var elements = new List<OpenXmlElement>();
        if (section is TextBlock textBlock)
        {
            Paragraph titleParagraph = new();
            ParagraphProperties pp = new();

            if (textBlock.Level >= 0)
            {
                pp.ParagraphStyleId = new ParagraphStyleId() { Val = "Heading" + (textBlock.Level + 1) };
            }
            titleParagraph.Append(pp);

            string fullTitle = (!string.IsNullOrEmpty(textBlock.Numbering) ? textBlock.Numbering + " " : "") + textBlock.Title;
            Run titleRun = new(new Text(fullTitle));
            titleParagraph.Append(titleRun);
            elements.Add(titleParagraph);

            if (textBlock.Sections != null)
            {
                foreach (var subSection in textBlock.Sections)
                {
                    elements.AddRange(GenerateElementsForSection(subSection));
                }
            }
        }
        else if (section is TextArea textArea)
        {
            Paragraph contentParagraph = new();
            if (!string.IsNullOrEmpty(textArea.Content))
            {
                string[] lines = textArea.Content.Split('\n');
                if (lines.Length != 0)
                {
                    Run firstRun = new(new Text(lines[0]));
                    contentParagraph.Append(firstRun);

                    for (int i = 1; i < lines.Length; i++)
                    {
                        contentParagraph.Append(new Run(new Break()));
                        Run subsequentRun = new(new Text(lines[i]));
                        contentParagraph.Append(subsequentRun);
                    }
                }
            }
            elements.Add(contentParagraph);
        }
        return elements;
    }

    public static void InsertContentAfterNthHeading(
        WordprocessingDocument wordDoc,
        int headingNumber, // 1-indexed
        IEnumerable<ContentSection> sectionsToInsert)
    {
        ArgumentNullException.ThrowIfNull(wordDoc);
        ArgumentNullException.ThrowIfNull(sectionsToInsert);
        if (headingNumber <= 0) throw new ArgumentOutOfRangeException(nameof(headingNumber), "Heading number must be positive.");

        MainDocumentPart mainPart = wordDoc.MainDocumentPart ?? wordDoc.AddMainDocumentPart();
        mainPart.Document ??= new Document();
        mainPart.Document.Body ??= new Body();
        Body body = mainPart.Document.Body;

        Paragraph targetHeading = null;
        int currentHeadingCount = 0;
        foreach (Paragraph p in body.Elements<Paragraph>()) // Iterate through all paragraphs in the body
        {
            if (p.ParagraphProperties?.ParagraphStyleId != null &&
                p.ParagraphProperties.ParagraphStyleId.Val.Value.StartsWith("Heading", StringComparison.OrdinalIgnoreCase))
            {
                currentHeadingCount++;
                if (currentHeadingCount == headingNumber)
                {
                    targetHeading = p;
                    break;
                }
            }
        }

        if (targetHeading == null)
        {
            throw new InvalidOperationException($"The {headingNumber}th heading was not found in the document.");
        }

        OpenXmlElement currentElementToInsertAfter = targetHeading;
        foreach (var section in sectionsToInsert)
        {
            List<OpenXmlElement> newElements = GenerateElementsForSection(section);
            foreach (var newElement in newElements)
            {
                // Clone the node before inserting if it's from a shared list or might be reused.
                // GenerateElementsForSection creates new elements, so cloning here might be overly cautious but safe.
                OpenXmlElement elementToInsert = newElement.CloneNode(true);
                currentElementToInsertAfter.InsertAfterSelf(elementToInsert);
                currentElementToInsertAfter = elementToInsert;
            }
        }
    }

    /// <summary>
    /// Replaces a placeholder in the document with content sections, preserving the original style.
    /// </summary>
    /// <param name="wordDoc">The Word document to modify</param>
    /// <param name="placeholder">The placeholder text to search for and replace</param>
    /// <param name="sections">The content sections to insert in place of the placeholder</param>
    public static void ReplacePlaceholderWithContent(
        WordprocessingDocument wordDoc,
        string placeholder,
        ContentSection[] sections)
    {
        ArgumentNullException.ThrowIfNull(wordDoc);
        ArgumentNullException.ThrowIfNull(sections);
        if (string.IsNullOrWhiteSpace(placeholder))
            throw new ArgumentException("Placeholder cannot be empty", nameof(placeholder));

        MainDocumentPart mainPart = wordDoc.MainDocumentPart ?? throw new InvalidOperationException("Document has no main part");
        Document doc = mainPart.Document ?? throw new InvalidOperationException("Main part has no document");
        Body body = doc.Body ?? throw new InvalidOperationException("Document has no body");

        // Find all paragraphs containing the placeholder
        var paragraphsWithPlaceholder = body
            .Descendants<Paragraph>()
            .Where(p => p.InnerText.Contains(placeholder))
            .ToList();

        if (!paragraphsWithPlaceholder.Any())
        {
            // Placeholder not found, throw or log
            throw new InvalidOperationException($"Placeholder '{placeholder}' not found in document");
        }

        foreach (var paragraph in paragraphsWithPlaceholder)
        {
            // Get the run containing the placeholder text
            var runsWithPlaceholder = paragraph
                .Descendants<Run>()
                .Where(r => r.InnerText.Contains(placeholder))
                .ToList();

            if (!runsWithPlaceholder.Any())
                continue;

            // Get the first run with the placeholder (usually should be only one)
            var placeholderRun = runsWithPlaceholder.First();
            
            // Save the run properties (styling) to apply to new content
            RunProperties originalRunProps = placeholderRun.RunProperties?.CloneNode(true) as RunProperties;
            ParagraphProperties originalParaProps = paragraph.ParagraphProperties?.CloneNode(true) as ParagraphProperties;

            // Generate the new content with the same style
            var newParagraphs = new List<Paragraph>();
            
            foreach (var section in sections)
            {
                List<OpenXmlElement> elements = GenerateElementsForSectionWithStyle(section, originalRunProps, originalParaProps);
                foreach (var element in elements)
                {
                    if (element is Paragraph para)
                    {
                        newParagraphs.Add(para);
                    }
                }
            }

            // Insert the new paragraphs after the placeholder paragraph
            // We need to reverse the order because InsertAfterSelf puts each new item at the same position,
            // which would reverse the order if we insert them sequentially
            for (int i = newParagraphs.Count - 1; i >= 0; i--)
            {
                paragraph.InsertAfterSelf(newParagraphs[i]);
            }

            // Remove the original paragraph with the placeholder
            paragraph.Remove();
        }
    }

    /// <summary>
    /// Generates OpenXML elements for a content section, applying the given styles.
    /// </summary>
    private static List<OpenXmlElement> GenerateElementsForSectionWithStyle(
        ContentSection section,
        RunProperties styleRunProps,
        ParagraphProperties styleParaProps)
    {
        var elements = new List<OpenXmlElement>();
        
        if (section is TextBlock textBlock)
        {
            Paragraph titleParagraph = new();
            
            // Apply paragraph style but preserve heading level if any
            if (styleParaProps != null)
            {
                ParagraphProperties newProps = styleParaProps.CloneNode(true) as ParagraphProperties;
                // If the TextBlock has a level, we need to set the appropriate heading style
                if (textBlock.Level >= 0)
                {
                    newProps.ParagraphStyleId = new ParagraphStyleId { Val = $"Heading{textBlock.Level + 1}" };
                }
                
                // Make sure we're properly preserving indentation settings
                // The indentation is preserved because we've cloned the entire ParagraphProperties
                
                titleParagraph.ParagraphProperties = newProps;
            }
            else if (textBlock.Level >= 0)
            {
                // No styling from original paragraph, but still need to set heading style
                ParagraphProperties newProps = new();
                newProps.ParagraphStyleId = new ParagraphStyleId { Val = $"Heading{textBlock.Level + 1}" };
                
                // If there's no original styling, we might still want to set a reasonable indentation
                // Uncomment if needed:
                // newProps.Indentation = new Indentation() { Left = "720" }; // 720 twips = 0.5 inch
                
                titleParagraph.ParagraphProperties = newProps;
            }

            // Create the title run with formatting
            string fullTitle = (!string.IsNullOrEmpty(textBlock.Numbering) ? textBlock.Numbering + " " : "") + textBlock.Title;
            Run titleRun = new Run(new Text(fullTitle));
            
            // Apply the run style to maintain formatting
            if (styleRunProps != null)
            {
                titleRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
            }
            else
            {
                titleRun.RunProperties = new RunProperties();
            }
            
            // Make sure the title is bold
            titleRun.RunProperties.Bold = new Bold();
            
            titleParagraph.Append(titleRun);
            elements.Add(titleParagraph);

            // Process any subsections
            if (textBlock.Sections != null)
            {
                foreach (var subSection in textBlock.Sections)
                {
                    // When processing subsections, preserve the indentation by passing along the same parent paragraph properties
                    elements.AddRange(GenerateElementsForSectionWithStyle(subSection, styleRunProps, styleParaProps));
                }
            }
        }
        else if (section is TextArea textArea)
        {
            Paragraph contentParagraph = new();
            
            // Apply paragraph style
            if (styleParaProps != null)
            {
                ParagraphProperties newProps = styleParaProps.CloneNode(true) as ParagraphProperties;
                
                // Ensure indentation settings are preserved from the original paragraph
                // This should already be handled by the full clone, but let's make sure
                if (styleParaProps.Indentation != null)
                {
                    // If the clone didn't work properly for some reason, explicitly copy the indentation
                    newProps.Indentation = styleParaProps.Indentation.CloneNode(true) as Indentation;
                }
                
                contentParagraph.ParagraphProperties = newProps;
            }

            if (!string.IsNullOrEmpty(textArea.Content))
            {
                string[] lines = textArea.Content.Split('\n');
                if (lines.Length > 0)
                {
                    // First line
                    Run firstRun = new Run(new Text(lines[0]));
                    if (styleRunProps != null)
                    {
                        firstRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
                    }
                    contentParagraph.Append(firstRun);

                    // Additional lines
                    for (int i = 1; i < lines.Length; i++)
                    {
                        Run lineBreakRun = new Run(new Break());
                        if (styleRunProps != null)
                        {
                            lineBreakRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
                        }
                        contentParagraph.Append(lineBreakRun);

                        Run textRun = new Run(new Text(lines[i]));
                        if (styleRunProps != null)
                        {
                            textRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
                        }
                        contentParagraph.Append(textRun);
                    }
                }
            }
            elements.Add(contentParagraph);
        }
        
        return elements;
    }
}
