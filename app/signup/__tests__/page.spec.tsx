import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignUpPage from '../page';

describe('SignUpPage', () => {
    beforeEach(() => {
        jest.mock('next/navigation', () => {
            useRouter: jest.fn()
        })

        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url === 'http://localhost:4000/register') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ token: 'valid-token' }),
                } as unknown as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    it('should render signup form and submits successfully', async () => {
        const push = jest.fn();
        const mockRouter = { push }
        require('next/navigation').useRouter.mockReturnValue({ push: push })
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
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        });

    });

    it('should handle fetch error', async () => {
        const push = jest.fn();
        const mockRouter = { push }
        require('next/navigation').useRouter.mockReturnValue({ push: push })
        jest.spyOn(global, 'fetch').mockImplementation(url => {
            if (url === 'http://localhost:4000/register') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: () => Promise.resolve({}),
                } as unknown as Response);
            }
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

        // //Check that error logged to the console
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith("Network response was not ok");
        })
    })
})