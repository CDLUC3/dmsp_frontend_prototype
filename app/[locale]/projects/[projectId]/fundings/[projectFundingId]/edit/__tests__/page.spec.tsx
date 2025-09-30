import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { ApolloError } from '@apollo/client';
import {
  useProjectFundingQuery,
  useUpdateProjectFundingMutation
} from '@/generated/graphql';
import {
  removeProjectFundingAction
} from '../actions';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';

import ProjectsProjectFundingEdit from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('../actions/index', () => ({
  removeProjectFundingAction: jest.fn(),
}));

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

const mockToast = {
  add: jest.fn(),
};


describe('ProjectsProjectFundingEdit', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockUseProjectFundingQuery = useProjectFundingQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1', projectFundingId: '1' });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);
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
    expect(screen.getByLabelText(/labels.fundingStatus/)).toBeInTheDocument();
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
    expect(screen.getByLabelText(/labels.projectNumber/)).toBeInTheDocument();
    expect(screen.getByLabelText(/labels.opportunity/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.saveChanges/i })).toBeInTheDocument();

    // breadcrumbs
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectOverview')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectFunding')).toBeInTheDocument();
  });

  it('should display error if the initial ProjectFundingsQuery returns an error', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    mockUseProjectFundingQuery.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'There was an error getting the funders.' }
    });

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    expect(screen.getByText('There was an error getting the funders.')).toBeInTheDocument();
  })

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

    const fundingStatusSelect = screen.getByLabelText(/labels.fundingStatus/);
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

    const grantNumberInput = screen.getByLabelText(/labels.grantNumber/);
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

    const projectNumberInput = screen.getByLabelText(/labels.projectNumber/);
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

    const opportunityInput = screen.getByLabelText(/labels.opportunity/);
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

  it('should not allow editing of the funderName input field', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const input = screen.getByLabelText(/labels.funderName/);
    expect(input).toBeDisabled();
  });

  it('should redirect user to the Add Funder page when they click the \'Add another\' button', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const addAnotherBtn = screen.getByRole('button', { name: 'buttons.addAnother' });
    fireEvent.click(addAnotherBtn);
    // Verify that router.push was called with "/en-US/projects/1/fundings/add"
    expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/fundings/add');
  });

  it('should call removeProjectFunding and redirect user when the \'Remove funder\' button is clicked', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (removeProjectFundingAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          status: null,
          affiliationId: null,
          funderOpportunityNumber: null,
          funderProjectNumber: null,
          grantId: null,
          projectId: null
        },
        id: 1
      },
    });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const removeAnotherBtn = screen.getByRole('button', { name: 'buttons.removeFunder' });
    fireEvent.click(removeAnotherBtn);
    await waitFor(() => {
      expect(removeProjectFundingAction).toHaveBeenCalledWith({
        projectFundingId: expect.any(Number),
      });
      expect(mockToast.add).toHaveBeenCalledWith('messages.success.removedFunding', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/fundings');
    });
  });

  it('should redirect user if the call to removeProjectFundingAction returns a redirect url', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (removeProjectFundingAction as jest.Mock).mockResolvedValue({
      success: true,
      redirect: "/login",
      data: {
        errors: {
          general: null,
          status: null,
          affiliationId: null,
          funderOpportunityNumber: null,
          funderProjectNumber: null,
          grantId: null,
          projectId: null
        },
        id: 1
      },
    });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const removeAnotherBtn = screen.getByRole('button', { name: 'buttons.removeFunder' });
    fireEvent.click(removeAnotherBtn);
    await waitFor(() => {
      expect(removeProjectFundingAction).toHaveBeenCalledWith({
        projectFundingId: expect.any(Number),
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('should display error message if removeProjectFundingAction returns errors', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (removeProjectFundingAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ["There was a problem"]
    });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const removeAnotherBtn = screen.getByRole('button', { name: 'buttons.removeFunder' });
    fireEvent.click(removeAnotherBtn);
    await waitFor(() => {
      expect(removeProjectFundingAction).toHaveBeenCalledWith({
        projectFundingId: expect.any(Number),
      });
      expect(screen.getByText("There was a problem")).toBeInTheDocument();
    });
  });

  it('should display error message if removeProjectFundingAction returns field-level errors', async () => {
    (useUpdateProjectFundingMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (removeProjectFundingAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: "There was a general error",
          status: null,
          affiliationId: null,
          funderOpportunityNumber: null,
          funderProjectNumber: null,
          grantId: null,
          projectId: null
        },
        id: 1
      },
    });
    await act(async () => {
      render(
        <ProjectsProjectFundingEdit />
      );
    });

    const removeAnotherBtn = screen.getByRole('button', { name: 'buttons.removeFunder' });
    fireEvent.click(removeAnotherBtn);
    await waitFor(() => {
      expect(removeProjectFundingAction).toHaveBeenCalledWith({
        projectFundingId: expect.any(Number),
      });
      expect(screen.getByText("There was a general error")).toBeInTheDocument();
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
