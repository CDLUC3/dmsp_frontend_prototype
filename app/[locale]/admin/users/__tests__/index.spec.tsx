import React from 'react';

import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import OrgUserAccountsPage from '../page';


expect.extend(toHaveNoViolations);


jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));


describe("Admin - User Accounts Dashboard", () => {

  it("should render the page", async () => {
    render(
      <OrgUserAccountsPage />
    );

    expect(screen.getByText('tools.searchLabel')).toBeInTheDocument();
    expect(screen.getByText('tools.permissionLabel')).toBeInTheDocument();
    expect(screen.getByText('buttons.searchLabel')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
      <OrgUserAccountsPage />
    );

    await waitFor(() => {
      expect(screen.getByText('tools.searchLabel')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
