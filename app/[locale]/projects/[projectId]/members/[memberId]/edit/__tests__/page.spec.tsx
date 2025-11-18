import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from '@/utils/test-utils';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';

import {
  useProjectMemberQuery,
  useMemberRolesQuery,
  useUpdateProjectMemberMutation,
  useRemoveProjectMemberMutation
} from '@/generated/graphql';
import { useProjectMemberData } from '@/hooks/projectMemberData';

import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectMembersEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockProjectMemberData from '../__mocks__/mockProjectMemberData.json';
import mockMemberRoles from '../__mocks__/mockMemberRoles.json';
import mockResponse from '../__mocks__/mockResponseFromMutation.json';

expect.extend(toHaveNoViolations);

// Mock the graphql hooks
jest.mock("@/generated/graphql", () => ({
  useProjectMemberQuery: jest.fn(),
  useMemberRolesQuery: jest.fn(),
  useUpdateProjectMemberMutation: jest.fn(),
  useRemoveProjectMemberMutation: jest.fn(),
}));

jest.mock('@/hooks/projectMemberData', () => ({
  useProjectMemberData: jest.fn()
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

    (useProjectMemberQuery as jest.Mock).mockReturnValue({
      data: mockProjectMemberData,
      loading: false,
      error: undefined,
    });

    (useMemberRolesQuery as jest.Mock).mockReturnValue({
      data: mockMemberRoles,
      loading: false,
      error: null,
    });

    (useProjectMemberData as jest.Mock).mockReturnValue({
      projectMemberData: {
        givenName: 'Test',
        surName: 'User',
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: jest.fn(),
      loading: false,
      setProjectMemberData: jest.fn(),
      data: {
        projectMember: {
          givenName: 'Test',
          surName: 'User',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          memberRoles: [
            { id: '1', __typename: 'MemberRole' },
            { id: '2', __typename: 'MemberRole' }
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
    (useMemberRolesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
    (useMemberRolesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: true,
    });

    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
    expect(screen.getByRole('button', { name: /buttons.saveChanges/i })).toBeInTheDocument();

    // Check for checkbox group
    const checkboxGroup = screen.getByTestId('checkbox-group');
    expect(checkboxGroup).toBeInTheDocument();
    expect(screen.getByText('labels.definedRole')).toBeInTheDocument();
    expect(screen.getByText('memberRolesDescription')).toBeInTheDocument();
    expect(within(checkboxGroup).getByText('Principal Investigator (PI)')).toBeInTheDocument();
    expect(within(checkboxGroup).getByText('Project Administrator')).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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

  it("should display validation errors if givenName and surName are too short", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useProjectMemberData as jest.Mock).mockReturnValue({
      projectMemberData: {
        givenName: 'T',
        surName: 'U',
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: jest.fn(),
      loading: false,
      setProjectMemberData: jest.fn(),
      data: {
        projectMember: {
          givenName: 'T',
          surName: 'U',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          memberRoles: [
            { id: '1', __typename: 'MemberRole' },
            { id: '2', __typename: 'MemberRole' }
          ]
        }
      },
      queryError: null
    });

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('form.errors.firstName')).toBeInTheDocument();
      expect(screen.getByText('form.errors.lastName')).toBeInTheDocument();
    });
  });

  it("should display real-time email validation error without form submission", async () => {
    const setProjectMemberDataMock = jest.fn();

    (useProjectMemberData as jest.Mock).mockReturnValue({
      projectMemberData: {
        givenName: 'Valid First Name',
        surName: 'Valid Last Name',
        affiliationId: 'test-affiliation',
        email: 'invalid-email-format', // Invalid email format
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: jest.fn(),
      loading: false,
      setProjectMemberData: setProjectMemberDataMock,
      data: {
        projectMember: {
          givenName: 'Valid First Name',
          surName: 'Valid Last Name',
          affiliation: { uri: 'test-affiliation' },
          email: 'invalid-email-format',
          orcid: '0000-0000-0000-0000',
          memberRoles: [
            { id: '1', __typename: 'MemberRole' },
            { id: '2', __typename: 'MemberRole' }
          ]
        }
      },
      queryError: null
    });

    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<ProjectsProjectMembersEdit />);
    });

    // The email field should show as invalid due to real-time validation
    // This happens immediately on render, without needing form submission
    const emailInput = screen.getByLabelText('form.labels.emailAddress');

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // The error message should also be displayed
    expect(screen.getByText('form.errors.email')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('form.errors.email')).toBeInTheDocument();

  });

  it("should clear validation errors when user corrects the field values", async () => {
    const setProjectMemberDataMock = jest.fn();

    // Start with invalid data
    (useProjectMemberData as jest.Mock).mockReturnValue({
      projectMemberData: {
        givenName: 'A', // Invalid - too short
        surName: 'B',   // Invalid - too short  
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: jest.fn(),
      loading: false,
      setProjectMemberData: setProjectMemberDataMock,
      data: {
        projectMember: {
          givenName: 'A',
          surName: 'B',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          memberRoles: [
            { id: '1', __typename: 'MemberRole' },
            { id: '2', __typename: 'MemberRole' }
          ]
        }
      },
      queryError: null
    });

    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<ProjectsProjectMembersEdit />);
    });

    // First submit the form to trigger validation errors
    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verify errors are shown
    await waitFor(() => {
      expect(screen.getByText('form.errors.firstName')).toBeInTheDocument();
      expect(screen.getByText('form.errors.lastName')).toBeInTheDocument();
    });

    // Now fix the first name field
    const firstNameInput = screen.getByRole('textbox', { name: /firstName/i });

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Valid First Name' } });
    });

    // Verify that setProjectMemberData was called to update the field
    expect(setProjectMemberDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        givenName: 'Valid First Name'
      })
    );

    // Now fix the last name field
    const lastNameInput = screen.getByRole('textbox', { name: /lastName/i });

    await act(async () => {
      fireEvent.change(lastNameInput, { target: { value: 'Valid Last Name' } });
    });

    // Verify that setProjectMemberData was called to update the field
    expect(setProjectMemberDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        surName: 'Valid Last Name'
      })
    );
  });

  it("should handle field level errors returned from submitting form", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { updateProjectMember: { errors: { general: 'Error updating member' } } } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error removing member")),
      { loading: false, error: undefined },
    ]);
    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
        'updateProjectMember',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/1/members/1/edit' },
        })
      );
    });
  });

  it("should handle remove member", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: 'buttons.removeMember' });

    await act(async () => {
      fireEvent.click(removeButton);
    })

    await waitFor(() => {
      // Modal should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('headings.removeProjectMember');
      // Get buttons within the modal/dialog
      const dialog = screen.getByRole('dialog');
      const modalButtons = within(dialog).getAllByRole('button');
      expect(modalButtons).toHaveLength(2);
      expect(modalButtons[0]).toHaveTextContent('buttons.cancel');
      expect(modalButtons[1]).toHaveTextContent('buttons.delete');
    });

    // Click delete button
    const dialog = screen.getByRole('dialog');
    const deleteButton = within(dialog).getByRole('button', { name: 'buttons.delete' });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/members');
    });
  });

  it("should handle cancel button in Remove Member modal", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: 'buttons.removeMember' });

    await act(async () => {
      fireEvent.click(removeButton);
    })

    await waitFor(() => {
      // Modal should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click delete button
    const dialog = screen.getByRole('dialog');
    const modalButtons = within(dialog).getAllByRole('button');
    expect(modalButtons).toHaveLength(2);
    expect(modalButtons[0]).toHaveTextContent('buttons.cancel');
    expect(modalButtons[1]).toHaveTextContent('buttons.delete');

    await act(async () => {
      fireEvent.click(modalButtons[0]);
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  });

  it("should handle field-level errors from remove member request", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);
    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { removeProjectMember: { errors: { general: 'Error removing member' } } } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: 'buttons.removeMember' });

    await act(async () => {
      fireEvent.click(removeButton);
    })

    await waitFor(() => {
      // Modal should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: 'buttons.delete' });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(await screen.findByText('Error removing member')).toBeInTheDocument();
  });

  it("should handle remove member request errors", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);
    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error removing member")),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectMembersEdit />
      );
    });

    const removeButton = screen.getByRole('button', { name: 'buttons.removeMember' });

    await act(async () => {
      fireEvent.click(removeButton);
    })

    await waitFor(() => {
      // Modal should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: 'buttons.delete' });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'removeProjectMember',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/1/members/1/edit' },
        })
      );
    });
  });

  it("should handle checkbox change", async () => {
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockResponse }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const setCheckboxRolesMock = jest.fn();

    // Override the mock implementation for this specific test
    (useProjectMemberData as jest.Mock).mockReturnValue({
      projectMemberData: {
        givenName: 'Test',
        surName: 'User',
        affiliationId: 'test-affiliation',
        email: 'test@example.com',
        orcid: '0000-0000-0000-0000',
      },
      checkboxRoles: ['1', '2'],
      setCheckboxRoles: setCheckboxRolesMock,
      loading: false,
      setProjectMemberData: jest.fn(),
      data: {
        projectMember: {
          givenName: 'Test',
          surName: 'User',
          affiliation: { uri: 'test-affiliation' },
          email: 'test@example.com',
          orcid: '0000-0000-0000-0000',
          memberRoles: [
            { id: '1', __typename: 'MemberRole' },
            { id: '2', __typename: 'MemberRole' }
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
    (useUpdateProjectMemberMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveProjectMemberMutation as jest.Mock).mockReturnValue([
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
