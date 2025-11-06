import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ApolloError } from '@apollo/client';

import {
  useChildResearchDomainsQuery,
  useProjectQuery,
  useTopLevelResearchDomainsQuery,
  useUpdateProjectMutation
} from '@/generated/graphql';
import logECS from '@/utils/clientLogger';

import ProjectsProjectDetail from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);


// At the top of your test file
const push = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('@/generated/graphql', () => ({
  useProjectQuery: jest.fn(),
  useTopLevelResearchDomainsQuery: jest.fn(),
  useUpdateProjectMutation: jest.fn(),
  useChildResearchDomainsQuery: jest.fn(),
}));

const mockChildDomains = {
  childResearchDomains: [
    { id: '1', name: 'Child Domain 1' },
    { id: '2', name: 'Child Domain 2' },
  ],
};

const mockRefetch = jest.fn();

describe('ProjectsProjectDetail', () => {
  let mockRouter;
  const mockUseParams = useParams as jest.Mock;
  const mockUseProjectQuery = useProjectQuery as jest.Mock;
  const mockUseTopLevelResearchDomainsQuery = useTopLevelResearchDomainsQuery as jest.Mock;
  const mockUseChildResearchDomainsQuery = useChildResearchDomainsQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });

    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseProjectQuery.mockReturnValue({
      data: {
        project: {
          title: 'Test Project',
          abstractText: 'Test Abstract',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          researchDomain: { id: '1' },
          isTestProject: true,
        },
      },
      loading: false,
      refetch: mockRefetch
    });
    mockUseTopLevelResearchDomainsQuery.mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: '1', name: 'Domain 1' },
          { id: '2', name: 'Domain 2' },
        ],
      },
    });
    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    mockUseChildResearchDomainsQuery.mockReturnValue({
      data: mockChildDomains,
      loading: false, error: undefined,
    });

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { fromOverview: 'true' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { fromOverview: 'true' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

  });

  it('should render the project details form', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    render(<ProjectsProjectDetail />);

    expect(screen.getByLabelText(/labels.projectName/)).toBeInTheDocument();
    expect(screen.getByLabelText(/labels.projectAbstract/)).toBeInTheDocument();
    expect(screen.getByText('labels.startDate')).toBeInTheDocument();
    expect(screen.getByText('labels.endDate')).toBeInTheDocument();
    expect(screen.getByLabelText(/labels.researchDomain/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /title/i })).toBeInTheDocument();
  });

  it('should display loading message when data is loading', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: null }),
      { loading: false, error: undefined },
    ]);
    mockUseProjectQuery.mockReturnValueOnce({ loading: true });
    render(<ProjectsProjectDetail />);
    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should display error when useProjectsQuery returns a query error', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: null }),
      { loading: false, error: undefined },
    ]);
    mockUseProjectQuery.mockReturnValueOnce({ loading: false, error: { message: 'query failed' } });
    render(<ProjectsProjectDetail />);
    expect(screen.getByText('query failed')).toBeInTheDocument();
  });


  it('should display error messages when form validation fails', async () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: null }),
      { loading: false, error: { message: 'There was an error' } },
    ]);
    render(<ProjectsProjectDetail />);
    fireEvent.change(screen.getByLabelText(/labels.projectName/), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /save/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(within(alert).getByText('messages.errors.projectName')).toBeInTheDocument();
  });

  it('should update project data on form submit', async () => {
    const mockUpdateProjectMutation = jest.fn().mockResolvedValue({
      data: { updateProject: { errors: null } },
    });

    // Override the mock for this specific test
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectMutation,
      { loading: false, error: undefined },
    ]);


    render(<ProjectsProjectDetail />);
    fireEvent.change(screen.getByLabelText(/labels.projectName/), { target: { value: 'Updated Project' } });
    await waitFor(() => {
      fireEvent.submit(screen.getByRole('button', { name: /save/i }));
    })

    // Verify that router.push was called with "/login"
    expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1');
    expect(mockUpdateProjectMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          id: 1,
          title: 'Updated Project',
          abstractText: 'Test Abstract',
          researchDomainId: 1,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          isTestProject: true,
        },
      },
    });
  });

  it('should call logECS to log error if updateProject mutation throws an error', async () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error")),
      { loading: false, error: undefined },
    ]);


    render(<ProjectsProjectDetail />);
    fireEvent.change(screen.getByLabelText(/labels.projectName/), { target: { value: 'Updated Project' } });
    fireEvent.submit(screen.getByRole('button', { name: /save/i }));

    // //Check that error logged
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateProjectMutation',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/projects/1/project' },
        })
      )
    })
    expect(screen.getByText('messages.errors.projectUpdateFailed')).toBeInTheDocument();
  });

  it('should updateProjectMutation response includes data.errors', async () => {

    const mockUpdateProjectMutation = jest.fn().mockResolvedValue({
      data: {
        updateProject: {
          errors: {
            general: "Could not update project"
          }
        }
      },
    });

    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectMutation,
      { loading: false, error: undefined },
    ]);


    render(<ProjectsProjectDetail />);

    act(() => {
      fireEvent.change(screen.getByLabelText(/labels.projectName/), { target: { value: 'Updated Project' } });
      fireEvent.submit(screen.getByRole('button', { name: /save/i }));
    })

    await waitFor(() => {
      expect(screen.getByText('Could not update project')).toBeInTheDocument();
    }
    );
  });

  it('should call refetch for useProjectsQuery if an apollo error is returned', async () => {

    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'Unauthorized',
    });

    // Make the mutation function throw the ApolloError when called
    const mockUpdateProjectMutation = jest.fn().mockRejectedValue(apolloError);

    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      mockUpdateProjectMutation,
      { loading: false, error: undefined },
    ]);


    render(<ProjectsProjectDetail />);
    fireEvent.change(screen.getByLabelText(/labels.projectName/), { target: { value: 'Updated Project' } });
    fireEvent.submit(screen.getByRole('button', { name: /save/i }));

    // Assert that refetch was called
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should handle radio button change', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    render(<ProjectsProjectDetail />);
    fireEvent.click(screen.getByLabelText('labels.realProject'));
    expect(screen.getByLabelText('labels.realProject')).toBeChecked();
  });

  it('should redirect to project search page when Search button is clicked', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    render(<ProjectsProjectDetail />);

    const searchBtn = screen.getByTestId('search-projects-button');
    fireEvent.click(searchBtn);
    expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/projects-search');
  });

  it('should pass axe accessibility test', async () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const { container } = render(
      <ProjectsProjectDetail />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
