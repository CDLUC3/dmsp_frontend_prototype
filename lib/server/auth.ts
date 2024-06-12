import jwt, { Secret } from 'jsonwebtoken';

export function getJwtSecretKey(): Secret {
    // Secret is hardcoded for now
    // TODO: Need to figure out where the secret will be stored
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
        return null;
    }
}

