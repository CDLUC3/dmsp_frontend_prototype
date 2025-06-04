import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { ApolloError } from '@apollo/client';
import {
  useProjectFundingQuery,
  useUpdateProjectFundingMutation
} from '@/generated/graphql';
import logECS from '@/utils/clientLogger';

import ProjectsProjectFundingEdit from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}));

jest.mock('@/generated/graphql', () => ({
  useProjectFundingQuery: jest.fn(),
  useUpdateProjectFundingMutation: jest.fn(),
  ProjectFundingStatus: {
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
  const mockUseProjectFundingQuery = useProjectFundingQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1', projectFundingId: '1' });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseProjectFundingQuery.mockReturnValue({
      data: {
        projectFunding: {
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
      refetch: jest.fn()
    });
  });

  it('should render the project details form', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    expect(screen.getByLabelText('labels.funderName')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.fundingStatus')).toBeInTheDocument();
    // Find the "denied" text within a <span> element
    const deniedSpan = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content === 'denied';
    });
    expect(deniedSpan).toBeInTheDocument();

    // Funding status select dropdown
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

  it('should update the funderName field when the user types in the input', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const funderNameInput = screen.getByLabelText('labels.funderName');
    fireEvent.change(funderNameInput, { target: { value: 'New-funderName-123' } });

    expect(funderNameInput).toHaveValue('New-funderName-123');
  });

  it('should update the fundingStatus field when the user selects a new option', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const fundingStatusSelect = screen.getByLabelText('labels.fundingStatus');
    fireEvent.change(fundingStatusSelect, { target: { value: 'GRANTED' } });

    expect(fundingStatusSelect).toHaveValue('GRANTED');
  });

  it('should update the grantNumber field when the user types in the input', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const grantNumberInput = screen.getByLabelText('labels.grantNumber');
    fireEvent.change(grantNumberInput, { target: { value: 'New-grantNumber-123' } });

    expect(grantNumberInput).toHaveValue('New-grantNumber-123');
  });

  it('should update the projectNumber field when the user types in the input', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const projectNumberInput = screen.getByLabelText('labels.projectNumber');
    fireEvent.change(projectNumberInput, { target: { value: 'New-projectNumber-123' } });

    expect(projectNumberInput).toHaveValue('New-projectNumber-123');
  });


  it('should update the opportunityNumber field when the user types in the input', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const opportunityInput = screen.getByLabelText('labels.opportunity');
    fireEvent.change(opportunityInput, { target: { value: 'New-opportunity-123' } });

    expect(opportunityInput).toHaveValue('New-opportunity-123');
  });

  it('should display loading message when data is loading', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    mockUseProjectFundingQuery.mockReturnValueOnce({ loading: true });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should update project data on form submit', async () => {
    const mockUpdateProjectFundingMutation = jest.fn().mockResolvedValue({
      data: { updateProjectFunding: { errors: null } },
    });

    // Override the mock for this specific test
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectFundingMutation,
      { loading: false, error: undefined },
    ]);


    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));
    expect(mockUpdateProjectFundingMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          projectFundingId: 1,
          status: 'DENIED',
          funderProjectNumber: 'IRL-123-1234',
          grantId: 'https://example.com/awards/IRL-000000X1',
          funderOpportunityNumber: 'NSF-12345-ABC',
        },
      },
    });
  });

  it('should display error messages when mutation throws an error', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error")),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));
    expect(await screen.findByText('messages.errors.projectFundingUpdateFailed')).toBeInTheDocument();
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateProjectFundingMutation',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/projects/[projectId]/fundings/[projectFundingId]/edit' },
        })
      );
    });
  });

  it('should display error messages when form submission fails', async () => {
    const mockUpdateProjectFundingMutation = jest.fn().mockResolvedValue({
      data: { updateProjectFunding: { errors: { general: 'Update failed' } } },
    });

    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectFundingMutation,
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

  it('should call refetch when the mutation returns an error that is an instance of Apollo Error', async () => {
    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'unauthorized',
    });

    const mockRefetch = jest.fn(); // Mock the refetch function

    mockUseProjectFundingQuery.mockReturnValue({
      data: {
        projectFunding: {
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
      refetch: mockRefetch, // Use the mocked refetch function
    });

    const mockUpdateUserFunding = jest.fn().mockRejectedValue(apolloError);

    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      mockUpdateUserFunding,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    // Assert that refetch was called
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should pass axe accessibility test', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
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
