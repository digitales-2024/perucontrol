using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using PeruControl.Model.Reports;

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
                                newRunForLine.RunProperties = (RunProperties)
                                    parentRun.RunProperties.CloneNode(true);
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

    public byte[] GenerateReportComplete(
        Model.ProjectAppointment appointment,
        string templatePath = "Templates/nuevos_informes/informe_01.docx"
    )
    {
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

        // Replace placeholders on main document
        var placeholders = new Dictionary<string, string>
        {
            {
                "{sign_date}",
                appointment.CompleteReport.SigningDate?.ToString(
                    "dd 'de' MMMM 'de' yyyy",
                    new System.Globalization.CultureInfo("es-PE")
                ) ?? ""
            },
            {
                "{client_name}",
                appointment.Project.Client.RazonSocial ?? appointment.Project.Client.Name
            },
            { "{client_address}", appointment.Project.Address },
            { "{client_supervisor}", appointment.CompanyRepresentative ?? "" },
            { "{service_date}", appointment.DueDate.ToString("dd/MM/yyyy") },
        };
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

        var dataForTable1 = new List<Dictionary<string, string>>();
        if (appointment.TreatmentProducts != null && appointment.TreatmentProducts.Any())
        {
            dataForTable1 =
            [
                .. appointment.TreatmentProducts
                // No explicit order mentioned for table 1, process as is or add .OrderBy if needed.
                .Select(tp => new Dictionary<string, string>
                {
                    { "{service_date_table}", appointment.DueDate.ToString("dd/MM/yyyy") },
                    { "{service_hour}", tp.AppliedTime ?? "-" },
                    {
                        "{treatment_type}",
                        $"{tp.AppliedService ?? "-"}\n{tp.AppliedTechnique ?? "-"}"
                    },
                    { "{used_products}", $"{tp.Product.Name}\n{tp.Product.ActiveIngredient}" },
                    { "{performed_by}", "Sr. William Moreyra Auris" },
                    { "{supervisor}", appointment.CompanyRepresentative ?? "-" },
                }),
            ];
        }

        var dataForTable2 = new List<Dictionary<string, string>>();
        if (appointment.TreatmentAreas != null && appointment.TreatmentAreas.Any())
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

        // Process Tables in Order
        ProcessTable(body, 0, "{service_hour}", dataForTable1);
        ProcessTable(body, 1, "{area}", dataForTable2);
        ProcessTable(body, 2, "{treated_area}", dataForTable3);
        ProcessTable(body, 3, "{product.name}", productsToInsert);

        // Try to replace a placeholder called "{section_5}" with rich content
        // Make sure your template has this placeholder somewhere
        ReplacePlaceholderWithContent(
            wordDoc,
            "{section_5}",
            [.. appointment.CompleteReport.Content]
        );

        wordDoc.Save();
        return ms.ToArray();
    }

    public static void AppendContentSections(
        WordprocessingDocument wordDoc,
        IEnumerable<ContentSection> sections
    )
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
                pp.ParagraphStyleId = new ParagraphStyleId()
                {
                    Val = "Heading" + (textBlock.Level + 1),
                };
            }
            titleParagraph.Append(pp);

            string fullTitle =
                (!string.IsNullOrEmpty(textBlock.Numbering) ? textBlock.Numbering + " " : "")
                + textBlock.Title;
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
        IEnumerable<ContentSection> sectionsToInsert
    )
    {
        ArgumentNullException.ThrowIfNull(wordDoc);
        ArgumentNullException.ThrowIfNull(sectionsToInsert);
        if (headingNumber <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(headingNumber),
                "Heading number must be positive."
            );

        MainDocumentPart mainPart = wordDoc.MainDocumentPart ?? wordDoc.AddMainDocumentPart();
        mainPart.Document ??= new Document();
        mainPart.Document.Body ??= new Body();
        Body body = mainPart.Document.Body;

        Paragraph? targetHeading = null;
        int currentHeadingCount = 0;
        foreach (Paragraph p in body.Elements<Paragraph>()) // Iterate through all paragraphs in the body
        {
            if (
                p.ParagraphProperties?.ParagraphStyleId != null
                && p.ParagraphProperties.ParagraphStyleId.Val!.Value!.StartsWith(
                    "Heading",
                    StringComparison.OrdinalIgnoreCase
                )
            )
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
            throw new InvalidOperationException(
                $"The {headingNumber}th heading was not found in the document."
            );
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
        ContentSection[] sections
    )
    {
        ArgumentNullException.ThrowIfNull(wordDoc);
        ArgumentNullException.ThrowIfNull(sections);
        if (string.IsNullOrWhiteSpace(placeholder))
            throw new ArgumentException("Placeholder cannot be empty", nameof(placeholder));

        // Ensure bullet list definitions exist in the document
        EnsureBulletListDefinitionExists(wordDoc);

        MainDocumentPart mainPart =
            wordDoc.MainDocumentPart
            ?? throw new InvalidOperationException("Document has no main part");
        Document doc =
            mainPart.Document ?? throw new InvalidOperationException("Main part has no document");
        Body body = doc.Body ?? throw new InvalidOperationException("Document has no body");

        // Find all paragraphs containing the placeholder
        var paragraphsWithPlaceholder = body.Descendants<Paragraph>()
            .Where(p => p.InnerText.Contains(placeholder))
            .ToList();

        if (!paragraphsWithPlaceholder.Any())
        {
            // Placeholder not found, throw or log
            throw new InvalidOperationException(
                $"Placeholder '{placeholder}' not found in document"
            );
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
            RunProperties? originalRunProps =
                placeholderRun.RunProperties?.CloneNode(true) as RunProperties;
            ParagraphProperties? originalParaProps =
                paragraph.ParagraphProperties?.CloneNode(true) as ParagraphProperties;

            // Generate the new content with the same style
            var newParagraphs = new List<Paragraph>();

            foreach (var section in sections)
            {
                List<OpenXmlElement> elements = GenerateElementsForSectionWithStyle(
                    section,
                    originalRunProps,
                    originalParaProps
                );
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
        RunProperties? styleRunProps,
        ParagraphProperties? styleParaProps
    )
    {
        var elements = new List<OpenXmlElement>();

        if (section is TextBlock textBlock)
        {
            Paragraph plainTextParagraph = new();

            // Apply paragraph style from the original placeholder, if any.
            // No longer setting Heading styles based on textBlock.Level.
            if (styleParaProps != null)
            {
                plainTextParagraph.ParagraphProperties =
                    styleParaProps.CloneNode(true) as ParagraphProperties;
            }
            // If styleParaProps is null, the paragraph gets default properties.
            // textBlock.Level is now ignored for styling purposes here.

            // Combine Numbering (if any) and Title for the text content.
            string combinedText =
                (!string.IsNullOrEmpty(textBlock.Numbering) ? textBlock.Numbering + ".- " : "")
                + textBlock.Title;
            Run textRun = new Run(new Text(combinedText));

            // Apply run style from the original placeholder, if any.
            if (styleRunProps != null)
            {
                textRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
            }
            // No more forced bolding. If the placeholder's style was bold, it will be inherited.

            // Ensure RunProperties exist before setting Bold
            if (textRun.RunProperties == null)
            {
                textRun.RunProperties = new RunProperties();
            }
            textRun.RunProperties.Bold = new Bold(); // Make the combined text bold

            plainTextParagraph.Append(textRun);
            elements.Add(plainTextParagraph);

            // Process any subsections, passing along the original inherited styles.
            if (textBlock.Sections != null)
            {
                foreach (var subSection in textBlock.Sections)
                {
                    // Subsections will also be rendered as plain text paragraphs,
                    // inheriting the same placeholder styles.
                    elements.AddRange(
                        GenerateElementsForSectionWithStyle(
                            subSection,
                            styleRunProps,
                            styleParaProps
                        )
                    );
                }
            }
        }
        else if (section is TextArea textArea)
        {
            if (!string.IsNullOrEmpty(textArea.Content))
            {
                // Check if this looks like a bullet list (lines starting with "- ")
                bool isBulletList = false;
                string[] lines = textArea.Content.Split('\n');
                if (lines.Length > 0)
                {
                    isBulletList = lines.All(line => line.Trim().StartsWith("- "));
                }

                if (isBulletList)
                {
                    // Process as bullet list
                    foreach (var line in lines)
                    {
                        string bulletText = line.Trim().Substring(2); // Remove the "- " prefix
                        elements.Add(
                            CreateBulletListItem(bulletText, styleRunProps, styleParaProps)
                        );
                    }
                }
                else
                {
                    // Regular paragraph processing as before
                    Paragraph contentParagraph = new();

                    // Apply paragraph style
                    if (styleParaProps != null)
                    {
                        ParagraphProperties? newProps =
                            styleParaProps.CloneNode(true) as ParagraphProperties;

                        // Ensure indentation settings are preserved from the original paragraph
                        if (styleParaProps.Indentation != null && newProps != null)
                        {
                            newProps.Indentation =
                                styleParaProps.Indentation.CloneNode(true) as Indentation;
                        }

                        contentParagraph.ParagraphProperties = newProps;
                    }

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
                                lineBreakRun.RunProperties =
                                    styleRunProps.CloneNode(true) as RunProperties;
                            }
                            contentParagraph.Append(lineBreakRun);

                            Run textRun = new Run(new Text(lines[i]));
                            if (styleRunProps != null)
                            {
                                textRun.RunProperties =
                                    styleRunProps.CloneNode(true) as RunProperties;
                            }
                            contentParagraph.Append(textRun);
                        }
                    }
                    elements.Add(contentParagraph);
                }
            }
        }

        return elements;
    }

    /// <summary>
    /// Creates a bullet list item paragraph with the specified text and styling
    /// </summary>
    private static Paragraph CreateBulletListItem(
        string text,
        RunProperties? styleRunProps,
        ParagraphProperties? styleParaProps
    )
    {
        Paragraph listItemPara = new Paragraph();

        // Create brand new paragraph properties for the bullet list item
        ParagraphProperties paraProps = new ParagraphProperties();

        // Copy some basic formatting from original paragraph if available
        if (styleParaProps != null)
        {
            // Copy spacing, alignment, and other paragraph properties if they exist
            if (styleParaProps.SpacingBetweenLines != null)
                paraProps.SpacingBetweenLines =
                    styleParaProps.SpacingBetweenLines.CloneNode(true) as SpacingBetweenLines;

            if (styleParaProps.Justification != null)
                paraProps.Justification =
                    styleParaProps.Justification.CloneNode(true) as Justification;

            if (styleParaProps.ContextualSpacing != null)
                paraProps.ContextualSpacing =
                    styleParaProps.ContextualSpacing.CloneNode(true) as ContextualSpacing;
        }

        // Set bullet-specific properties
        // Indentation for bullets
        paraProps.Indentation = new Indentation { Left = "720", Hanging = "360" };

        // Set numbering properties to use our bullet list definition with ID 10
        paraProps.NumberingProperties = new NumberingProperties
        {
            NumberingId = new NumberingId { Val = 10 },
            NumberingLevelReference = new NumberingLevelReference { Val = 0 },
        };

        listItemPara.ParagraphProperties = paraProps;

        // Add the text content (without the bullet character, as it's provided by the numbering definition)
        Run textRun = new Run(new Text(text));
        if (styleRunProps != null)
        {
            textRun.RunProperties = styleRunProps.CloneNode(true) as RunProperties;
        }
        listItemPara.Append(textRun);

        return listItemPara;
    }

    /// <summary>
    /// Ensures that the document has the necessary numbering definitions for bullet lists
    /// </summary>
    private static void EnsureBulletListDefinitionExists(WordprocessingDocument wordDoc)
    {
        MainDocumentPart mainPart =
            wordDoc.MainDocumentPart
            ?? throw new InvalidOperationException("Document has no main part");

        // Check if the NumberingDefinitionsPart already exists
        NumberingDefinitionsPart? numberingPart = mainPart.NumberingDefinitionsPart;
        if (numberingPart == null)
        {
            // Create a new NumberingDefinitionsPart if it doesn't exist
            numberingPart = mainPart.AddNewPart<NumberingDefinitionsPart>();

            // Create a more complete bullet list definition with a unique ID
            // We'll use ID 10 instead of 1 to avoid conflicts with any existing numbering
            Numbering numbering = new Numbering();

            // Create AbstractNum with a complete bullet definition
            AbstractNum abstractNum = new AbstractNum() { AbstractNumberId = 10 };

            // Create comprehensive Level 0 definition for bullets
            Level level = new Level() { LevelIndex = 0 };
            // Explicitly set to bullet format
            level.Append(new NumberingFormat() { Val = NumberFormatValues.Bullet });
            // Use a solid bullet character
            level.Append(new LevelText() { Val = "•" });
            // Must use Symbol font to render bullets correctly
            level.Append(
                new RunProperties(
                    new RunFonts()
                    {
                        Ascii = "Symbol",
                        HighAnsi = "Symbol",
                        Hint = FontTypeHintValues.Default,
                    }
                )
            );
            // Indentation settings
            level.Append(
                new ParagraphProperties(new Indentation() { Left = "720", Hanging = "360" })
            );
            // Set numbering value (not really used for bullets, but required)
            level.Append(new StartNumberingValue() { Val = 1 });
            level.Append(new LevelJustification() { Val = LevelJustificationValues.Left });

            abstractNum.Append(level);

            // Add a second level for nested bullets if needed
            Level level2 = new Level() { LevelIndex = 1 };
            // Explicitly set to bullet format
            level2.Append(new NumberingFormat() { Val = NumberFormatValues.Bullet });
            level2.Append(new LevelText() { Val = "○" }); // Open circle
            level2.Append(
                new RunProperties(
                    new RunFonts()
                    {
                        Ascii = "Symbol",
                        HighAnsi = "Symbol",
                        Hint = FontTypeHintValues.Default,
                    }
                )
            );
            level2.Append(
                new ParagraphProperties(new Indentation() { Left = "1440", Hanging = "360" })
            );
            level2.Append(new StartNumberingValue() { Val = 1 });
            level2.Append(new LevelJustification() { Val = LevelJustificationValues.Left });

            abstractNum.Append(level2);

            // Add multiLevelType to ensure it's treated as a bullet list
            abstractNum.MultiLevelType = new MultiLevelType()
            {
                Val = MultiLevelValues.HybridMultilevel,
            };

            numbering.Append(abstractNum);

            // Create NumberingInstance that references the AbstractNum
            NumberingInstance numberingInstance = new NumberingInstance() { NumberID = 10 };
            numberingInstance.AbstractNumId = new AbstractNumId() { Val = 10 };

            numbering.Append(numberingInstance);

            numberingPart.Numbering = numbering;
        }
        else
        {
            // Get the existing numbering definitions
            Numbering numbering = numberingPart.Numbering;
            if (numbering == null)
            {
                numbering = new Numbering();
                numberingPart.Numbering = numbering;
            }

            // Look for existing bullet list definition with ID 10
            var existingInstance = numbering
                .Elements<NumberingInstance>()
                .FirstOrDefault(ni => ni.NumberID?.Value == 10);

            if (existingInstance == null)
            {
                // No existing bullet list definition, create a new one

                // First check if we already have an AbstractNum with ID 10
                var existingAbstractNum = numbering
                    .Elements<AbstractNum>()
                    .FirstOrDefault(an => an.AbstractNumberId?.Value == 10);

                if (existingAbstractNum == null)
                {
                    // Create a new AbstractNum for bullets with ID 10
                    AbstractNum abstractNum = new AbstractNum() { AbstractNumberId = 10 };

                    // Add multiLevelType to ensure it's treated as a bullet list
                    abstractNum.MultiLevelType = new MultiLevelType()
                    {
                        Val = MultiLevelValues.HybridMultilevel,
                    };

                    // Level 0 (first level bullets) - create using properties directly
                    Level level = new Level() { LevelIndex = 0 };
                    level.Append(new NumberingFormat() { Val = NumberFormatValues.Bullet });
                    level.Append(new LevelText() { Val = "•" });
                    level.Append(
                        new RunProperties(
                            new RunFonts()
                            {
                                Ascii = "Symbol",
                                HighAnsi = "Symbol",
                                Hint = FontTypeHintValues.Default,
                            }
                        )
                    );
                    level.Append(
                        new ParagraphProperties(new Indentation() { Left = "720", Hanging = "360" })
                    );
                    level.Append(new StartNumberingValue() { Val = 1 });
                    level.Append(new LevelJustification() { Val = LevelJustificationValues.Left });

                    abstractNum.Append(level);

                    // Level 1 (second level bullets) - create using properties directly
                    Level level2 = new Level() { LevelIndex = 1 };
                    level2.Append(new NumberingFormat() { Val = NumberFormatValues.Bullet });
                    level2.Append(new LevelText() { Val = "○" });
                    level2.Append(
                        new RunProperties(
                            new RunFonts()
                            {
                                Ascii = "Symbol",
                                HighAnsi = "Symbol",
                                Hint = FontTypeHintValues.Default,
                            }
                        )
                    );
                    level2.Append(
                        new ParagraphProperties(
                            new Indentation() { Left = "1440", Hanging = "360" }
                        )
                    );
                    level2.Append(new StartNumberingValue() { Val = 1 });
                    level2.Append(new LevelJustification() { Val = LevelJustificationValues.Left });

                    abstractNum.Append(level2);

                    numbering.Append(abstractNum);
                }

                // Create a new NumberingInstance that references AbstractNum 10
                NumberingInstance numberingInstance = new NumberingInstance() { NumberID = 10 };
                numberingInstance.AbstractNumId = new AbstractNumId() { Val = 10 };

                numbering.Append(numberingInstance);
            }
        }
    }
}
