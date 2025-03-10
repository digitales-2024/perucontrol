import { ACCESS_TOKEN_KEY } from "@/variables";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
)
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);
    if (jwt === null)
    {
        if (process.env.NODE_ENV === "development") console.error(req.url);
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try
    {
        // Fetch the Excel file from your API
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Quotation/${id}/gen-excel`, {
            headers: {
                Authorization: `Bearer ${jwt!.value}`,
            },
        });

        if (!response.ok)
        {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        // Get the file content
        const excelBuffer = await response.arrayBuffer();

        // Set appropriate headers for file download
        return new Response(excelBuffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="quotation-${id}.xlsx"`,
            },
        });
    }
    catch (error)
    {
        console.error("Download failed:", error);
        return new NextResponse("Failed to download file");
    }
}
