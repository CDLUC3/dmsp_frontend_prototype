import React from 'react';
import {render, screen} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import TemplateAccessPage from '../page';

expect.extend(toHaveNoViolations);

// Simple mock - we don't care about testing PageHeader here
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

describe('TemplateAccessPage', () => {
  it('renders the main content', () => {
    render(<TemplateAccessPage />);
    // Check for something unique to this page
    expect(screen.getByText('Share this template with people outside NSF')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateAccessPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Placeholder for future
  it.todo('should handle form submission');
  it.todo('should handle access revocation');
});
