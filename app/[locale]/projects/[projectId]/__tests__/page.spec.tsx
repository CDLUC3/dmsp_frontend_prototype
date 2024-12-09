/*
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectOverviewPage from '../page';
import { NextIntlClientProvider } from 'next-intl';
import * as messages from '/messages/en-US/en-US.json'; // Adjusted path to root


expect.extend(toHaveNoViolations);

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en-US" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
};

describe('ProjectOverviewPage', () => {
  it('should pass accessibility tests', async () => {
    const { container } = renderWithIntl(<ProjectOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Placeholder for future tests
  it.todo('should handle form submission');
  it.todo('should handle access revocation');
});
*/
