import React from 'react';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AddProjectDocument } from '@/generated/graphql';
import ProjectsCreateProject from '../page';


expect.extend(toHaveNoViolations);


const mocks = [
  {
    request: {
      query: AddProjectDocument,
      variables: {
        title: "Test Project",
        isTestProject: true,
      },
    },

    result: {
      data: {
        addProject: {
          id: 123,
          errors: [],
        },
      }
    },
  },

  // Project that is not a test
  {
    request: {
      query: AddProjectDocument,
      variables: {
        title: "Non-Test Project",
        isTestProject: false,
      },
    },

    result: {
      data: {
        addProject: {
          id: 123,
          errors: [],
        },
      }
    },
  },

  // This is to create the error result
  {
    request: {
      query: AddProjectDocument,
      variables: {
        title: "Field Errors",
        isTestProject: false,
      },
    },

    result: {
      data: {
        addProject: {
          id: 123,
          errors: {
            title: 'Title error',
            general: '',
          },
        },
      },
    },
  },

  {
    request: {
      query: AddProjectDocument,
      variables: {
        title: "General Error",
        isTestProject: false,
      },
    },

    result: {
      data: {
        addProject: {
          id: 123,
          errors: {
            title: 'Title error',
            general: 'General error',
          },
        },
      },
    },
  },

  // Mocked Server error for addProjectFunding
  {
    request: {
      query: AddProjectDocument,
      variables: {
        title: "Server Error",
        isTestProject: true,
      },
    },

    error: new Error('Server Error'),
  },
];


// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));


// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();


const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  add: jest.fn(),
};

describe('ProjectsCreateProject', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should render the ProjectsCreateProject component', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /pageTitle/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.projectTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/form.projectTitleHelpText/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxHelpText/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: "isThisMockProject" })).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxGroupLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxGroupHelpText/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.continue/i })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Test Project' } });
    fireEvent.click(screen.getByLabelText(/form.checkboxLabel/i));
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('messages.success', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/123/funding-search');
    });
  });

  it('should handle valid non-test project', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Non-Test Project' } });
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('messages.success', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/123/funding-search');
    });
  });

  it('should handle showing field-level error when there is no title', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: '' } });
    fireEvent.click(screen.getByLabelText(/form.checkboxLabel/i));
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      const fieldWrapper = screen.getByTestId('field-wrapper');
      expect(within(fieldWrapper).getByText('messages.errors.titleLength')).toBeInTheDocument();
    });
  });

  it('should display field error messages', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Field Errors' } });
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title error/i)).toBeInTheDocument();
      expect(screen.getByText('messages.errors.createProjectError')).toBeInTheDocument();
    });
  });

  it('should display general error message instead of default', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'General Error' } });
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title error/i)).toBeInTheDocument();
      expect(screen.getByText(/General error/i)).toBeInTheDocument();
    });
  });

  it('should catch general server exceptions', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsCreateProject />
        </MockedProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Server Error' } });
    fireEvent.click(screen.getByLabelText(/form.checkboxLabel/i));
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(screen.getByText('messages.errors.createProjectError')).toBeInTheDocument();
    });
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsCreateProject />
      </MockedProvider>
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
