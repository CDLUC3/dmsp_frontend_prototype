import React from 'react';
import { renderWithAuth, screen, fireEvent, waitFor } from '@/utils/test-utils'; //wrapping test with AuthProvider
import LoginPage from '../page';
import logECS from '@/utils/clientLogger';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn()
}))

jest.mock('@/utils/authHelper', () => ({
    fetchCsrfToken: jest.fn()
}));

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();
const mockFocus = jest.fn();

//Need to import this useRouter after the jest.mock is in place
import { useRouter } from 'next/navigation';

const mockUseRouter = useRouter as jest.Mock;

import { fetchCsrfToken } from "@/utils/authHelper";
const mockFetchCsrfToken = fetchCsrfToken as jest.Mock;

// Assign fetch to global object in Node.js environment
global.fetch = global.fetch || require('node-fetch');

describe('LoginPage', () => {
    beforeEach(() => {
        HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
        HTMLElement.prototype.focus = mockFocus;
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

    it('should render login form, save token in cookie, and redirect to home page', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/apollo-signin') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'mock message' })
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        await waitFor(() => {
            //Assert that the fetch calls were made with the correct arguments
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/apollo-signin', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '',
                },
                body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
            });
        })
        // Check that user is redirected to home page
        await waitFor(() => {
            expect(mockUseRouter().push).toHaveBeenCalledWith('/');
        })
    });

    it('should initially disable submit button after submitting form until response is returned ', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/apollo-signin') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent('Login');
        });
    });

    it('should handle 401 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ success: false, message: 'Invalid credentials' }),
            } as unknown as Response);
        });
        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        await waitFor(() => {
            const errorDiv = screen.getByText('Invalid credentials').closest('div');
            expect(errorDiv).toHaveClass('error');
            expect(errorDiv).toContainHTML('<p>Invalid credentials</p>')
        })
    });

    it('should handle 403 error by calling fetchCsrfToken and displaying error on page', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ success: false, message: 'Forbidden' }),
            } as unknown as Response);
        });
        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that user is redirected to 500 error page
        await waitFor(() => {
            expect(mockFetchCsrfToken).toHaveBeenCalled();
        })
        await waitFor(() => {
            const errorDiv = screen.getByText('Forbidden').closest('div');
            expect(errorDiv).toHaveClass('error');
            expect(errorDiv).toContainHTML('<p>Forbidden</p>')
        })
    });

    it('should handle 500 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ success: false, message: 'Internal server error' }),
            } as unknown as Response);
        });
        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // Check that user is redirected to 500 error page
        await waitFor(() => {
            expect(mockUseRouter().push).toHaveBeenCalledWith('/500-error')
        })
    });

    it('should handle fetch error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(url => {
            if (url === 'http://localhost:4000/login') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: () => Promise.resolve({}),
                } as unknown as Response);
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderWithAuth(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user inputs
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        // //Check that error logged 
        await waitFor(() => {
            expect(logECS).toHaveBeenCalledWith(
                'error',
                'Signin error',
                expect.objectContaining({
                    error: expect.anything(),
                    url: { path: '/apollo-signin' },
                })
            )
        })
    })
})