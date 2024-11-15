import { NextRequest, NextResponse } from 'next/server';
import { JwtPayload } from 'jsonwebtoken';
import { verifyJwtToken } from './lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const locales = ['en-US', 'pt-BR', 'es'];
const defaultLocale = 'en-US';

interface JWTAccessToken extends JwtPayload {
  id: number,
  email: string,
  givenName: string,
  surName: string,
  role: string,
  languageId: string,
  jti: string,
  expiresIn: number,
}

// TODO: These routes will need to be updated.
const protectedPaths = ['/dmps/', '/admin/', '/template']

const handleI18nRouting = createMiddleware(routing);

async function getLocaleFromJWT(): Promise<string | null> {
  try {
    const token = await getAuthTokenServer();
    if (!token) {
      return null;
    }
    const user = await verifyJwtToken(token);
    const { languageId } = user as JWTAccessToken;

    if (languageId && locales.includes(languageId)) {
      return languageId;
    }
    return null;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

async function getLocale(request: NextRequest) {
  try {
    // First try and get locale from JWT
    const userLocale = await getLocaleFromJWT();
    if (userLocale) return userLocale;

    //Fall back to Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const browserLocale = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();

      if (locales.includes(browserLocale)) {
        return browserLocale
      }
    }
    //Otherwise, use Default locale
    return defaultLocale;
  } catch (error) {
    console.log('Error detecting locale:', error);
    return defaultLocale;
  }
}

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

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = await getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse) return i18nResponse;

  // Add url info to custom header. Need this for just the /dmps landing page
  if (request.nextUrl.pathname.startsWith('/dmps')) {
    response.headers.set('x-url', request.nextUrl.href);
  }

  return response;

}

export const config = {
  // Don't run middleware for api endpoints, static files, anything in our pubic folder or _next files
  matcher: ['/((?!api|_next|static|.*\\..*).*)',]
};