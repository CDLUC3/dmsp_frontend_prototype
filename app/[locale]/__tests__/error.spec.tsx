import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorBoundary from '../error';
expect.extend(toHaveNoViolations);

describe('ErrorBoundary', () => {
  it('should render the ErrorBoundary page with heading and button', () => {
    const myError = new Error('Test error');
    const resetMock = jest.fn(); // Mock reset function

    render(<ErrorBoundary error={myError} reset={resetMock} />);

    // Check for the heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test error');

    // Check for paragraph text
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const myError = new Error('Test error');
    const resetMock = jest.fn(); // Mock reset function

    const { container } = render(<ErrorBoundary error={myError} reset={resetMock} />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  });

  it('should call the reset function when the button is clicked', () => {
    const myError = new Error('Test error');
    const resetMock = jest.fn(); // Mock reset function

    render(<ErrorBoundary error={myError} reset={resetMock} />);

    // Simulate button click
    const button = screen.getByRole('button', { name: /Try again/i });
    button.click();

    // Assert that resetMock was called
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('should render fallback UI when no error is provided', () => {
    const resetMock = jest.fn(); // Mock reset function

    render(<ErrorBoundary error={null} reset={resetMock} />);

    // Check for fallback UI (adjust based on your implementation)
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});
