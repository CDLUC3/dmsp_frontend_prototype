/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { verifyJwtToken } from '../lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';


jest.mock('../lib/server/auth', () => ({
    verifyJwtToken: jest.fn(),
}));

jest.mock('@/utils/getAuthTokenServer', () => ({
    getAuthTokenServer: jest.fn(),
}));

jest.mock('@/utils/cookiesUtil', () => ({
    deleteCookie: jest.fn()
}))

describe('middleware.ts', () => {
    let redirectSpy: jest.SpyInstance;

    beforeEach(() => {
        redirectSpy = jest.spyOn(NextResponse, 'redirect');
        jest.clearAllMocks();
    });

    afterEach(() => {
        redirectSpy.mockRestore();
    })


    it('should allow access to protected routes if token is valid and include correct header', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid_token');
        const request = new NextRequest(new Request('http://localhost:3000/dmps/123'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => true);
        const response = await middleware(request);
        expect(response.status).toEqual(200);
        expect(response.headers.get('x-url')).toBe('http://localhost:3000/dmps/123');
    });

    it('should not redirect if user is not logged in and visits /login', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue(undefined);
        const request = new NextRequest(new Request('http://localhost:3000/login'));
        const response = await middleware(request);

        expect(redirectSpy).not.toHaveBeenCalled();
        expect(response.status).toEqual(200);
    });
});