using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

public class QuotationService(
    DatabaseContext context,
    OdsTemplateService odsTemplateService,
    LibreOfficeConverterService libreOfficeConverterService
)
{
    /// <summary>
    /// Generates a quotation PDF file, from a ODS template.
    /// It generates the ODS quotation, scales it to 105% to fix layout issues, and converts it to PDF.
    /// </summary>
    /// <param name="quotationId">The quotation ID.</param>
    /// <returns>The PDF file bytes and an error message if any.</returns>
    public async Task<(byte[]? fileBytes, string? error)> GeneratePdfAsync(Guid quotationId)
    {
        var quotation = await context
            .Quotations.Include(q => q.QuotationServices)
            .Include(q => q.Client)
            .Include(q => q.Services)
            .FirstOrDefaultAsync(q => q.Id == quotationId);

        if (quotation == null)
        {
            return (
                null,
                $"Cotización no encontrada ({quotationId}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var business = await context.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return (null, "Estado del sistema invalido, no se encontro la empresa");
        }

        var (odsBytes, odsError) = odsTemplateService.GenerateQuotation(
            quotation,
            business,
            "Templates/cotizacion_plantilla.ods"
        );
        if (!string.IsNullOrEmpty(odsError))
        {
            return (null, odsError);
        }

        // Scale the ODS before converting to PDF to fix layout issues
        var scaledFileBytes = odsTemplateService.ScaleOds(odsBytes, 100);

        var (pdfBytes, pdfError) = libreOfficeConverterService.ConvertToPdf(scaledFileBytes, "ods");
        if (!string.IsNullOrEmpty(pdfError))
        {
            return (null, pdfError);
        }

        if (pdfBytes == null)
        {
            return (null, "Error generando PDF");
        }

        return (pdfBytes, null);
    }

    /// <summary>
    /// Generates a quotation ODS file, from a ODS template.
    /// The generated file is meant to be used with Microsoft Excel. It will not work with LibreOffice.
    /// </summary>
    /// <param name="quotationId">The quotation ID.</param>
    /// <returns>The ODS file bytes and an error message if any.</returns>
    public async Task<(byte[]? fileBytes, string? error)> GenerateExcelAsync(Guid quotationId)
    {
        var quotation = await context
            .Quotations.Include(q => q.QuotationServices)
            .Include(q => q.Client)
            .Include(q => q.Services)
            .FirstOrDefaultAsync(q => q.Id == quotationId);

        if (quotation == null)
        {
            return (
                null,
                $"Cotización no encontrada ({quotationId}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var business = await context.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return (null, "Estado del sistema invalido, no se encontro la empresa");
        }

        var (odsBytes, error) = odsTemplateService.GenerateQuotation(
            quotation,
            business,
            "Templates/cotizacion_plantilla.ods"
        );
        if (!string.IsNullOrEmpty(error))
        {
            return (null, error);
        }

        return (odsBytes, null);
    }

    public async Task<(byte[]? fileBytes, string? error)> GenerateReceiptPdfAsync(Guid quotationId)
    {
        var quotation = await context
            .Quotations.Include(q => q.QuotationServices)
            .Include(q => q.Client)
            .Include(q => q.Services)
            .FirstOrDefaultAsync(q => q.Id == quotationId);

        if (quotation == null)
        {
            return (
                null,
                $"Cotización no encontrada ({quotationId}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var business = await context.Businesses.FirstOrDefaultAsync();
        if (business == null)
        {
            return (null, "Estado del sistema invalido, no se encontro la empresa");
        }

        var (odsBytes, odsError) = odsTemplateService.GenerateReceipt(
            quotation,
            business,
            "Templates/recibo_plantilla.ods"
        );
        if (!string.IsNullOrEmpty(odsError))
        {
            return (null, odsError);
        }

        // Scale the ODS before converting to PDF to fix layout issues
        var scaledFileBytes = odsTemplateService.ScaleOds(odsBytes, 100);

        var (pdfBytes, pdfError) = libreOfficeConverterService.ConvertToPdf(scaledFileBytes, "ods");
        if (!string.IsNullOrEmpty(pdfError))
        {
            return (null, pdfError);
        }

        if (pdfBytes == null)
        {
            return (null, "Error generando PDF");
        }

        return (pdfBytes, null);
    }
}
