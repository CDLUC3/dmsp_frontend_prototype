import React from 'react';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import {
  useProjectFunderQuery,
  useUpdateProjectFunderMutation
} from '@/generated/graphql';
import ProjectsProjectFundingEdit from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  mockScrollIntoView,
  mockScrollTo
} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}));

jest.mock('@/generated/graphql', () => ({
  useProjectFunderQuery: jest.fn(),
  useUpdateProjectFunderMutation: jest.fn(),
  ProjectFunderStatus: {
    Planned: 'PLANNED',
    Denied: 'DENIED',
    Granted: 'GRANTED'
  }
}));

const mockRouter = {
  push: jest.fn(),
};


describe('ProjectsProjectFundingEdit', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockUseProjectFunderQuery = useProjectFunderQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1', projectFunderId: '1' });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseProjectFunderQuery.mockReturnValue({
      data: {
        projectFunder: {
          affiliation: {
            name: 'National Science Foundation',
          },
          funderOpportunityNumber: 'NSF-12345-ABC',
          funderProjectNumber: 'IRL-123-1234',
          grantId: 'https://example.com/awards/IRL-000000X1',
          status: 'DENIED',
        },
      },
      loading: false,
    });
  });

  it('should render the project details form', async () => {
    (useUpdateProjectFunderMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    expect(screen.getByLabelText('labels.funderName')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.funderStatus')).toBeInTheDocument();
    // Find the "denied" text within a <span> element
    const deniedSpan = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content === 'denied';
    });
    expect(deniedSpan).toBeInTheDocument();

    // Funder status select dropdown
    const hiddenContainer = screen.getByTestId('hidden-select-container');
    const selectElement = within(hiddenContainer).getByDisplayValue('denied');//default value

    const options = Array.from(selectElement.querySelectorAll('option'));
    expect(options[1]).toHaveValue('PLANNED');
    expect(options[1]).toHaveTextContent('planned');

    expect(options[2]).toHaveValue('DENIED');
    expect(options[2]).toHaveTextContent('denied');

    expect(options[3]).toHaveValue('GRANTED');
    expect(options[3]).toHaveTextContent('granted');

    expect(screen.getByText('labels.grantNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.projectNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.opportunity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.saveChanges/i })).toBeInTheDocument();
  });

  it('should display loading message when data is loading', async () => {
    (useUpdateProjectFunderMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    mockUseProjectFunderQuery.mockReturnValueOnce({ loading: true });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should update project data on form submit', async () => {
    const mockUpdateProjectFunderMutation = jest.fn().mockResolvedValue({
      data: { updateProjectFunder: { errors: null } },
    });

    // Override the mock for this specific test
    (useUpdateProjectFunderMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectFunderMutation,
      { loading: false, error: undefined },
    ]);


    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));
    expect(mockUpdateProjectFunderMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          projectFunderId: 1,
          status: 'DENIED',
          funderProjectNumber: 'IRL-123-1234',
          grantId: 'https://example.com/awards/IRL-000000X1',
          funderOpportunityNumber: 'NSF-12345-ABC',
        },
      },
    });
  });

  it('should display error messages when form submission fails', async () => {
    const mockUpdateProjectFunderMutation = jest.fn().mockResolvedValue({
      data: { updateProjectFunder: { errors: { general: 'Update failed' } } },
    });

    (useUpdateProjectFunderMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectFunderMutation,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));
    expect(await screen.findByText('Update failed')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    (useUpdateProjectFunderMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const { container } = render(
      <ProjectsProjectFundingEdit />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});