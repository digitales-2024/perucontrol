/**
 * Extracts filename from Content-Disposition header or other sources
 * @param contentDisposition - The Content-Disposition header value
 * @returns The extracted filename or null if not found
 */
function extractFilenameFromContentDisposition(contentDisposition: string): string | null
{
    // Handle both filename and filename* patterns
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameStarRegex = /filename\*[^;=\n]*=UTF-8''([^;\n]*)/;

    // Try filename* first (RFC 5987 encoded)
    const starMatch = contentDisposition.match(filenameStarRegex);
    if (starMatch)
    {
        try
        {
            return decodeURIComponent(starMatch[1]);
        }
        catch
        {
            // If decoding fails, fall through to regular filename
        }
    }

    // Try regular filename
    const match = contentDisposition.match(filenameRegex);
    if (match)
    {
        let filename = match[1];
        // Remove quotes if present
        filename = filename.replace(/['"]/g, "");
        return filename;
    }

    return null;
}

/**
 * Downloads a blob with filename extracted from response headers or fallback
 * @param blob - The blob to download
 * @param fallbackFilename - Filename to use if none can be extracted
 * @param responseHeaders - Optional response headers to extract filename from
 */
export function downloadBlobWithFilename(
    blob: Blob,
    fallbackFilename: string,
    responseHeaders?: Headers,
): void
{
    let filename = fallbackFilename;

    // Try to extract filename from headers
    if (responseHeaders)
    {
        const contentDisposition = responseHeaders.get("content-disposition");
        if (contentDisposition)
        {
            const extractedFilename = extractFilenameFromContentDisposition(contentDisposition);
            if (extractedFilename)
            {
                filename = extractedFilename;
            }
        }
    }

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Downloads a file response with automatic filename extraction
 * @param fileResponse - The file response containing blob and headers
 * @param fallbackFilename - Filename to use if none can be extracted
 */
export function downloadFileResponse(
    fileResponse: FileDownloadResponse,
    fallbackFilename: string,
): void
{
    downloadBlobWithFilename(fileResponse.blob, fallbackFilename, fileResponse.headers);
}

/**
 * Downloads a blob using server-extracted filename or fallback
 * @param blob - The blob to download
 * @param serverFilename - Filename extracted on server side (can be null)
 * @param fallbackFilename - Filename to use if server filename is null
 */
export function downloadBlobWithServerFilename(
    blob: Blob,
    serverFilename: string | null,
    fallbackFilename: string,
): void
{
    const filename = serverFilename ?? fallbackFilename;

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Type for the enhanced download file response
 */
export type FileDownloadResponse = {
    blob: Blob;
    headers: Headers;
};
