import { NextResponse } from 'next/server';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import { verifyJwtToken } from '@/lib/server/auth';
import logger from '@/utils/server/logger';

const LOGIN = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

export async function GET() {
  try {
    const token = await getAuthTokenServer();

    if (token) {
      try {
        const user = await verifyJwtToken(token);
        if (user) {
          return NextResponse.json({ authenticated: true });
        } else {
          logger.error(
            {
              error: 'User verification failed',
              token,
              route: '/api/check-auth',
            }
          )
          return NextResponse.json({ authenticated: false });
        }
      } catch (err) {
        logger.error({
          error: err,
          token,
          route: '/api/check-auth',
        }, 'Token verification error')
        return NextResponse.redirect(LOGIN);
      }

    } else {
      return NextResponse.json({ authenticated: false })
    }
  } catch (err) {
    logger.error({
      error: err,
      route: '/api/check-auth',
    }, 'Error getting auth token from cookie');
    return NextResponse.json({ authenticated: false, error: 'Internal Server Error' })
  }
}
