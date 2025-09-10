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
          logger.error('User verification failed');
          return NextResponse.json({ authenticated: false });
        }
      } catch (err) {
        logger.error({ error: err }, 'Token verification error')
        return NextResponse.redirect(LOGIN);
      }

    } else {
      return NextResponse.json({ authenticated: false })
    }
  } catch (err) {
    logger.error({ error: err }, 'Error getting auth token');
    return NextResponse.json({ authenticated: false, error: 'Internal Server Error' })
  }
}
