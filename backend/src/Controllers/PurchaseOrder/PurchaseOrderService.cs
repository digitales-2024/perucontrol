using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;
using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace PeruControl.Controllers;

public class PurchaseOrderService(
    DatabaseContext db,
    LibreOfficeConverterService libreOfficeConverterService,
    OdsTemplateService odsTemplateService
)
{
    public async Task<(byte[], string?)> GeneratePdf(Guid id)
    {
        var (odsBytes, errorMsg) = await GenerateExcel(id);
        if (errorMsg != null)
        {
            return ([], errorMsg);
        }

        var (pdfBytes, pdfError) = libreOfficeConverterService.convertTo(odsBytes, "ods", "pdf");
        if (pdfError != null)
        {
            return ([], pdfError);
        }
        return (pdfBytes, null);
    }

    private async Task<(byte[], string?)> GenerateExcel(Guid id)
    {
        // Get data
        var purchaseOrder = await db
            .PurchaseOrders
            .Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (purchaseOrder is null)
        {
            return ([], "Orden de compra no encontrada");
        }

        var business = await db.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return ([], "Estado del sistema invalido, no se encontro la empresa");
        }

        return GenerateSheet(purchaseOrder, business);
    }

    private static (byte[], string?) GenerateSheet(PurchaseOrder purchaseOrder, Business business)
    {
        var templateFile = "Templates/orden_de_compra_plantilla.ods";
        var supplier = purchaseOrder.Supplier;

        var purchaseOrderNumber = purchaseOrder.CreatedAt.ToString("yy") + "-" + purchaseOrder.Number.ToString("D4");
        var totalCost = purchaseOrder.Products.Sum(p => p.Quantity * p.UnitPrice);
        var currencySymbol = purchaseOrder.Currency == PurchaseOrderCurrency.PEN ? "S/." : "US$";
        var currencyLongname = purchaseOrder.Currency == PurchaseOrderCurrency.PEN ? "NUEVOS SOLES" : "DÓLARES AMERICANOS";
        var paymentMethodString = purchaseOrder.PaymentMethod == PurchaseOrderPaymentMethod.Transfer ? "Transferencia" : "Efectivo";

        // Compute subtotal, taxes, total
        decimal subtotal = 0;
        foreach (var product in purchaseOrder.Products)
        {
            subtotal += product.UnitPrice * product.Quantity;
        }

        var taxes = subtotal * 0.18m;
        var total = subtotal + taxes;

        var placeholders = new Dictionary<string, string>
        {
            // Top Der.
            { "{{direccion_perucontrol}}", business.Address },
            { "{{ruc_perucontrol}}", business.RUC },
            { "{{celulares_perucontrol}}", business.Phones },
            { "{{correo_perucontrol}}", business.Email },

            // Top Izq.
            { "{fecha_orden}", purchaseOrder.IssueDate.ToString("dd/MM/yyyy") },
            { "{expiracion_orden}", purchaseOrder.ExpirationDate.ToString("dd/MM/yyyy") },
            { "{nro_orden}", purchaseOrder.Number.ToString("D6") },

            // Supplier
            { "{nombre_proveedor}", supplier.Name },
            { "{ruc_proveedor}", supplier.RucNumber },
            { "{direccion_proveedor}", supplier.FiscalAddress },
            { "{moneda}", currencyLongname },

            // Other
            { "{subtotal}", currencySymbol + " " + subtotal.ToString("F2") },
            { "{igv}", currencySymbol + " " + taxes.ToString("F2") },
            { "{total}",currencySymbol + " " + total.ToString("F2") },
            { "{total_letras}", SpanishPriceSpellingService.SpellPricingWithTaxes(total) + " " + currencyLongname },
            { "{terms}", purchaseOrder.TermsAndConditions },
        };

        using var ms = new MemoryStream();
        using (var fs = new FileStream(templateFile, FileMode.Open, FileAccess.Read))
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
                else // entry.FullName == "content.xml"
                {
                    var contentEntry = outputArchive.CreateEntry("content.xml");
                    using var entryStream = entry.Open();
                    var xmlDoc = XDocument.Load(entryStream);

                    XNamespace tablens = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
                    XNamespace textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

                    // Replace global placeholders
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
                        // Generate product rows - look for template row with product placeholders
                        var templateRow = table
                            .Elements(tablens + "table-row")
                            .FirstOrDefault(r =>
                                r.Descendants(textns + "p")
                                    .Any(p => p.Value.Contains("{descripcion_producto}"))
                            );

                        if (templateRow != null)
                        {
                            XElement lastInserted = templateRow;
                            var i = 1;
                            foreach (var product in purchaseOrder.Products)
                            {
                                var newRow = new XElement(templateRow);
                                var unitPrice = product.UnitPrice.ToString("0.00");
                                var totalPrice = (product.Quantity * product.UnitPrice).ToString("0.00");

                                foreach (var cell in newRow.Descendants(textns + "p"))
                                {
                                    cell.Value = cell
                                        .Value
                                        .Replace("{nro_item_producto}", i.ToString())
                                        .Replace("{descripcion_producto}", product.Name + "\n" + product.Description)
                                        .Replace("{cantidad_producto}", product.Quantity.ToString())
                                        .Replace("{precio_unit_producto}", product.UnitPrice.ToString())
                                        .Replace("{total_producto}", $"{currencySymbol} {totalPrice}");
                                }

                                lastInserted.AddAfterSelf(newRow);
                                lastInserted = newRow;

                                i += 1;
                            }
                            templateRow.Remove();
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
}
