/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { verifyJwtToken } from '../lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';
import { deleteCookie } from '@/utils/cookiesUtil';


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
    const mockNextRequest = (url: string, cookies: Record<string, string> = {}) => {
        return {
            nextUrl: new URL(url, 'http://localhost:3000'),
            cookies: {
                get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
                delete: jest.fn(),
            },
            headers: new Headers(),
        } as unknown as NextRequest;
    };

    beforeEach(() => {
        redirectSpy = jest.spyOn(NextResponse, 'redirect');
        jest.clearAllMocks();
    });

    afterEach(() => {
        redirectSpy.mockRestore();
    })

    it('should redirect to login if no token is found for protected path', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue(null);
        const request = new NextRequest(new Request('http://localhost:3000/dmps/123'));
        const response = await middleware(request);

        expect(redirectSpy).toHaveBeenCalledWith('http://localhost:3000/login');
    });

    it('should delete token and redirect to login if token is invalid', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('invalid_token');
        const request = new NextRequest(new Request('http://localhost:3000/dmps/123'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => false);
        await middleware(request);

        expect(deleteCookie).toHaveBeenCalled();
        expect(redirectSpy).toHaveBeenCalledWith('http://localhost:3000/login');
    });

    it('should allow access to protected routes if token is valid and include correct header', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid_token');
        const request = new NextRequest(new Request('http://localhost:3000/dmps/123'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => true);
        const response = await middleware(request);
        expect(response.status).toEqual(200);
        expect(response.headers.get('x-url')).toBe('http://localhost:3000/dmps/123');
    });

    it('should redirect to app home page if user is already logged in and visits /login', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid_token');
        const request = new NextRequest(new Request('http://localhost:3000/login'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => true);
        await middleware(request);

        expect(redirectSpy).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('should not redirect if user is not logged in and visits /login', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue(undefined);
        const request = new NextRequest(new Request('http://localhost:3000/login'));
        const response = await middleware(request);

        expect(redirectSpy).not.toHaveBeenCalled();
        expect(response.status).toEqual(200);
    });

    it('should delete cookie when user goes to /login and has token but verifyJwtToken returns null', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid_token');
        const request = new NextRequest(new Request('http://localhost:3000/login'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => null);
        const response = await middleware(request);

        expect(deleteCookie).toHaveBeenCalled();
    });

    it('should delete cookie when user goes to /login and there is an error calling verifyJwtToken', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid_token');
        const request = new NextRequest(new Request('http://localhost:3000/login'));
        (verifyJwtToken as jest.Mock).mockImplementation(() => { throw new Error('Could not verify cookie') });
        await middleware(request);

        expect(deleteCookie).toHaveBeenCalled();
    });
});