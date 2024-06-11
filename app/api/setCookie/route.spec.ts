/**
 * @jest-environment node
 */
import { POST } from './route'; // Assuming this is the correct path to your route file
import * as AuthMethods from '@/lib/server/auth';
import httpMocks from 'node-mocks-http';


// Mock the verifyJwtToken function
jest.mock('@/lib/server/auth', () => ({
    verifyJwtToken: jest.fn(),
}));

describe('/api/setCookie/route', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks before each test
        jest.resetAllMocks();
    });

    it('should return a 200 status code', async () => {
        // Mock the verifyJwtToken function to return true
        (AuthMethods.verifyJwtToken as jest.Mock).mockReturnValueOnce(true);


        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/setCookie',
            params: {
                token: 'valid_token'
            },
            text: jest.fn().mockImplementation(() => JSON.stringify({ token: 'valid_token' }))
        })

        const jsonResponse = await POST(req as any);

        const responseData = jsonResponse.json();
        const data = await responseData;
        expect(data.status).toBe(200);
        expect(data.message).toEqual('Cookie set successfully');
    });

    it('should return a 400 status code if no token', async () => {
        // Mock the verifyJwtToken function to return true
        (AuthMethods.verifyJwtToken as jest.Mock).mockReturnValueOnce(true);


        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/setCookie',
            params: {
                token: 'valid_token'
            },
            text: jest.fn().mockImplementation(() => JSON.stringify({}))
        })

        const response = httpMocks.createResponse();
        const jsonResponse = await POST(req as any);

        const responseData = jsonResponse.json();
        const data = await responseData;
        expect(data.status).toBe(400);
        expect(data.message).toEqual('Token not provided');
    });

    it('should return a 401 if verifyJwtToken() returns false', async () => {
        // Mock the verifyJwtToken function to return true
        (AuthMethods.verifyJwtToken as jest.Mock).mockReturnValueOnce(false);


        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/setCookie',
            params: {
                token: 'valid_token'
            },
            text: jest.fn().mockImplementation(() => JSON.stringify({ token: 'valid_token' }))
        })

        const response = httpMocks.createResponse();
        const jsonResponse = await POST(req as any);

        const responseData = jsonResponse.json();
        const data = await responseData;
        expect(data.status).toBe(401);
        expect(data.message).toEqual('Invalid token');
    });

    it('should return a 500 if there was an error', async () => {
        // Mock the verifyJwtToken function to return true
        (AuthMethods.verifyJwtToken as jest.Mock).mockReturnValueOnce(false);


        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/setCookie',
            params: {
                token: 'valid_token'
            },
            text: () => { throw new Error('Something went wrong') }
        })

        const response = httpMocks.createResponse();
        const jsonResponse = await POST(req as any);

        const responseData = jsonResponse.json();
        const data = await responseData;

        expect(data.message).toEqual('Something went wrong');
    });
});