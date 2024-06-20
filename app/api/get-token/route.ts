import { NextResponse } from 'next/server';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';

export const GET = async () => {
    try {
        const token = await getAuthTokenServer();
        if (token) {
            return NextResponse.json({ token }, { status: 200 })
        } else {
            return NextResponse.json({ error: 'Token not found' }, { status: 404 })
        }
    } catch (err) {
        console.error('Error fetching token:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 405 });
    }
};

export const POST = () => {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
};

export const PUT = () => {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
};

export const DELETE = () => {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
};