import React from 'react';
import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import ProjectOverviewPage from '../page';


expect.extend(toHaveNoViolations);
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));



describe('ProjectOverviewPage', () => {
  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Placeholder for future tests
  it.todo('should handle form submission');
  it.todo('should handle access revocation');
});

