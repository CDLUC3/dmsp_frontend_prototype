import {redirect} from 'next/navigation';

// Mock the redirect function from next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));


describe('ConfirmEmailPage', () => {
  const mockParams = {
    params: { userId: '123', token: 'abc' },
  };

  beforeEach(() => {
    global.fetch = jest.fn();

    // Explicitly mock process.env
    process.env.NEXT_PUBLIC_SERVER_ENDPOINT = 'http://test-endpoint.com';
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it('should redirect to /email-confirmed when email verification is successful', async () => {
    // Import the component dynamically to ensure fresh mocks
    const { default: ConfirmEmailPage } = await import('../page');

    // Mock fetch to return a successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    // Call the server-side function
    await ConfirmEmailPage(mockParams);

    // Assert that redirect was called with the correct URL
    expect(redirect).toHaveBeenCalledWith('/email-confirmed');
  });

  it('should redirect to /verification-failed when email verification fails', async () => {
    // Import the component dynamically to ensure fresh mocks
    const { default: ConfirmEmailPage } = await import('../page');

    // Mock fetch to return a successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    // Call the server-side function
    await ConfirmEmailPage(mockParams);

    // Assert that redirect was called with the failure URL
    expect(redirect).toHaveBeenCalledWith('/verification-failed');
  });
});
