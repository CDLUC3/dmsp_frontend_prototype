import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dmpId = searchParams.get('dmpId'); // Get the doi, passed as dmpId, from query parameters

    // Get all cookies to pass in request header
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    if (!dmpId) {
      return NextResponse.json({ error: 'dmpId is required' }, { status: 400 });
    }

    // Build the narrative service URL
    // Use environment variable for the narrative service URL
    const narrativeServiceBase = process.env.NARRATIVE_SERVICE_URL || 'http://localhost:4030';
    const narrativeUrl = new URL(`${narrativeServiceBase}/dmps/${encodeURIComponent(dmpId)}/narrative`); // Encode dmpId for URL safety and because of forward slashes in DOIs

    // Forward all other query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'dmpId') {
        narrativeUrl.searchParams.append(key, value);
      }
    });

    // Get the Accept header from the original request
    const acceptHeader = request.headers.get('accept') || 'application/pdf';

    // Headers for the GraphQL request
    const headers = {
      Accept: acceptHeader,
      Cookie: cookieString,
    };


    // Fetch from the narrative service
    const response = await fetch(narrativeUrl.toString(), {
      headers
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Narrative service error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the response as a blob
    const blob = await response.blob();

    // Return the blob with appropriate headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment',
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch narrative' },
      { status: 500 }
    );
  }
}