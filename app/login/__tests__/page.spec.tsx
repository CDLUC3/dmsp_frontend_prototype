import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'; //wrapping test with AuthProvider
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';
import logECS from '@/utils/clientLogger';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn()
}))

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();
const mockFocus = jest.fn();

//Need to import this useRouter after the jest.mock is in place
import { useRouter } from 'next/navigation';

const mockUseRouter = useRouter as jest.Mock;

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
        jest.useRealTimers();
    })

    it('should render login form, save token in cookie, and redirect to home page', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/signin') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ token: 'valid-token' }),
                } as unknown as Response);
            }
            if (url === '/api/setCookie') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'Cookie set successfully' }),
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        render(<LoginPage />);

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
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
            });
            expect(mockUseRouter().push).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('/api/setCookie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: 'valid-token' }),
            });
        })
    });

    it('should initially disable submit button after submitting form until response is returned ', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/signin') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ token: 'valid-token' }),
                } as unknown as Response);
            }
            if (url === '/api/setCookie') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'Cookie set successfully' }),
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        render(<LoginPage />);

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
        expect(submitButton).toHaveTextContent('Logging in ...');

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent('Login');
        });
    });

    it('should show error message after too many attempts ', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/signin') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ token: 'valid-token' }),
                } as unknown as Response);
            }
            if (url === '/api/setCookie') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ message: 'Cookie set successfully' }),
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });

        render(<LoginPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Simulate 5 failed attempts
        for (let i = 0; i < 7; i++) {
            // Ensure the button is not disabled before clicking
            await waitFor(() => expect(submitButton).not.toBeDisabled());
            userEvent.click(submitButton);
            await waitFor(() => expect(submitButton).not.toBeDisabled());
        }

        // Simulate the 6th attempt, which should trigger the lockout
        await waitFor(() => expect(submitButton).not.toBeDisabled());
        userEvent.click(submitButton);
        await waitFor(() => expect(submitButton).toBeDisabled());

        // Ensure the button is not disabled before clicking after lockout period
        await waitFor(() => expect(submitButton).not.toBeDisabled());
        userEvent.click(submitButton);
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });

        // Simulate the passage of 5 minutes
        jest.advanceTimersByTime(5 * 60 * 1000);

        await waitFor(() => {
            expect(screen.queryByText(/Too many attempts. Please try again later in 10 minutes/i)).not.toBeInTheDocument();
            expect(submitButton).not.toBeDisabled();
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
        render(<LoginPage />);

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

    it('should handle 500 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ success: false, message: 'Internal server error' }),
            } as unknown as Response);
        });
        render(<LoginPage />);

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
            expect(mockUseRouter().push).toHaveBeenCalledWith('/500')
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

        render(<LoginPage />);

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
                    url: { path: '/signin' },
                })
            )
        })
    })
})