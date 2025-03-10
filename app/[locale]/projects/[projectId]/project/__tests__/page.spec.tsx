import React from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {useParams} from 'next/navigation';
import {
  useChildResearchDomainsQuery,
  useProjectQuery,
  useTopLevelResearchDomainsQuery,
  useUpdateProjectMutation
} from '@/generated/graphql';
import ProjectsProjectDetail from '../page';
import {axe, toHaveNoViolations} from 'jest-axe';
import {mockScrollIntoView, mockScrollTo} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
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

describe('ProjectsProjectDetail', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockUseProjectQuery = useProjectQuery as jest.Mock;
  const mockUseTopLevelResearchDomainsQuery = useTopLevelResearchDomainsQuery as jest.Mock;
  const mockUseChildResearchDomainsQuery = useChildResearchDomainsQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });
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
  });

  it('should render the project details form', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    render(<ProjectsProjectDetail />);

    expect(screen.getByLabelText('labels.projectName')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.projectAbstract')).toBeInTheDocument();
    expect(screen.getByText('labels.startDate')).toBeInTheDocument();
    expect(screen.getByText('labels.endDate')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.researchDomain')).toBeInTheDocument();
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

  it('should display error messages when form validation fails', async () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: null }),
      { loading: false, error: { message: 'There was an error' } },
    ]);
    render(<ProjectsProjectDetail />);
    fireEvent.change(screen.getByLabelText('labels.projectName'), { target: { value: '' } });
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
    fireEvent.change(screen.getByLabelText('labels.projectName'), { target: { value: 'Updated Project' } });
    fireEvent.submit(screen.getByRole('button', { name: /save/i }));

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

  it('should handle radio button change', () => {
    (useUpdateProjectMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    render(<ProjectsProjectDetail />);
    fireEvent.click(screen.getByLabelText('labels.realProject'));
    expect(screen.getByLabelText('labels.realProject')).toBeChecked();
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
