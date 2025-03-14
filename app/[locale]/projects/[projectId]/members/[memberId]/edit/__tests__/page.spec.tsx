import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';

import {
  useProjectContributorQuery,
  useContributorRolesQuery,
  useUpdateProjectContributorMutation,
  useRemoveProjectContributorMutation
} from '@/generated/graphql';
import { useProjectContributorData } from '@/hooks/projectContributorData';

import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectMembersEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockProjectContributorData from '../__mocks__/mockProjectContributorData.json';
import mockContributorRoles from '../__mocks__/mockcontributorRoles.json';
import mockResponse from '../__mocks__/mockResponseFromMutation.json';

expect.extend(toHaveNoViolations);

// Mock the graphql hooks
jest.mock("@/generated/graphql", () => ({
  useProjectContributorQuery: jest.fn(),
  useContributorRolesQuery: jest.fn(),
  useUpdateProjectContributorMutation: jest.fn(),
  useRemoveProjectContributorMutation: jest.fn()
}));

jest.mock('@/hooks/projectContributorData', () => ({
  useProjectContributorData: jest.fn()
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
    });

    (useProjectContributorData as jest.Mock).mockReturnValue({
      projectContributorData: {
        givenName: 'Test',
        surName: 'User',
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: jest.fn(),
      loading: false,
      setProjectContributorData: jest.fn(),
      data: {
        projectContributor: {
          givenName: 'Test',
          surName: 'User',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          contributorRoles: [
            { id: '1', __typename: 'ContributorRole' },
            { id: '2', __typename: 'ContributorRole' }
          ]
        }
      },
      queryError: null
    });
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', async () => {
    (useContributorRolesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

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

    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    (useContributorRolesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: true,
    });

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

    expect(screen.getByText('messaging.error')).toBeInTheDocument();
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
    expect(screen.getByLabelText(/form.labels.firstName/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /firstName/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.labels.lastName/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /lastName/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.labels.affiliation/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /affiliation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.labels.emailAddress/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form.labels.orcid/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /orcid/i })).toBeInTheDocument();
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
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/members');
    });
  });

  it("should handle field level errors from submitting form", async () => {
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

  it("should handle update member request errors", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error removing member")),
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
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateProjectContributor',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/1/members/1/edit' },
        })
      );
    });
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

    const removeButton = screen.getByRole('button', { name: /form.labels.removeMemberFromProject/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/members');
    });
  });

  it("should handle field-level errors from remove member request", async () => {
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

    const removeButton = screen.getByRole('button', { name: /form.labels.removeMemberFromProject/i });
    fireEvent.click(removeButton);

    expect(await screen.findByText('Error removing member')).toBeInTheDocument();
  });

  it("should handle remove member request errors", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);
    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error removing member")),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: /form.labels.removeMemberFromProject/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'removeProjectContributor',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/1/members/1/edit' },
        })
      );
    });
  });

  it("should handle checkbox change", async () => {
    (useUpdateProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const setCheckboxRolesMock = jest.fn();

    // Override the mock implementation for this specific test
    (useProjectContributorData as jest.Mock).mockReturnValue({
      projectContributorData: {
        givenName: 'Test',
        surName: 'User',
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: setCheckboxRolesMock,
      loading: false,
      setProjectContributorData: jest.fn(),
      data: {
        projectContributor: {
          givenName: 'Test',
          surName: 'User',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          contributorRoles: [
            { id: '1', __typename: 'ContributorRole' },
            { id: '2', __typename: 'ContributorRole' }
          ]
        }
      },
      queryError: null
    });

    render(<ProjectsProjectMembersEdit />); // Ensure the component is rendered first

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });

    expect(setCheckboxRolesMock).toHaveBeenCalled();
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
