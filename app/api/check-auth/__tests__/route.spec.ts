/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server';
import { GET } from '../route';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import { verifyJwtToken } from '@/lib/server/auth';
import logger from '@/utils/server/logger';

jest.mock('@/utils/server/logger');

jest.mock('@/utils/getAuthTokenServer', () => ({
    getAuthTokenServer: jest.fn(),
}));

jest.mock('@/lib/server/auth', () => ({
    verifyJwtToken: jest.fn(),
}));


describe('GET Function', () => {
    let redirectSpy: jest.SpyInstance;
    beforeEach(() => {
        redirectSpy = jest.spyOn(NextResponse, 'redirect');
        jest.clearAllMocks();
    });

    afterEach(() => {
        redirectSpy.mockRestore();

    })

    it('should return true for "authenticated" and a status of 200 if auth cookie is present and passes verification', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid-token');
        (verifyJwtToken as jest.Mock).mockImplementation(() => true);
        const response = await GET();
        expect(response.status).toEqual(200);
        const data = await response.json();

        expect(data).toEqual({ authenticated: true })
    })

    it('should return false for "authenticated" if it auth token does not pass verification', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid-token');
        (verifyJwtToken as jest.Mock).mockImplementation(() => false);
        const response = await GET();
        const data = await response.json();

        expect(data).toEqual({ authenticated: false })
        expect(logger.error).toHaveBeenCalledWith('User verification failed');
    })

    it('should return false for "authenticated" if there is no "dmspt" auth cookie/token', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue(null);
        const response = await GET();
        const data = await response.json();

        expect(data).toEqual({ authenticated: false })
    })

    it('should return error with "authenticated" set to false when an error is thrown getting the token', async () => {
        (getAuthTokenServer as jest.Mock).mockRejectedValue(new Error('Test error'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => false);
        const response = await GET();
        const data = await response.json();

        expect(data).toEqual({ authenticated: false, error: 'Internal Server Error' })
        expect(logger.error).toHaveBeenCalledWith('Error getting auth token', expect.objectContaining({ error: expect.any(Error), })
        );
    })

    it('should redirect to login page if verification of token fails', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('invalid-token');
        (verifyJwtToken as jest.Mock).mockRejectedValue(new Error('Verification failed'));
        await GET();

        expect(logger.error).toHaveBeenCalledWith('Token verification error', expect.objectContaining({ error: expect.any(Error), })
        );
        expect(redirectSpy).toHaveBeenCalledWith('http://localhost:3000/login');
    })

});