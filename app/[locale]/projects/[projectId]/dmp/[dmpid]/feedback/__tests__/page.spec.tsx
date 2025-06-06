import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import ProjectsProjectPlanFeedback from "../page";


expect.extend(toHaveNoViolations);
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));


describe('PlanOverviewQuestionPage', () => {
  it('should call handleRevoke when the revoke button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    render(<ProjectsProjectPlanFeedback />);

    const revokeButton = screen.getByRole('button', { name: /Revoke access for Frederick Cook/i });
    fireEvent.click(revokeButton);

    expect(consoleSpy).toHaveBeenCalledWith('Revoking access for member: member-001');
    consoleSpy.mockRestore();
  });

  it('should call handleDeleteInvite when the delete invite button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    render(<ProjectsProjectPlanFeedback />);

    const deleteInviteButton = screen.getByRole('button', { name: /Delete invite for Vinjalmur Stefansson/i });
    fireEvent.click(deleteInviteButton);

    expect(consoleSpy).toHaveBeenCalledWith('Deleting invite for member: member-005');
    consoleSpy.mockRestore();
  });

  it('should call handleResend when the resend invite button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    render(<ProjectsProjectPlanFeedback />);

    const resendButton = screen.getByRole('button', { name: /Resend invite for Vinjalmur Stefansson/i });
    fireEvent.click(resendButton);

    expect(consoleSpy).toHaveBeenCalledWith('Resending invite for member: member-005');
    consoleSpy.mockRestore();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanFeedback />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

