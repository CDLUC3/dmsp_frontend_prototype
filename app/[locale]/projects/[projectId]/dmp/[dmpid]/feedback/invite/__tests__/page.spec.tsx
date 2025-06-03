import React from 'react';
import { gql } from '@apollo/client';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
jest.mock("@/generated/graphql", () => {
  const actual = jest.requireActual("@/generated/graphql");
  return {
    ...actual,
    AddProjectContributorDocument: gql`
    mutation AddProjectContributor($input: AddProjectContributorInput!) {
    addProjectContributor(input: $input) {
    email
    errors {
      general
    }
  }
}`,
    AddProjectCollaboratorDocument: gql`
    mutation addProjectCollaborator($projectId: Int!, $email: String!, $accessLevel: ProjectCollaboratorAccessLevel) {
    addProjectCollaborator(
    projectId: $projectId
    email: $email
    accessLevel: $accessLevel
  ) {
    id
    errors {
      general
      email
    }
    email
    user {
      givenName
      surName
      affiliation {
        uri
      }
      orcid
    }
  }
}
    `,
  };
});

import {
  mockScrollIntoView,
  mockScrollTo
} from "@/__mocks__/common";
import ProjectsProjectPlanFeedbackInvite from "../page";
import { addProjectCollaboratorAction } from '../actions/index';
jest.mock('../actions/index', () => ({
  addProjectCollaboratorAction: jest.fn(),
  addProjectMemberAction: jest.fn(),
}));

//import { mockUserData } from "../__mocks__/mockuserData.json";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

const mockUseRouter = useRouter as jest.Mock;

expect.extend(toHaveNoViolations);


describe('ProjectsProjectPlanFeedbackInvite', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1 });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
    jest.clearAllMocks();
  })

  it('should render initial invite page', async () => {
    render(<ProjectsProjectPlanFeedbackInvite />);

    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.project')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.feedback')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument();
    const addCollaboratorForm = screen.getByTestId('add-collaborator-form');
    expect(addCollaboratorForm).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByText('formLabels.email')).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByRole('textbox', { name: 'formLabels.email' })).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByText('radioButtons.access.label')).toBeInTheDocument();
    const radioButton1 = screen.getByRole('radio', {
      name: 'edit',
      checked: true,
    });
    expect(radioButton1).toBeInTheDocument();
    const radioButton2 = screen.getByRole('radio', {
      name: 'comment',
      checked: false
    });
    expect(radioButton2).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByRole('button', { name: 'buttons.grantAccess' })).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByText('para1')).toBeInTheDocument();
    expect(within(addCollaboratorForm).getByText('para2')).toBeInTheDocument();
  });

  it('should open modal when user fills out form and clicks the \'Grant access\' button', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null
        },
        user: {
          givenName: 'John',
          surName: 'Doe',
          affiliation: { uri: 'affiliation-uri' },
          orcid: 'orcid-id',
        },
      },
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Enter email address
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'testing@example.com' } });

    expect(emailField).toHaveValue('testing@example.com');


    // Click "Grant Access button"
    const grantAccessBtn = screen.getByRole('button', { name: /buttons\.grantAccess/i });

    fireEvent.click(grantAccessBtn);
    await waitFor(() => {
      expect(addProjectCollaboratorAction).toHaveBeenCalledWith({
        projectId: 1,
        email: 'testing@example.com',
        accessLevel: 'EDIT',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('invite-confirmation-modal')).toBeInTheDocument();
    })

    // Close the modal
    const closeButton = screen.getByRole('button', { name: /buttons\.close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('invite-confirmation-modal')).not.toBeInTheDocument();
    })
  });

  it('should call addProjectCollaboratorAction with correct access level after changing the radio option', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null
        },
        user: {
          givenName: 'John',
          surName: 'Doe',
          affiliation: { uri: 'affiliation-uri' },
          orcid: 'orcid-id',
        },
      },
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Enter email address
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'testing@example.com' } });

    expect(emailField).toHaveValue('testing@example.com');

    // Select the "Comment only" radio option
    const commentOnlyRadio = screen.getByRole('radio', { name: 'comment' });
    fireEvent.click(commentOnlyRadio);

    // Click "Grant Access" button
    const grantAccessBtn = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessBtn);
    await waitFor(() => {
      expect(addProjectCollaboratorAction).toHaveBeenCalledWith({
        projectId: 1,
        email: 'testing@example.com',
        accessLevel: 'COMMENT',
      });
    });
  });

  it('should display email error when the request result contains an email error', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          email: "Email already exists",
        },
        user: {
          givenName: 'John',
          surName: 'Doe',
          affiliation: { uri: 'affiliation-uri' },
          orcid: 'orcid-id',
        },
      },
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Enter email address
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'testing@example.com' } });

    expect(emailField).toHaveValue('testing@example.com');

    // Select the "Comment only" radio option
    const commentOnlyRadio = screen.getByRole('radio', { name: 'comment' });
    fireEvent.click(commentOnlyRadio);

    // Click "Grant Access" button
    const grantAccessBtn = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessBtn);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();

    });
  });

  it('should display error messages when addProjectCollaboratorAction fails', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ['Something went wrong'],
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Fill out the form
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });

    const grantAccessButton = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessButton);

    await waitFor(() => {
      expect(screen.getByText('messaging.somethingWentWrong')).toBeInTheDocument();
    });
  });

  it('should redirect to correct path if addProjectCollaboratorAction returns a redirect path', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: false,
      redirect: '/login'
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Fill out the form
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });

    const grantAccessButton = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessButton);

    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/login');
    });
  });

  it('should open modal and successfully display text after user submits the \'Grant access\' form ', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null
        },
        user: {
          givenName: 'John',
          surName: 'Doe',
          affiliation: { uri: 'affiliation-uri' },
          orcid: 'orcid-id',
        },
      },
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Enter email address
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'testing@example.com' } });

    expect(emailField).toHaveValue('testing@example.com');

    // Click "Grant Access button"
    const grantAccessBtn = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessBtn);

    await waitFor(() => {
      expect(screen.getByTestId('invite-confirmation-modal')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'headings.h2InviteSent' })).toBeInTheDocument();
      expect(screen.getByText('para3')).toBeInTheDocument();
      expect(screen.getByText('para4')).toBeInTheDocument();
      expect(screen.getByText('para5')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buttons\.close/i })).toBeInTheDocument();
    });
  });

  it('should redirect user when user clicks on \'Close\' button in modal', async () => {
    (addProjectCollaboratorAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null
        },
        user: {
          givenName: 'John',
          surName: 'Doe',
          affiliation: { uri: 'affiliation-uri' },
          orcid: 'orcid-id',
        },
      },
    });

    render(<ProjectsProjectPlanFeedbackInvite />);

    // Enter email address
    const emailField = screen.getByPlaceholderText('placeHolders.email');
    fireEvent.change(emailField, { target: { value: 'testing@example.com' } });

    expect(emailField).toHaveValue('testing@example.com');

    // Click "Grant Access button"
    const grantAccessBtn = screen.getByRole('button', { name: /buttons\.grantAccess/i });
    fireEvent.click(grantAccessBtn);

    await waitFor(() => {
      expect(screen.getByTestId('invite-confirmation-modal')).toBeInTheDocument();
    });

    // Close modal form
    const closeButton = screen.getByRole('button', { name: /buttons\.close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/1/dmp/1/feedback');
    });
  });

  it('should pass accessibility tests for initial page', async () => {
    const { container } = render(<ProjectsProjectPlanFeedbackInvite />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
