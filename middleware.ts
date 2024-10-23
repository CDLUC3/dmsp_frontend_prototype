import {NextRequest, NextResponse} from 'next/server';

// TODO: These routes will need to be updated.
const protectedPaths = ['/dmps/', '/admin/']
const excludedPaths = ['/login/', '/signup/', '/email/'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Check if the request pathname is in the excluded paths
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    // If the path is excluded, allow the request to continue without further processing
    return response;
  }

  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/

  if (protectedPaths.some(path => pathname.startsWith(path))) {

  }


  // Add url info to custom header. Need this for just the /dmps landing page
  if (request.nextUrl.pathname.startsWith('/dmps')) {
    response.headers.set('x-url', request.nextUrl.href);
  }

  return response;

}
