import { NextResponse, NextRequest } from 'next/server';

// TODO: These routes will need to be updated.
const protectedPaths = ['/dmps/', '/admin/']


export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const accessToken = request.cookies.get('dmspt');
  const refreshToken = request.cookies.get('dmspr');
  const { pathname } = request.nextUrl;

  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // If both access and refresh tokens are missing, redirect to /login
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