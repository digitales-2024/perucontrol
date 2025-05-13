import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest)
{
    try
    {
        // Get the search parameters from the URL
        const searchParams = request.nextUrl.searchParams;
        const imageName = searchParams.get("name");
        const bucketName = searchParams.get("bucket");
        const mime = searchParams.get("mime") ?? "application/octet-stream";

        // Basic validation
        if (!imageName || !bucketName)
        {
            return new NextResponse("Missing required parameters", { status: 400 });
        }

        try
        {
            const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Business/image/${imageName}/${bucketName}?expectedMime=${mime}`);

            if (!response.ok)
            {
                return new NextResponse("Error fetching image", { status: 400 });
            }

            const imageData = await response.arrayBuffer();
            return new NextResponse(imageData, {
                headers: {
                    "Content-Type": mime,
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }
        catch
        {
            return new NextResponse("Error fetching image", { status: 500 });
        }
    }
    catch (error)
    {
        console.error("Error fetching image:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

