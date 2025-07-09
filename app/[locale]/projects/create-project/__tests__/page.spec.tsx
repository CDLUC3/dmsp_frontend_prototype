import React, { ReactNode } from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectsCreateProject from '../page';
import { useAddProjectMutation } from '@/generated/graphql';
import { RichTranslationValues } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Mock the GraphQL mutation
jest.mock('@/generated/graphql', () => ({
  useAddProjectMutation: jest.fn(),
}));

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

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

type MockUseTranslations = {
  (key: string, ...args: unknown[]): string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
};

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: MockUseTranslations = ((key: string) => key) as MockUseTranslations;

    mockUseTranslations.rich = (key, values) => {
      const p = values?.p;
      if (typeof p === 'function') {
        return p(key); // Can return JSX
      }
      return key; // fallback
    };

    return mockUseTranslations;
  }),
}));

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
    (useAddProjectMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should render the ProjectsCreateProject component', async () => {
    await act(async () => {
      render(
        <ProjectsCreateProject />
      );
    });

    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /pageTitle/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.projectTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/form.projectTitleHelpText/i)).toBeInTheDocument();
    expect(screen.getByText(/form.newOrExisting/i)).toBeInTheDocument();
    expect(screen.getByText(/form.radioExistingLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.radioExistingHelpText/i)).toBeInTheDocument();
    expect(screen.getByText(/form.radioNewLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.radioNewHelpText/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxHelpText/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /form.checkboxLabel/i })).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxGroupLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/form.checkboxGroupHelpText/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.continue/i })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const addProjectMutationMock = jest.fn().mockResolvedValue({
      data: {
        addProject: {
          id: 123,
          errors: [],
        },
      },
    });

    (useAddProjectMutation as jest.Mock).mockReturnValue([addProjectMutationMock]);

    await act(async () => {
      render(
        <ProjectsCreateProject />
      );
    });

    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Test Project' } });
    fireEvent.click(screen.getByLabelText('form.radioNewLabel'));
    fireEvent.click(screen.getByLabelText(/form.checkboxLabel/i));
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(addProjectMutationMock).toHaveBeenCalledWith({
        variables: {
          title: 'Test Project',
          isTestProject: true,
        },
      });
      expect(mockToast.add).toHaveBeenCalledWith('messages.success', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/projects/123/project-funding');
    });
  });

  it('should display project title field error for invalid data', async () => {
    await act(async () => {
      render(
        <ProjectsCreateProject />
      );
    });

    const continueButton = screen.getByRole('button', { name: /buttons.continue/i });
    fireEvent.click(continueButton);

    expect(screen.getByText(/messages.errors.title/i)).toBeInTheDocument();

  });

  it('should display error messages from the server', async () => {
    const addProjectMutationMock = jest.fn().mockResolvedValue({
      data: {
        addProject: {
          id: 123,
          errors: {
            title: 'Title error',
            general: 'General error',
          },
        },
      },
    });
    (useAddProjectMutation as jest.Mock).mockReturnValue([addProjectMutationMock]);

    await act(async () => {
      render(
        <ProjectsCreateProject />
      );
    });


    fireEvent.change(screen.getByLabelText(/form.projectTitle/i), { target: { value: 'Test Project' } });
    fireEvent.click(screen.getByLabelText('form.radioExistingLabel'));
    fireEvent.click(screen.getByLabelText(/form.checkboxLabel/i));
    fireEvent.click(screen.getByRole('button', { name: /buttons.continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title error/i)).toBeInTheDocument();
      expect(screen.getByText(/General error/i)).toBeInTheDocument();
    });
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <ProjectsCreateProject />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
