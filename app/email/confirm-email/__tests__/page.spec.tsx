/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation';
import ConfirmEmailPage from '../page';

// Mock the redirect function from next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock the fetch global
global.fetch = jest.fn();

describe('ConfirmEmailPage', () => {
  const mockParams = {
    params: { userId: '123', token: 'abc' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /email-confirmed when email verification is successful', async () => {
    // Mock fetch to return a successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    // Call the server-side function
    await ConfirmEmailPage(mockParams);

    // Assert that redirect was called with the correct URL
    expect(redirect).toHaveBeenCalledWith('/email-confirmed');
  });

  it('should redirect to /verification-failed when email verification fails', async () => {
    // Mock fetch to return a failed response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    // Call the server-side function
    await ConfirmEmailPage(mockParams);

    // Assert that redirect was called with the failure URL
    expect(redirect).toHaveBeenCalledWith('/verification-failed');
  });
});