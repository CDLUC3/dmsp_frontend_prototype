import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { verifyJwtToken } from '../lib/server/auth';

jest.mock('../lib/server/auth', () => ({
    verifyJwtToken: jest.fn(),
}));

const redirectSpy = jest.spyOn(NextResponse, 'redirect');

describe('middleware', () => {
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

    const mockNextResponse = () => {
        const response = NextResponse.next();
        jest.spyOn(NextResponse, 'redirect').mockImplementation((url: string | URL) => NextResponse.next({ headers: { location: url.toString() } }));
        jest.spyOn(NextResponse, 'next').mockImplementation(() => response);
        return response;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should skip authentication for excluded paths', () => {
        const request = mockNextRequest('/api/setCookie');
        const response = middleware(request);

        expect(response).toEqual(NextResponse.next());
    });

    it('should redirect to login if no token is found for protected routes', () => {
        const request = mockNextRequest('/dmps/123');
        middleware(request);

        expect(redirectSpy).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    });

    it('should delete token and redirect to login if token is invalid', () => {
        const request = mockNextRequest('/dmps/123', { dmspt: 'invalid_token' });
        (verifyJwtToken as jest.Mock).mockImplementation(() => null);
        middleware(request);

        expect(request.cookies.delete).toHaveBeenCalledWith('dmspt');
        expect(redirectSpy).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    });

    it('should allow access to protected routes if token is valid', () => {
        const request = mockNextRequest('/dmps/123', { dmspt: 'valid_token' });
        (verifyJwtToken as jest.Mock).mockImplementation(() => ({ user: 'valid_user' }));
        const response = middleware(request);
        expect(response.status).toEqual(200);
    });

    it('should set x-url header for dmps routes', () => {
        const request = mockNextRequest('/dmps/landing', { dmspt: 'valid_token' });
        (verifyJwtToken as jest.Mock).mockImplementation(() => ({ user: 'valid_user' }));
        const response = middleware(request);

        expect(response.headers.get('x-middleware-request-x-url')).toBe('http://localhost:3000/dmps/landing');
    });

    it('should redirect to app home page if user is already logged in and visits /login', () => {
        const request = mockNextRequest('/login', { dmspt: 'valid_token' });
        (verifyJwtToken as jest.Mock).mockImplementation(() => ({ user: 'valid_user' }));
        middleware(request);

        expect(redirectSpy).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
    });

    it('should not redirect if user is not logged in and visits /login', () => {
        const request = mockNextRequest('/login');
        const response = middleware(request);

        expect(response.status).toEqual(200);
    });
});