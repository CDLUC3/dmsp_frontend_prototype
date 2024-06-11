import { verifyJwtToken } from '@/lib/server/auth';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {

    try {
        const body = await req.text();
        const { token } = JSON.parse(body);

        if (!token) {
            return NextResponse.json({ message: 'Token not provided', status: 400 })
        }
        const isValid = verifyJwtToken(token);

        if (!isValid) {
            return NextResponse.json({ message: 'Invalid token', status: 401 })
        }

        const response = NextResponse.json({ message: 'Cookie set successfully', status: 200 });
        response.headers.set('Set-Cookie', `dmspt=${token}; HttpOnly; Secure;Path=/;SameSite=Strict;`)

        return response;
    } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        return NextResponse.json({ message: errorMessage })
    }
}