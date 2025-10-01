import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from '@/utils/test-utils';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';

import {
  useMemberRolesQuery,
} from '@/generated/graphql';

import { addProjectMemberAction } from '@/app/actions';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectMemberCreate from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockMemberRoles from '../__mocks__/memberRolesMock.json';
import addProjectMemberRresponseMock from '../__mocks__/addProjectMemberResponseMock.json';


expect.extend(toHaveNoViolations);

// Mock the graphql hooks
jest.mock("@/generated/graphql", () => ({
  useMemberRolesQuery: jest.fn(),
}));

jest.mock('@/app/actions', () => ({
  addProjectMemberAction: jest.fn()
}));


const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  add: jest.fn(),
};

const mockAddProjectMemberAction = addProjectMemberAction as jest.MockedFunction<typeof addProjectMemberAction>;



describe("ProjectsProjectMemberCreate", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, memberId: 1 });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Mock the addProjectMemberAction to return success
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: undefined,
      errors: []
    });

    (useMemberRolesQuery as jest.Mock).mockReturnValue({
      data: mockMemberRoles,
      loading: false,
      error: null,
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

    render(
      <ProjectsProjectMemberCreate />
    );
    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    (useMemberRolesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: true,
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    expect(screen.getByText('messaging.error')).toBeInTheDocument();
  });

  it("should render correct fields", async () => {

    render(
      <ProjectsProjectMemberCreate />
    );

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
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: addProjectMemberRresponseMock,
      errors: []
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);
    fireEvent.click(roles[3]);
    fireEvent.click(roles[5]);

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1/members');
      expect(mockToast.add).toHaveBeenCalledWith('messaging.success.memberAdded', { type: 'success' });
    });
  });

  it("should handle checking different roles", async () => {

    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: addProjectMemberRresponseMock,
      errors: []
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);
    fireEvent.click(roles[3]);
    fireEvent.click(roles[5]);

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(addProjectMemberAction).toHaveBeenCalledWith(expect.objectContaining({
        memberRoleIds: [1, 4, 15],
      }));
    });
  });

  it("should display error if form submitted without entering a first name", async () => {
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: addProjectMemberRresponseMock,
      errors: []
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Check roles
    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('messaging.errors.errorAddingMember')).toBeInTheDocument();
    });
  });

  it("should display error if form submitted without entering a last name", async () => {
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: addProjectMemberRresponseMock,
      errors: []
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Check roles
    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('messaging.errors.errorAddingMember')).toBeInTheDocument();
    });
  });

  it("should display error if form submitted without entering a last name", async () => {
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: addProjectMemberRresponseMock,
      errors: []
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Check roles
    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('messaging.errors.errorAddingMember')).toBeInTheDocument();
    });
  });

  it("should display error if field-level errors returned", async () => {
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: {
        id: 38,
        givenName: "John",
        surName: "Doe",
        email: "john.doe@example.com",
        affiliation: {
          id: 118,
          name: "National Science Foundation",
          uri: "https://ror.org/021nxhr62"
        },
        orcid: null,
        errors: {
          email: null,
          surName: null,
          general: "Member already exists in the system",
          givenName: null,
          orcid: null,
          memberRoleIds: null
        }
      }
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Check roles
    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Member already exists in the system')).toBeInTheDocument();
    });
  });

  it("should display errors if returns in response", async () => {

    mockAddProjectMemberAction.mockResolvedValueOnce({
      success: false,
      errors: ['Failed to add member'],
      data: undefined
    });

    render(
      <ProjectsProjectMemberCreate />
    );

    // Fill out the form fields
    fireEvent.change(screen.getByRole('textbox', { name: /firstName/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /lastName/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /affiliation/i }), { target: { value: 'University' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /orcid/i }), { target: { value: '0000-0002-1825-0097' } });


    const roles = screen.getAllByTestId(/role-checkbox-/);
    expect(roles.length).toBe(15);

    fireEvent.click(roles[0]);

    const saveButton = screen.getByRole('button', { name: /buttons.saveChanges/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to add member')).toBeInTheDocument();
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'addProjectMember',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/projects/1/members' },
        })
      );
    });
  });


  it("should pass accessibility checks", async () => {

    const { container } = render(
      <ProjectsProjectMemberCreate />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
