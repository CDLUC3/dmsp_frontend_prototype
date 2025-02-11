import React from 'react';
import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import ProjectOverviewPage from "@/app/[locale]/projects/[projectId]/page";

expect.extend(toHaveNoViolations);

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
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
