import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  MeDocument,
  PlanFeedbackStatusDocument,
  RequestFeedbackDocument,
} from '@/generated/graphql';

import ProjectsProjectPlanFeedback from '../page';
import { mockScrollIntoView, mockScrollTo } from '@/__mocks__/common';

expect.extend(toHaveNoViolations);

// Mock Apollo Client
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockUseQuery = jest.mocked(useQuery);
const mockUseMutation = jest.mocked(useMutation);

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    projectId: 'test-project-id',
    dmpid: '1',
  })),
}));

// Mock PageHeader
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

// Mock ExpandableContentSection
jest.mock('@/components/ExpandableContentSection', () => ({
  __esModule: true,
  default: ({ children, heading }: { children: React.ReactNode; heading: string }) => (
    <div data-testid="expandable-section">
      <h3>{heading}</h3>
      {children}
    </div>
  ),
}));

// Mock Loading
jest.mock('@/components/Loading', () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => <div data-testid="loading">{message}</div>,
}));

// Mock SanitizeHTML
jest.mock('@/utils/sanitize', () => ({
  SanitizeHTML: ({ html }: { html: string }) => (
    <div data-testid="sanitize-html" dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));

// Mock routePath
jest.mock('@/utils/routes', () => ({
  routePath: jest.fn((route, params) => `/${route}/${params?.projectId || ''}/${params?.dmpId || ''}`),
}));

// Mock logECS
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useToast
const mockToastAdd = jest.fn();
jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({ add: mockToastAdd }),
}));

// Shared mock data
const mockMeData = {
  me: {
    __typename: 'User',
    id: 2,
    givenName: 'Test',
    surName: 'Admin',
    languageId: 'en-US',
    role: 'ADMIN',
    emails: [
      {
        __typename: 'UserEmail',
        id: 2,
        email: 'admin@example.com',
        isPrimary: true,
        isConfirmed: true,
      },
    ],
    errors: {
      __typename: 'UserErrors',
      general: null,
      email: null,
      password: null,
      role: null,
    },
    affiliation: {
      __typename: 'Affiliation',
      id: 1,
      name: 'California Digital Library',
      displayName: 'California Digital Library (cdlib.org)',
      feedbackEmails: ['uc3@cdlib.org'],
      feedbackEnabled: false,
      feedbackMessage: '<p>Dear Test,</p><p>Your plan has been sent for feedback.</p>',
    },
  },
};

const mockRequestFeedbackMutation = jest.fn();

const setupMocks = ({
  feedbackStatus = 'NONE',
  meLoading = false,
  feedbackLoading = false,
  meError = undefined,
  feedbackError = undefined,
}: {
  feedbackStatus?: string;
  meLoading?: boolean;
  feedbackLoading?: boolean;
  meError?: { message: string };
  feedbackError?: { message: string };
} = {}) => {
  const meQueryReturn = {
    data: meLoading ? null : { me: mockMeData.me },
    loading: meLoading,
    error: meError,
  };

  const feedbackQueryReturn = {
    data: feedbackLoading ? null : { planFeedbackStatus: feedbackStatus },
    loading: feedbackLoading,
    error: feedbackError,
    refetch: jest.fn().mockResolvedValue({
      data: { planFeedbackStatus: 'REQUESTED' },
    }),
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === MeDocument) {
      return meQueryReturn as ReturnType<typeof useQuery>;
    }
    if (document === PlanFeedbackStatusDocument) {
      return feedbackQueryReturn as any;
    }
    return { data: null, loading: false, error: undefined } as ReturnType<typeof useQuery>;
  });

  mockUseMutation.mockImplementation((document) => {
    if (document === RequestFeedbackDocument) {
      return [mockRequestFeedbackMutation, { loading: false }] as any;
    }
    return [jest.fn(), { loading: false }] as any;
  });
};

describe('ProjectsProjectPlanFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
  });

  it('should show loading state while queries are in flight', () => {
    setupMocks({ meLoading: true });
    render(<ProjectsProjectPlanFeedback />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should render the page after data loads', () => {
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'form.label' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'form.submitButton' })).toBeInTheDocument();
  });

  it('should display user greeting and affiliation feedback message', () => {
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.getByText('Hello Test')).toBeInTheDocument();
    expect(screen.getByTestId('sanitize-html')).toBeInTheDocument();
  });

  it('should hide form and show success message when feedback already requested', () => {
    setupMocks({ feedbackStatus: 'REQUESTED' });
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.queryByRole('textbox', { name: 'form.label' })).not.toBeInTheDocument();
    expect(screen.getByText('form.successMessage')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'form.submitButton' })).toBeDisabled();
  });

  it('should successfully submit feedback and show success message', async () => {
    mockRequestFeedbackMutation.mockResolvedValue({
      data: {
        requestFeedback: {
          id: 2,
          completed: null,
          completedBy: null,
          messageToOrg: 'Test feedback message',
          feedbackComments: [],
          errors: {
            __typename: 'PlanFeedbackErrors',
            feedbackComments: null,
            general: null,
            planId: null,
          },
        },
      },
    });

    render(<ProjectsProjectPlanFeedback />);

    const textarea = screen.getByRole('textbox', { name: 'form.label' });
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });

    fireEvent.click(screen.getByRole('button', { name: 'form.submitButton' }));

    await waitFor(() => {
      expect(mockRequestFeedbackMutation).toHaveBeenCalledWith({
        variables: {
          planId: 1,
          messageToOrg: 'Test feedback message',
        },
      });
      expect(mockToastAdd).toHaveBeenCalledWith(
        'messages.success.feedbackRequested',
        { type: 'success' }
      );
    });
  });

  it('should display error messages when mutation returns errors', async () => {
    mockRequestFeedbackMutation.mockResolvedValue({
      data: {
        requestFeedback: {
          id: null,
          completed: null,
          completedBy: null,
          messageToOrg: null,
          feedbackComments: [],
          errors: {
            __typename: 'PlanFeedbackErrors',
            feedbackComments: null,
            general: 'Something went wrong',
            planId: null,
          },
        },
      },
    });

    render(<ProjectsProjectPlanFeedback />);

    const textarea = screen.getByRole('textbox', { name: 'form.label' });
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });

    fireEvent.click(screen.getByRole('button', { name: 'form.submitButton' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should display error message when mutation throws a network error', async () => {
    mockRequestFeedbackMutation.mockRejectedValue(new Error('Network error'));

    render(<ProjectsProjectPlanFeedback />);

    const textarea = screen.getByRole('textbox', { name: 'form.label' });
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });

    fireEvent.click(screen.getByRole('button', { name: 'form.submitButton' }));

    await waitFor(() => {
      expect(screen.getByText('messaging.somethingWentWrong')).toBeInTheDocument();
    });
  });

  it('should display error message when meQuery fails', () => {
    setupMocks({ meError: { message: 'Failed to load user data' } });
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
  });

  it('should display error message when feedbackQuery fails', () => {
    setupMocks({ feedbackError: { message: 'Failed to load feedback status' } });
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.getByText('Failed to load feedback status')).toBeInTheDocument();
  });

  it('should display sidebar content', () => {
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.getByText('sidebar.universitySupport.title')).toBeInTheDocument();
    expect(screen.getByText('sidebar.teamMembers.title')).toBeInTheDocument();
  });

  it('should display team feedback section', () => {
    render(<ProjectsProjectPlanFeedback />);

    expect(screen.getByText('teamFeedback.title')).toBeInTheDocument();
    expect(screen.getByText('teamFeedback.description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'teamFeedback.updateAccessButton' })).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanFeedback />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});