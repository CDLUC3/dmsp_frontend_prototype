
import { NextResponse } from 'next/server';
import { deleteCookie } from '@/utils/cookiesUtil';

export async function POST() {
    try {
        //TODO: Will eventually want to send a request to the backend server so that it can invalidate the JWT token
        const response = NextResponse.json({ message: 'Logout successful' });
        deleteCookie(response, 'dmspt');
        return response;
    } catch (error) {
        console.error('Logout failed:', error);
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
    }
}