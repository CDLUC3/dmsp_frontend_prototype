import jwt, { Secret } from 'jsonwebtoken';

export function getJwtSecretKey(): Secret {
    const secret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

    if (!secret) {
        throw new Error('JWT Secret key is not set');
    }

    return secret;
}

export function verifyJwtToken(token: string): boolean | null {
    try {
        const decoded = jwt.verify(token, getJwtSecretKey()) as { [key: string]: any };

        return !!decoded;
    } catch (error) {
        console.error('Token verification failed:', error)
        //Should we return an error response and/or redirect?
        return null;
    }
}

