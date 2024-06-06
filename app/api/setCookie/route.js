import { NextResponse } from "next/server";

export async function POST(request) {
    const { token } = await request.json();

    const response = NextResponse.json({ message: 'Cookie set' });

    response.cookies.set('dmspId', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
    });

    return response;
}