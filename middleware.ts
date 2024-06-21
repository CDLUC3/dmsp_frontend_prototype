import { NextResponse, NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import { deleteCookie } from '@/utils/cookiesUtil';

// TODO: These routes will need to be updated.
const protectedPaths = ['/dmps/', '/admin/']
const LOGIN = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
const HOME = `${process.env.NEXT_PUBLIC_BASE_URL}`;


export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getAuthTokenServer();

    if (!token) {
      return NextResponse.redirect(LOGIN);
    }

    try {
      const user = await verifyJwtToken(token);

      if (!user) {
        //Delete token cookie
        deleteCookie(response, 'dmspt');
        return NextResponse.redirect(LOGIN);
      }

      // For admin role/path
      if (pathname.startsWith('/admin')) {
        // if (user.role !== 'admin') {
        //   return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/access-denied`);
        // }
      }
    } catch (err) {
      // Delete token cookie if authentication fails
      deleteCookie(response, 'dmspt');
      return NextResponse.redirect(LOGIN);
    }
  }


  if (pathname === '/login') {
    const token = await getAuthTokenServer();
    if (token) {
      try {
        const payload = await verifyJwtToken(token);

        if (payload) {
          return NextResponse.redirect(HOME);
        } else {
          //Delete token
          deleteCookie(response, 'dmspt');
        }
      } catch (error) {
        // Delete token
        deleteCookie(response, 'dmspt');
      }
    }
  }

  // Add url info to custom header. Need this for just the /dmps landing page
  if (request.nextUrl.pathname.startsWith('/dmps')) {
    response.headers.set('x-url', request.nextUrl.href);
  }

  return response;

}