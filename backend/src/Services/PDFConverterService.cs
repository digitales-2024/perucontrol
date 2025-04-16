namespace PeruControl.Services;

public class LibreOfficeConverterService
{
    // writes to a temp file, invokes soffice on it, returns the
    // converted bytes, and cleans up
    public (byte[]?, string) convertToPdf(byte[] inputBytes, string extension)
    {
        var unixms = DateTimeOffset.Now.ToUnixTimeMilliseconds();
        var tempDir = Path.Combine(Path.GetTempPath(), "gen_files");
        Directory.CreateDirectory(tempDir);

        var tempFilePath = Path.Combine(tempDir, $"file_{unixms}.{extension}");
        var pdfFilePath = Path.Combine(tempDir, $"file_{unixms}.pdf");
        try
        {
            System.IO.File.WriteAllBytes(tempFilePath, inputBytes);

            // Call LibreOffice to convert to PDF
            var process = new System.Diagnostics.Process
            {
                StartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "soffice",
                    Arguments =
                        $"--headless --convert-to \"pdf:calc_pdf_Export:PageSize=1:ColumnScaling=100\" --outdir \"{tempDir}\" \"{tempFilePath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                },
            };
            process.Start();
            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                var error = process.StandardError.ReadToEnd();
                return (null, $"Error generating PDF: {error}");
            }

            // read pdf file
            var pdfBytes = System.IO.File.ReadAllBytes(pdfFilePath);

            return (pdfBytes, "");
        }
        finally
        {
            if (System.IO.File.Exists(tempFilePath))
                System.IO.File.Delete(tempFilePath);
            if (System.IO.File.Exists(pdfFilePath))
                System.IO.File.Delete(pdfFilePath);
        }
    }

    public (byte[]?, string) convertTo(byte[] inputBytes, string extension, string outputType = "pdf")
    {
        var unixms = DateTimeOffset.Now.ToUnixTimeMilliseconds();
        var tempDir = Path.Combine(Path.GetTempPath(), "gen_files");
        Directory.CreateDirectory(tempDir);

        var tempFilePath = Path.Combine(tempDir, $"file_{unixms}.{extension}");
        var outputFilePath = Path.Combine(tempDir, $"file_{unixms}.{outputType}");
        try
        {
            System.IO.File.WriteAllBytes(tempFilePath, inputBytes);

            // Call LibreOffice to convert to whatever format
            var process = new System.Diagnostics.Process
            {
                StartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "soffice",
                    Arguments = $"--headless --convert-to {outputType} --outdir \"{tempDir}\" \"{tempFilePath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                },
            };
            process.Start();
            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                var error = process.StandardError.ReadToEnd();
                return (null, $"Error converting to {outputType}: {error}");
            }

            // Read the converted file
            var outputBytes = System.IO.File.ReadAllBytes(outputFilePath);

            return (outputBytes, "");
        }
        catch (Exception ex)
        {
            return (null, $"Exception during conversion: {ex.Message}");
        }
        finally
        {
            // Clean up temp files
            if (System.IO.File.Exists(tempFilePath))
                System.IO.File.Delete(tempFilePath);
            if (System.IO.File.Exists(outputFilePath))
                System.IO.File.Delete(outputFilePath);
        }
    }
}
