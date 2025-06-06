import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '../page';
expect.extend(toHaveNoViolations);


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

  it('should pass axe accessibility test', async () => {
    const { container } = render(<Home />)
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});
