import { NextResponse, NextRequest } from 'next/server';

// TODO: These routes will need to be updated.
const protectedPaths = ['/dmps/', '/admin/', '/template']
const excludedPaths = ['/login', '/signup', '/email', '/favicon.ico', '/_next', '/api'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  // Check if the path is in the excludedPaths array
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    // If it is, return the response without checking for tokens
    return response;
  }

  const accessToken = request.cookies.get('dmspt');
  const refreshToken = request.cookies.get('dmspr');

  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/

  // Check for tokens for paths that are not excluded from authentication
  if (!excludedPaths.some(path => pathname.startsWith(path))) {
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Add url info to custom header. Need this for just the /dmps landing page
  if (request.nextUrl.pathname.startsWith('/dmps')) {
    response.headers.set('x-url', request.nextUrl.href);
  }

  return response;

}