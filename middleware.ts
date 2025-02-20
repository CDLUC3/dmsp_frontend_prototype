import { NextRequest, NextResponse } from 'next/server';
import { JwtPayload } from 'jsonwebtoken';
import { verifyJwtToken } from './lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import createMiddleware from 'next-intl/middleware';
import { refreshAuthTokens } from "@/utils/authHelper";
import { routing } from './i18n/routing';
import logECS from '@/utils/clientLogger';

const locales = ['en-US', 'pt-BR'];
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
const excludedPaths = ['/email', '/favicon.ico', '/_next', '/api', '/login', '/signup'];

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
  const { pathname } = request.nextUrl;

  /* TODO: might want to add a 'redirect' query param to url to redirect user after
   login to the original page they were trying to get to.*/


  // Exclude paths from authentication checks
  const isExcludedPath = excludedPaths.some((path) => pathname.includes(path));

  const cookies = request.headers.get('cookie') || '';
  const accessToken = request.cookies.get('dmspt');
  const refreshToken = request.cookies.get('dmspr');
  const locale = await getLocale(request);

  // Redirect to login if no tokens are found
  if (!isExcludedPath) {
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  //Refresh tokens if necessary
  if (!accessToken && refreshToken) {
    try {
      await refreshAuthTokens(cookies);
    } catch (error) {
      logECS('error', 'refreshing', {
        error,
        url: { path: 'middleware' }
      });
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = await getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    if (request.nextUrl.search) {
      newUrl.search = request.nextUrl.search; // Only assign if it's valid
    }
    return NextResponse.redirect(newUrl);
  }

  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse) return i18nResponse;

  // Add url info to custom header. Need this for just the /dmps landing page
  if (request.nextUrl.pathname.startsWith('/en-US/dmps')) {
    response.headers.set('x-url', request.nextUrl.href);
  }

  return response;

}

export const config = {
  // Don't run middleware for api endpoints, static files, anything in our pubic folder or _next files
  matcher: ['/((?!api|_next|static|.*\\..*).*)',]
};

