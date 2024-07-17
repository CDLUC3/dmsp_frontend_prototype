/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import httpMocks from 'node-mocks-http';
import { POST } from '../route';
import { deleteCookie } from '@/utils/cookiesUtil';

jest.mock('@/utils/cookiesUtil', () => ({
    deleteCookie: jest.fn(),
}));

describe('POST /logout', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });


    it('should return 200 and delete the cookie on successful logout', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/logout',
        })

        const jsonResponse = await POST(req as unknown as NextRequest);
        const responseData = await jsonResponse.json();
        expect(jsonResponse.status).toBe(200);
        expect(responseData).toEqual({ message: 'Logout successful' });
        expect(deleteCookie).toHaveBeenCalledWith(expect.any(NextResponse), 'dmspt');
    });

    it('should return 500 if an error occurs', async () => {

        // Simulate an error in the POST function
        jest.spyOn(NextResponse, 'json').mockImplementationOnce(() => {
            throw new Error('Failed to delete cookie');
        });

        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/logout',
        })

        const jsonResponse = await POST(req as unknown as NextRequest);
        const responseData = await jsonResponse.json();

        expect(jsonResponse.status).toBe(500);
        expect(responseData).toEqual({ message: 'Logout failed' });
    });
});