import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

jest.mock('next/server', () => ({
    NextResponse: {
        next: jest.fn(),
        redirect: jest.fn(),
    },
}));

describe('middleware', () => {
    let request: NextRequest;
    let response: NextResponse;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock request and response objects
        response = {
            headers: {
                set: jest.fn(),
            },
        } as unknown as NextResponse;

        request = {
            cookies: {
                get: jest.fn().mockReturnValue('cookie-value'),
            },
            nextUrl: {
                pathname: '',
                href: 'http://localhost/test',
            },
            url: 'http://localhost/test',
        } as unknown as NextRequest;

        (NextResponse.next as jest.Mock).mockReturnValue(response);
    });

    it('should return next response when it is an excluded path', async () => {
        request.nextUrl.pathname = '/_next';

        const result = await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(result).toBe(response);
    });

    it('should redirect to /login if both tokens are missing and path is protected', async () => {
        request.nextUrl.pathname = '/dmps/';
        request.cookies.get = jest.fn().mockReturnValue(undefined); // No tokens

        const result = await middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', request.url));
        expect(result).toBe(NextResponse.redirect());
    });

    it('should set custom header for /dmps path', async () => {
        request.nextUrl.pathname = '/dmps';

        const result = await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(response.headers.set).toHaveBeenCalledWith('x-url', request.nextUrl.href);
        expect(result).toBe(response);
    });

    it('should not redirect if at least one token is present on protected path', async () => {
        request.nextUrl.pathname = '/protected';
        request.cookies.get = jest.fn().mockImplementation((key) => {
            if (key === 'dmspt') return 'accessToken'; // Simulate accessToken is present
            return undefined;
        });

        const result = await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(result).toBe(response);
    });
});