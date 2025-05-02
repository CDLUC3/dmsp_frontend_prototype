import { jwtVerify, JWTPayload } from 'jose';
import { getSecret } from '@/utils/getSecret';
import logger from "@/utils/logger";

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
        logger.error('verifyJwtToken', { error: 'Token verification failed' });
        return null;
    }
}

