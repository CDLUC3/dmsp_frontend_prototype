import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

import {
  useProjectContributorQuery,
  useContributorRolesQuery,
  useUpdateProjectContributorMutation,
  useRemoveProjectContributorMutation
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectMembersEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockProjectContributorData from '../__mocks__/mockProjectContributorData.json';
import mockContributorRoles from '../__mocks__/mockcontributorRoles.json';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

const mockResponse = {
  updateProjectContributor: {
    givenName: "Juliet",
    surName: "Cousteau",
    orcid: "0000-JACQ-0000-0000",
    id: 1,
    errors: {
      email: null,
      surName: null,
      general: null,
      givenName: null,
      orcid: null,
      affiliationId: null,
      contributorRoleIds: null,
    },
  }
}
// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useProjectContributorQuery: jest.fn(),
  useContributorRolesQuery: jest.fn(),
  useUpdateProjectContributorMutation: jest.fn(),
  useRemoveProjectContributorMutation: jest.fn()
}));


jest.mock('@/hooks/projectContributorData', () => ({
  useProjectContributorData: () => ({
    projectContributorData: {
      givenName: 'Test',
      surName: 'User',
      affiliationId: '',
      email: 'test@example.com',
      orcid: '',
    },
    selectedRoles: [],
    checkboxRoles: [],
    setCheckboxRoles: jest.fn(),
    loading: false,
    setProjectContributorData: jest.fn(),
    setSelectedRoles: jest.fn(),
    queryError: null
  })
}));

const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  add: jest.fn(),
};


describe("ProjectsProjectMembersEdit", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, memberId: 1 });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);

    (useProjectContributorQuery as jest.Mock).mockReturnValue({
      data: mockProjectContributorData,
      loading: false,
      error: undefined,
    });

    (useContributorRolesQuery as jest.Mock).mockReturnValue({
      data: mockContributorRoles,
      loading: false,
      error: null,
    }
    );
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render correct fields", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');
    expect(screen.getByRole('link', { name: /breadcrumbs.projects/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/affiliation/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /affiliation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/orcid/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /orcid id/i })).toBeInTheDocument();
    expect(screen.getByText('form.labels.checkboxGroupLabel')).toBeInTheDocument();
    expect(screen.getByText('form.labels.checkboxGroupDescription')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.saveChanges/i })).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/projects/1/members');
    });
  });

  it("should handle form submission errors", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { updateProjectContributor: { errors: { general: 'Error updating member' } } } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText('Error updating member')).toBeInTheDocument();
  });

  it("should handle remove member", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: /Remove member from project/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/projects/1/members');
    });
  });

  it("should handle remove member errors", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);
    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { removeProjectContributor: { errors: { general: 'Error removing member' } } } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: /Remove member from project/i });
    fireEvent.click(removeButton);

    expect(await screen.findByText('Error removing member')).toBeInTheDocument();
  });

  it("should pass accessibility checks", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    await act(async () => {
      const { container } = render(
        <ProjectsProjectMembersEdit />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
