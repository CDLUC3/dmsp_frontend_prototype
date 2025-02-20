import React from 'react';
import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';

import PlanOverviewQuestionPage from "../page";


expect.extend(toHaveNoViolations);
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

// Mock the DmpEditor component
jest.mock('@/components/Editor', () => ({
  DmpEditor: () => <div data-testid="mocked-editor">Mocked Editor</div>
}));


describe('PlanOverviewQuestionPage', () => {
  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewQuestionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Placeholder for future tests
  //it.todo('should handle form submission');
  //it.todo('should handle access revocation');
});

