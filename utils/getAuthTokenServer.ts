'use server'

import { cookies } from 'next/headers';

/**
 * Gets access token from cookie on the server side
 * @returns 
 */
export const getAuthTokenServer = async (): Promise<string | null> => {
    const cookieStore = cookies();
    const authToken = await cookieStore.get('dmspt');
    return authToken ? authToken?.value : null;
}