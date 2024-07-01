/**
 * @jest-environment node
 */
import { GET, POST, PUT, DELETE } from '../route';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';

jest.mock('@/utils/getAuthTokenServer', () => ({
    getAuthTokenServer: jest.fn(),
}));

describe('GET Function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should return token if available and a status of 200', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue('valid-token');

        const response = await GET();
        expect(response.status).toEqual(200);
        const data = await response.json();

        expect(data).toEqual({ token: 'valid-token' })
    })

    it('should return value null for token if token is not available', async () => {
        (getAuthTokenServer as jest.Mock).mockResolvedValue(null);

        const response = await GET();
        expect(response.status).toEqual(200);
        const data = await response.json();

        expect(data).toEqual({ token: null })
    })

    it('should handle internal server error', async () => {
        (getAuthTokenServer as jest.Mock).mockRejectedValue(new Error('Test error'));

        const response = await GET();
        expect(response.status).toEqual(500);
        const data = await response.json();

        expect(data).toEqual({ error: 'Internal Server Error' })
    })
});

describe('POST Function', () => {
    it('should return an error if a POST is attempted at this endpoint', async () => {
        const response = POST();
        expect(response.status).toEqual(405);
        const data = await response.json();
        expect(data).toEqual({ error: 'Method Not Allowed' })
    })
})

describe('PUT Function', () => {
    it('should return an error if a PUT is attempted at this endpoint', async () => {
        const response = PUT();
        expect(response.status).toEqual(405);
        const data = await response.json();
        expect(data).toEqual({ error: 'Method Not Allowed' })
    })
})

describe('DELETE Function', () => {
    it('should return an error if a DELETE is attempted at this endpoint', async () => {
        const response = DELETE();
        expect(response.status).toEqual(405);
        const data = await response.json();
        expect(data).toEqual({ error: 'Method Not Allowed' })
    })
})