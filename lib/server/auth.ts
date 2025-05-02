import { jwtVerify, JWTPayload } from 'jose';
import { getSecret } from '@/utils/getSecret';

/**
 * Get the JWT Secret
 * @returns 
 */
export async function getJwtSecretKey(): Promise<Uint8Array> {
    const secret = await getSecret();

    if (!secret) {
        throw new Error('JWT Secret key is not set');
    }

    return new TextEncoder().encode(secret);
}

/**
 * Determine if token is valid
 * @param token 
 * @returns 
 */
export async function verifyJwtToken(token: string): Promise<JWTPayload | null> {
    try {
        const secretKey = await getJwtSecretKey();

        const { payload } = await jwtVerify(token, secretKey) as { payload: JWTPayload };

        return payload; //return boolean
    } catch (error) {
        console.error(JSON.stringify({
            level: 'error',
            message: '[verifyJwtToken]: Token verification failed',
            error: {
                name: (error as Error).name,
                message: (error as Error).message,
                stack: (error as Error).stack
            }
        }));
        return null;
    }
}

