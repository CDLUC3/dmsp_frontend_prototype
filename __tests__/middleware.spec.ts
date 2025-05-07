import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { verifyJwtToken } from '@/lib/server/auth';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';

jest.mock('next/server', () => ({
    NextResponse: {
        next: jest.fn(),
        redirect: jest.fn(),
    },
}));

jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn()
}))


jest.mock('next-intl/middleware', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()), // Mocks `createMiddleware` returning a handler
}));

jest.mock('@/lib/server/auth', () => ({
    verifyJwtToken: jest.fn(),
}));
jest.mock('@/utils/getAuthTokenServer', () => ({
    getAuthTokenServer: jest.fn(),
}));

(verifyJwtToken as jest.Mock).mockResolvedValue({ languageId: 'en-US' });
(getAuthTokenServer as jest.Mock).mockResolvedValue('mock-token');

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
            headers: {
                get: jest.fn().mockReturnValue('dmspr=refreshTokenValue')
            },
            nextUrl: {
                pathname: '',
                href: 'http://localhost/test',
            },
            url: 'http://localhost/test',
        } as unknown as NextRequest;

        (NextResponse.next as jest.Mock).mockReturnValue(response);
    });

    it('should handle locale resolution correctly', async () => {
        request.nextUrl.pathname = '/';
        (getAuthTokenServer as jest.Mock).mockResolvedValue('mock-token');
        (verifyJwtToken as jest.Mock).mockResolvedValue({ languageId: 'pt-BR' });

        await middleware(request);

        const expectedUrl = new URL("http://localhost/pt-BR/");
        expect(NextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('should redirect to /login if both tokens are missing and path is protected', async () => {
        request.nextUrl.pathname = '/dmps/';
        request.cookies.get = jest.fn().mockReturnValue(undefined); // No tokens

        const result = await middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', request.url));
        expect(result).toBe(NextResponse.redirect(new URL('/login', request.url)));
    });

    it('should set custom header for /dmps path', async () => {
        request.nextUrl.pathname = '/en-US/dmps';

        const result = await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(response.headers.set).toHaveBeenCalledWith('x-url', request.nextUrl.href);
        expect(result).toBe(response);
    });

    it('should not redirect if at least one token is present on protected path', async () => {
        request.nextUrl.pathname = '/en-US/protected';
        request.cookies.get = jest.fn().mockImplementation((key) => {
            if (key === 'dmspt') return 'accessToken'; // Simulate accessToken is present
            return undefined;
        });

        const result = await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(result).toBe(response);
    });

    it('should fall back to using default locale when verifyJwtToken fails', async () => {
        request.nextUrl.pathname = '/';
        (getAuthTokenServer as jest.Mock).mockResolvedValue('mock-token');
        (verifyJwtToken as jest.Mock).mockRejectedValue(new Error('Token verification failed'));

        await middleware(request);

        const expectedUrl = new URL("http://localhost/en-US/");
        expect(NextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
    });
});
