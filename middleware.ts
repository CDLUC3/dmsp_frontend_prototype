import { NextResponse, NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/server/auth';


// TODO: These routes will need to be updated.
const authRoutes = ['/dmps/*', '/api/*', '/admin/*'];
const excludedPaths = ['/api/setCookie', '/*']

function matchesWildcard(path: string, pattern: string): boolean {
  if (pattern.endsWith('/*')) {
    const basePattern = pattern.slice(0, -2);
    return path.startsWith(basePattern);
  }
  return path === pattern;
}

//Middleware will handle access to certain pages based on authentication and role
export function middleware(request: NextRequest) {

  let redirectToApp = false;

  // Skip authentication for excluded paths
  if (excludedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const LOGIN = `${process.env.NEXT_PUBLIC_BASE_URL}/login`
  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/

  if (authRoutes.some(pattern => matchesWildcard(request.nextUrl.pathname, pattern))) {

    const token = request.cookies.get('dmspt');

    if (!token) {
      return NextResponse.redirect(LOGIN);
    }

    try {
      const user = verifyJwtToken(token.value);

      if (!user) {
        //Delete token
        request.cookies.delete('dmspt');
        return NextResponse.redirect(LOGIN);
      }

      // For admin role/path
      if (request.nextUrl.pathname.startsWith('/admin')) {
        // if (user.role !== 'admin') {
        //   return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/access-denied`);
        // }
      }
    } catch (err) {
      // Delete token if authentication fails
      request.cookies.delete('dmspt');
      return NextResponse.redirect(LOGIN);
    }
  }


  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('dmspt');

    if (token) {
      try {
        const payload = verifyJwtToken(token.value);

        if (payload) {
          console.log("")
          redirectToApp = true;
        } else {
          //Delete token
          request.cookies.delete('dmspt');
        }
      } catch (error) {
        // Delete token
        request.cookies.delete('dmspt');
      }
    }
  }

  // Add url info to custom header. Need this for just the /dmps landing page
  const requestHeaders = new Headers(request.headers);
  if (request.nextUrl.pathname.startsWith('/dmps')) {
    requestHeaders.set('x-url', request.nextUrl.href);
  }

  if (redirectToApp) {
    // Redirect to app home page?
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  } else {
    // Return the original response unaltered
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }



}
