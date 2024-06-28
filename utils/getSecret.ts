/**
 * Get JWT secret
 * @returns 
 */
export const getSecret = async (): Promise<string | null> => {
    const secret = process.env.JWT_SECRET;
    return secret ? secret : null;
}