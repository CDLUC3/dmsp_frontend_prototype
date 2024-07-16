import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '../page';
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

describe('SignUpPage', () => {

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

    it('should render signup form and submit successfully', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/signup') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ token: 'valid-token', success: true }),
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });
        render(<SignUpPage />);

        //Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        //Simulate user input
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        //Simulate form submission
        fireEvent.click(submitButton);

        //Wait for the async fetch calls to be made
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

        //Assert that the fetch calls were made with the correct arguments
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        });
        expect(mockUseRouter().push).toHaveBeenCalledWith('/')

    });

    it('should message user with lockout time period when user makes over 5 attempts to signup', async () => {
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/signup`) {
                return Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({ message: 'Invalid email or password' }),
                } as unknown as Response);
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        render(<SignUpPage />);

        // Find input fields and button in screen
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        // Simulate user input
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

        await waitFor(() => {
            expect(screen.queryByText(/Too many attempts. Please try again later in 15 minutes./i)).not.toBeInTheDocument();
            expect(submitButton).not.toBeDisabled();
        });

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


    it('should handle 500 error', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ success: false, message: 'Internal Server Error' }),
            } as unknown as Response);
        });

        render(<SignUpPage />);

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
            expect(mockUseRouter().push).toHaveBeenCalledWith('/500')
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

        render(<SignUpPage />);

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
            const errorDiv = screen.getByText('Invalid email address').closest('div');
            expect(errorDiv).toHaveClass('error');
            expect(errorDiv).toContainHTML('<p>Invalid email address</p><p>Password is required')
        })
    })

    it('should render default error message when no response', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            return Promise.resolve({
                json: () => Promise.resolve({}),
            } as unknown as Response);
        });

        render(<SignUpPage />);

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

        render(<SignUpPage />);

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
                    url: { path: '/signup' },
                })
            )
        })
    })
})