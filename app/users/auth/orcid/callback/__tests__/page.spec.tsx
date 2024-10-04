import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import ORCIDCallback from '../page';
import logECS from '@/utils/clientLogger';

// Mock useRouter and useSearchParams
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))


describe('ORCIDCallback', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock fetch
    global.fetch = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it('should call exchangeAuthCode when code is present', async () => {
    const token = 'f5af9f51-07e6-4332-8f1a-c0c11c1e3728';
    const id = '0000-0001-2345-6789'
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (url === 'https://orcid.org/oauth/token') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ orcid: id, access_token: token }),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock the query param to return a code
    mockGet.mockReturnValue('1234');

    render(<ORCIDCallback />);

    // Wait for the useEffect to run
    expect(mockGet).toHaveBeenCalledWith('code');
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith('info', 'Token stored successfully', {
        url: { path: '/users/auth/orcid/callback' },
      })
    })
  });

  it('should redirect to /account/connections if no code is present', () => {
    // Mock the query param to return null (no code)
    mockGet.mockReturnValue(null);

    render(<ORCIDCallback />);

    // Ensure router.push is called if there is no code
    expect(mockPush).toHaveBeenCalledWith('/account/connections');
  });

  it('should handle error when fetching tokens fails', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (url === 'https://orcid.org/oauth/token') {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({}),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    // Mock the query param to return a code
    mockGet.mockReturnValue('1234');

    // Mock fetch to reject with an error
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ ok: false }),
    });

    render(<ORCIDCallback />);

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith('error', 'Something went wrong getting tokens', {
        url: { path: '/users/auth/orcid/callback' },
      })
      // Ensure router.push is called after an error
      expect(mockPush).toHaveBeenCalledWith('/account/connections');
    })
  });
});