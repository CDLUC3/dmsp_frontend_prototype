import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  it('renders the Home page with heading and links', () => {
    render(<Home />);

    // Check for the heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Page');

    // Check for the links
    expect(screen.getByRole('link', { name: /Create Template/i })).toHaveAttribute('href', '/template');
    expect(screen.getByRole('link', { name: /Create Project/i })).toHaveAttribute('href', '/projects');

    // Check for the admin access note
    expect(screen.getByText(/Must be Admin to access/i)).toBeInTheDocument();
  });
});
