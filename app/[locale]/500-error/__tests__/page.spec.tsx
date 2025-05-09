import React from 'react';
import { render, screen } from '@testing-library/react';
import Custom500 from '../page';

describe('500-error', () => {
  it('renders the 500 error page correctly', () => {
    render(<Custom500 />);

    // Check for the heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('500 - Internal Server Error');

    // Check for the links
    expect(screen.getByRole('link', { name: /Go back home/i })).toHaveAttribute('href', '/');

    // Check for the admin access note
    expect(screen.getByText(/Something went wrong on our end. Please try again later./i)).toBeInTheDocument();
  });
});
