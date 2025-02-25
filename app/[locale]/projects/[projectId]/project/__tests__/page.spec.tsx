import React from 'react';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useTranslations as OriginalUseTranslations } from 'next-intl';
import { useProjectQuery, useTopLevelResearchDomainsQuery, useUpdateProjectMutation } from '@/generated/graphql';
import ProjectsProjectDetail from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();

type UseTranslationsType = ReturnType<typeof OriginalUseTranslations>;

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: UseTranslationsType = ((key: string) => key) as UseTranslationsType;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
    };

    return mockUseTranslations;
  }),
}));

jest.mock('@/generated/graphql', () => ({
  useProjectQuery: jest.fn(),
  useTopLevelResearchDomainsQuery: jest.fn(),
  useUpdateProjectMutation: jest.fn()
}));

describe('ProjectsProjectDetail', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockUseProjectQuery = useProjectQuery as jest.Mock;
  const mockUseTopLevelResearchDomainsQuery = useTopLevelResearchDomainsQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
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