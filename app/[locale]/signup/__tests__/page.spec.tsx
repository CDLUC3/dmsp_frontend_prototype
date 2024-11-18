import React from 'react';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/utils/test-utils'; //wrapping test with AuthProvider
import SignUpPage from '../page';
import logECS from '@/utils/clientLogger';
//Need to import this useRouter after the jest.mock is in place
import { useRouter } from 'next/navigation';
import { fetchCsrfToken, refreshAuthTokens } from "@/utils/authHelper";

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn()
}))

// Mock the entire CsrfContext module
jest.mock('@/context/CsrfContext', () => ({
    CsrfProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-csrf-provider">{children}</div>
    ),
    useCsrf: jest.fn(),
}));

jest.mock('@/utils/authHelper', () => ({
    refreshAuthTokens: jest.fn(async () => Promise.resolve({ response: true, message: 'ok', headers: { 'content-type': 'application/json', 'x-csrf-token': 1234 } })),
    fetchCsrfToken: jest.fn(async () => Promise.resolve({ response: true, message: 'ok', headers: { 'content-type': 'application/json', 'x-csrf-token': 1234 } })),
}));

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();
const mockFocus = jest.fn();

const mockUseRouter = useRouter as jest.Mock;

const mockFetchCsrfToken = fetchCsrfToken as jest.Mock;
const mockRefreshAuthTokens = refreshAuthTokens as jest.Mock;

global.fetch = global.fetch || require('node-fetch');

describe('SignUpPage', () => {

    beforeEach(() => {
        HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
        HTMLElement.prototype.focus = mockFocus;

        /*eslint-disable @typescript-eslint/no-var-requires */
        const { useCsrf } = require('@/context/CsrfContext');
        (useCsrf as jest.Mock).mockReturnValue({ csrfToken: 'mocked-csrf-token' });

        mockUseRouter.mockReturnValue({
            push: jest.fn(),
        })

        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.useFakeTimers();
    });

    afterEach(() => {
        HTMLElement.prototype.scrollIntoView = jest.fn();
        HTMLElement.prototype.focus = jest.fn();
        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.useRealTimers();
    })

    it('should render signup form and submit successfully', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/apollo-signup') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'mock message' })
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const acceptedTermsInput = screen.getByLabelText(/accept terms/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(acceptedTermsInput, { target: { value: 1 } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Filter out the fetch call with the apollo-signup URL
        const apolloSignupCall = (global.fetch as jest.Mock).mock.calls.find(call =>
            call[0].includes('/apollo-signup'));
        expect(apolloSignupCall).toBeDefined(); // Check if apollo-signup was called
        expect(apolloSignupCall[0]).toBe(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signup`);
        // Check that user is redirected to home page
        await waitFor(() => {
            expect(mockUseRouter().push).toHaveBeenCalledWith('/');
        })
    });

    it('should initially disable submit button after submitting form until response is returned ', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/apollo-signup') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const acceptedTermsInput = screen.getByLabelText(/accept terms/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(acceptedTermsInput, { target: { value: 1 } });

        //Simulate form submission
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent('Sign up');
        });
    });

    it('should handle 401 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/apollo-signup') {
                return Promise.resolve({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({ message: 'Invalid credentials' })
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });
        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const acceptedTermsInput = screen.getByLabelText(/accept terms/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(acceptedTermsInput, { target: { value: 1 } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that user is redirected to 500 error page
        await waitFor(() => {
            expect(mockRefreshAuthTokens).toHaveBeenCalled();
        })

        // Check that user is redirected to home page
        await waitFor(() => {
            expect(mockUseRouter().push).toHaveBeenCalledWith('/');
        })
    });

    it('should handle 403 error by calling fetchCsrfToken', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ success: false, message: 'Invalid CSRF token' }),
            } as unknown as Response);
        });
        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const acceptedTermsInput = screen.getByLabelText(/accept terms/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(acceptedTermsInput, { target: { value: 1 } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that user is redirected to 500 error page
        await waitFor(() => {
            expect(mockFetchCsrfToken).toHaveBeenCalled();
        })
    });

    it('should handle 500 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ success: false, message: 'Internal Server Error' }),
            } as unknown as Response);
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user inputs
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that user is redirected to 500 error page
        await waitFor(() => {
            expect(mockUseRouter().push).toHaveBeenCalledWith('/500-error')
        })
    })

    it('should render correct errors to user for a 400 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ success: false, message: 'Invalid email address| Password is required' }),
            } as unknown as Response);
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user inputs
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // //Check that error is rendered
        await waitFor(() => {
            const errorElement = screen.getByText(/Invalid email address/i);
            expect(errorElement).toBeInTheDocument();
        })
    })

    it('should render default error message when no response', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve(undefined as unknown as Response);
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user inputs
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // //Check that error logged to the console
        await waitFor(() => {
            const errorDiv = screen.getByText('An unexpected error occurred. Please try again.').closest('div');
            expect(errorDiv).toHaveClass('error');
            expect(errorDiv).toContainHTML('<p>An unexpected error occurred. Please try again.</p>')
        })
    })

    it('should handle error returned from the fetch', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithProviders(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user inputs
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that error logged
        await waitFor(() => {
            expect(logECS).toHaveBeenCalledWith(
                'error',
                'Signup error',
                expect.objectContaining({
                    error: expect.anything(),
                    url: { path: '/apollo-signup' },
                })
            )
        })
    })
})
