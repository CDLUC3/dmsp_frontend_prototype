import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createLogger } from '@/utils/server/logger';

const logger = createLogger();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dmpId = searchParams.get('dmpId'); // Get the doi, passed as dmpId, from query parameters

    if (!dmpId) {
      return NextResponse.json({ error: 'dmpId is required' }, { status: 400 });
    }

    // Build the narrative service URL
    const narrativeServiceBase = process.env.NARRATIVE_SERVICE_URL || 'http://localhost:4030';
    const narrativeUrl = new URL(`${narrativeServiceBase}/dmps/${encodeURIComponent(dmpId)}/narrative`);

    // Forward all other query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'dmpId') {
        narrativeUrl.searchParams.append(key, value);
      }
    });

    // Get the Accept header from the original request
    const acceptHeader = request.headers.get('accept') || 'application/pdf';

    // Get all cookies to pass in request header
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Extract dmspt token from cookies
    const dmsptMatch = cookieString.match(/dmspt=([^;]+)/);
    const dmsptToken = dmsptMatch ? dmsptMatch[1] : null;

    // Build headers for the narrative service request
    const headers: Record<string, string> = {
      Accept: acceptHeader,
      Cookie: cookieString,
    };
    if (dmsptToken) {
      headers['Authorization'] = `Bearer ${dmsptToken}`;
    }

    logger.info({
      acceptHeader,
      cookieString,
      dmsptToken,
      headers,
      narrativeUrl: narrativeUrl.toString(),
    }, 'Making request to narrative service');

    // Fetch from the narrative service
    const response = await fetch(narrativeUrl.toString(), {
      headers
    });

    if (!response.ok) {
      logger.error({
        status: response.status,
        statusText: response.statusText,
        url: narrativeUrl.toString(),
        headers,
      }, 'Narrative service returned error');
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
    logger.error({
      error,
      route: '/api/download-narrative',
    }, 'Error downloading plan narrative');
    return NextResponse.json(
      { error: 'Failed to fetch narrative' },
      { status: 500 }
    );
  }
}