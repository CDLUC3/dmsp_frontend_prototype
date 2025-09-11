import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockedProvider } from '@apollo/client/testing';
import { useParams, useRouter } from 'next/navigation';
import { removeProjectCollaboratorAction, updateProjectCollaboratorAction } from '../actions';
import { mockScrollIntoView } from "@/__mocks__/common";

import {
  ProjectCollaboratorAccessLevel,
  ProjectCollaboratorsDocument,
} from '@/generated/graphql';

expect.extend(toHaveNoViolations);
import ProjectsProjectCollaboration from "../page";


expect.extend(toHaveNoViolations);

jest.mock('../actions', () => ({
  removeProjectCollaboratorAction: jest.fn().mockResolvedValue({
    success: true,
    errors: [],
    data: {}
  }),
  updateProjectCollaboratorAction: jest.fn().mockResolvedValue({
    success: true,
    errors: [],
    data: {},
    redirect: undefined
  }),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

const mockRouter = {
  push: jest.fn(),
};
const projectCollaboratorsMock = [
  {
    __typename: "ProjectCollaborator",
    id: 21,
    errors: {
      __typename: "ProjectCollaboratorErrors",
      accessLevel: null,
      email: null,
      general: null,
      invitedById: null,
      planId: null,
      userId: null
    },
    accessLevel: "OWN",
    created: "2025-09-10 19:36:06",
    email: "user1@example.com",
    user: {
      __typename: "User",
      givenName: "User",
      surName: "One",
      email: "user1@example.com"
    }
  },
  {
    __typename: "ProjectCollaborator",
    id: 20,
    errors: {
      __typename: "ProjectCollaboratorErrors",
      accessLevel: null,
      email: null,
      general: null,
      invitedById: null,
      planId: null,
      userId: null
    },
    accessLevel: "OWN",
    created: "2025-09-10 17:44:40",
    email: "user2@example.com",
    user: null
  },
  {
    __typename: "ProjectCollaborator",
    id: 22,
    errors: {
      __typename: "ProjectCollaboratorErrors",
      accessLevel: null,
      email: null,
      general: null,
      invitedById: null,
      planId: null,
      userId: null
    },
    accessLevel: "OWN",
    created: "2025-09-10 19:36:26",
    email: "user3@example.com",
    user: {
      __typename: "User",
      givenName: "User",
      surName: "Three",
      email: "user3@example.com"
    }
  },
  {
    __typename: "ProjectCollaborator",
    id: 18,
    errors: {
      __typename: "ProjectCollaboratorErrors",
      accessLevel: null,
      email: null,
      general: null,
      invitedById: null,
      planId: null,
      userId: null
    },
    accessLevel: "EDIT",
    created: "2025-09-10 17:25:37",
    email: "user4@example.com",
    user: {
      __typename: "User",
      givenName: "User",
      surName: "Four",
      email: "user4@Example.com"
    }
  }
];

const MOCKS = [
  // Successful project collaborators query
  {
    request: {
      query: ProjectCollaboratorsDocument,
      variables: {
        projectId: 1
      },
    },
    result: {
      data: {
        projectCollaborators: projectCollaboratorsMock,
      },
    },
  },
];

const ERROR_MOCKS = [
  {
    request: {
      query: ProjectCollaboratorsDocument,
      variables: {
        projectId: 1
      },
    },
    error: new Error('Server Error')
  }
]


describe('ProjectsProjectCollaborationPage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: "1" });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call handleRevoke when the revoke button is clicked, and \'delete\' button is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    // Confirm confirm modal opened
    const confirmRevokeButton = await screen.findByRole('button', { name: "deleteCollaborator" });
    fireEvent.click(confirmRevokeButton);

    await waitFor(() => {
      expect(removeProjectCollaboratorAction).toHaveBeenCalledWith({
        projectCollaboratorId: 21,
      });
    });
  });

  it('should handle failure when revoke fails', async () => {
    // Override the default mock for this test only
    (removeProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      errors: ['Something went wrong'],
      data: {}
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);

    const confirmRevokeButton = await screen.findByRole('button', { name: "deleteCollaborator" });
    fireEvent.click(confirmRevokeButton);

    await waitFor(() => {
      expect(removeProjectCollaboratorAction).toHaveBeenCalledWith({
        projectCollaboratorId: 21,
      });
    });

    // Should display error message
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should display any field-level errors returned from handleRevoke', async () => {
    // Override the default mock for this test only
    (removeProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      errors: null,
      data: {
        errors: {
          general: 'Something went wrong with the handleRevoke action'
        }
      }
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    const confirmRevokeButton = await screen.findByRole('button', { name: "deleteCollaborator" });
    fireEvent.click(confirmRevokeButton);

    await waitFor(() => {
      expect(removeProjectCollaboratorAction).toHaveBeenCalledWith({
        projectCollaboratorId: 21,
      });
    });

    // Should display error message
    expect(await screen.findByText(/Something went wrong with the handleRevoke action/i)).toBeInTheDocument();
  });

  it('should call redirect if removeProjectCollaboratorAction response includes a redirect', async () => {
    // Override the default mock for this test only
    (removeProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      errors: null,
      data: {},
      redirect: '/en-US/login'
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    const confirmRevokeButton = await screen.findByRole('button', { name: "deleteCollaborator" });
    fireEvent.click(confirmRevokeButton);

    await waitFor(() => {
      expect(removeProjectCollaboratorAction).toHaveBeenCalledWith({
        projectCollaboratorId: 21,
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/login');
    });


  });

  it('should NOT call handleRevoke when the revoke button is clicked, and \'cancel\' button is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    // Confirm confirm modal opened
    const confirmRevokeButton = await screen.findByRole('button', { name: "cancelRemoval" });
    fireEvent.click(confirmRevokeButton);

    await waitFor(() => {
      expect(removeProjectCollaboratorAction).not.toHaveBeenCalledWith();
    });
  });

  it('should call handleRadioChange when the the access level is changed for a user', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    // Find the specific label by testid
    const label = screen.getByTestId('edit-User One');
    // Within that label, grab the radio by aria label
    const input = within(label).getByLabelText('canEditPlanFor');

    // Click and assert
    fireEvent.click(input);
    expect(input).toBeChecked();

    // Confirm 
    await waitFor(() => {
      expect(updateProjectCollaboratorAction).toHaveBeenCalledWith({
        projectCollaboratorId: 21,
        accessLevel: ProjectCollaboratorAccessLevel.Edit
      });
    });
  });

  it('should NOT call handleRadioChange when the the access level is the same as before when user clicks the radio button', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    await waitFor(() => {
      const revokeButton = screen.queryAllByRole('button', { name: /revokeAccessFor/i });
      fireEvent.click(revokeButton[0]);
    });

    // Find the specific label by testid
    const label = screen.getByTestId('own-User One');
    // Within that label, grab the radio by aria label
    const input = within(label).getByLabelText('canOwnPlanFor');

    // Click and assert
    fireEvent.click(input);
    expect(input).toBeChecked();

    // Should not call update action as the access level is the same
    await waitFor(() => {
      expect(updateProjectCollaboratorAction).not.toHaveBeenCalledWith();
    });
  });

  it('should handle response correctly when updateProjectCollaboratorsAction fails', async () => {
    // Override the default mock for this test only
    (updateProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      errors: ['Something went wrong'],
      data: {}
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);


    // Find the specific label by testid
    const label = screen.getByTestId('edit-User One');
    // Within that label, grab the radio by aria label
    const input = within(label).getByLabelText('canEditPlanFor');

    // Click and assert
    fireEvent.click(input);
    expect(input).toBeChecked();

    // Should display error message
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should handle response correctly when updateProjectCollaboratorsAction returns field-level errors', async () => {
    // Override the default mock for this test only
    (updateProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: true,
      errors: null,
      data: {
        errors: {
          general: 'Something went wrong with the handleRevoke action'
        }
      }
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);

    // Find the specific label by testid
    const label = screen.getByTestId('edit-User One');
    // Within that label, grab the radio by aria label
    const input = within(label).getByLabelText('canEditPlanFor');

    // Click and assert
    fireEvent.click(input);
    expect(input).toBeChecked();

    // Should display error message
    expect(await screen.findByText(/Something went wrong with the handleRevoke action/i)).toBeInTheDocument();
  });

  it('should handle response correctly when updateProjectCollaboratorsAction returns a redirect', async () => {
    // Override the default mock for this test only
    (updateProjectCollaboratorAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      errors: null,
      data: {},
      redirect: '/en-US/login'
    });

    await act(async () => {
      render(
        <MockedProvider mocks={MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    // Wait until data has been rendered
    const inviteButton = await screen.findByRole('link', { name: "links.inviteAPerson" });
    expect(inviteButton).toBeInTheDocument();

    const revokeButton = await screen.queryAllByRole('button', { name: /revokeAccessFor/i });
    fireEvent.click(revokeButton[0]);

    // Find the specific label by testid
    const label = screen.getByTestId('edit-User One');
    // Within that label, grab the radio by aria label
    const input = within(label).getByLabelText('canEditPlanFor');

    // Click and assert
    fireEvent.click(input);
    expect(input).toBeChecked();

    // Verify that router.push was called with "/login"
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/login');
    })
  });


  it('should display error if projectCollaborators query fails', async () => {

    await act(async () => {
      render(
        <MockedProvider mocks={ERROR_MOCKS}>
          <ProjectsProjectCollaboration />
        </MockedProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });

  });
  it('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectCollaboration />
      </MockedProvider>
    );

    // Wait for the UI to settle after async updates
    await waitFor(() => {
      // Example: wait for a known element to appear
      expect(screen.getByText(/User One/i)).toBeInTheDocument();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

