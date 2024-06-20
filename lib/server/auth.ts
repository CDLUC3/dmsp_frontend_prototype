import { jwtVerify, JWTPayload } from 'jose';

export function getJwtSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET

    if (!secret) {
        throw new Error('JWT Secret key is not set');
    }

    return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: string): Promise<boolean | null> {
    try {
        const secretKey = getJwtSecretKey();

        const { payload } = await jwtVerify(token, secretKey) as { payload: JWTPayload };

        return !!payload;
    } catch (error) {
        console.error('Token verification failed:', error)
        return null;
    }
}

