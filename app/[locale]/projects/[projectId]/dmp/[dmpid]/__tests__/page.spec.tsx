import React from 'react';
import { gql } from '@apollo/client';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import { cookies } from "next/headers";

jest.mock("@/generated/graphql", () => {
  const actual = jest.requireActual("@/generated/graphql");
  return {
    ...actual,
    usePlanQuery: jest.fn(),
    PlanStatus: {
      DRAFT: "DRAFT",
      COMPLETE: "COMPLETE",
      ARCHIVED: "ARCHIVED",
    },
    PlanVisibility: {
      Public: "PUBLIC",
      Private: "PRIVATE",
      Organizational: "ORGANIZATIONAL",
    },
    UpdatePlanStatus: gql`
    mutation UpdatePlanStatus($planId: Int!, $status: PlanStatus!) {
  updatePlanStatus(planId: $planId, status: $status) {
    errors {
      general
      status
    }
    id
    status
    visibility
  }
}`,
    PublishPlanDocument: gql`
      mutation PublishPlan($planId: Int!, $visibility: PlanVisibility) {
        publishPlan(planId: $planId, visibility: $visibility) {
          errors {
            general
            visibility
            status
          }
          visibility
          status
        }
      }
    `,
  };
});

// Now import after the mock is defined
import { usePlanQuery } from "@/generated/graphql";

import {
  mockScrollIntoView,
  mockScrollTo
} from "@/__mocks__/common";
import PlanOverviewPage from "../page";
import { mockPlanData } from "../__mocks__/planQueryMock";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

expect.extend(toHaveNoViolations);


describe('PlanOverviewPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1 });

    // Mock the hook for data state
    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: mockPlanData.plan },
      loading: false,
      error: null,
      refetch: jest.fn()
    });
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (usePlanQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<PlanOverviewPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    (usePlanQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Error' },
    });
    render(<PlanOverviewPage />);
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });

  it('should render plan data', async () => {
    render(<PlanOverviewPage />);

    expect(screen.getByRole('heading', { name: 'Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations' })).toBeInTheDocument();
    expect(screen.getByText('National Science Foundation (nsf.gov)')).toBeInTheDocument();
    expect(screen.getByText('members.title')).toBeInTheDocument();
    expect(screen.getByText('members.info')).toBeInTheDocument();
    expect(screen.getByText('members.edit')).toBeInTheDocument();
    expect(screen.getByText('outputs.title')).toBeInTheDocument();
    expect(screen.getByText('outputs.count')).toBeInTheDocument();
    // Check that sections rendered
    expect(screen.getByRole('heading', { name: 'Roles & Responsibilities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Metadata' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sharing/Copyright Issues' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Long Term Storage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Research Products' })).toBeInTheDocument();

    // Check sidebar items
    const sidebar = screen.getByTestId('sidebar-panel');
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'buttons.preview' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'buttons.publish' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.feedback.title' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'links.request' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.title' })).toBeInTheDocument();
    expect(within(sidebar).getByText('DRAFT')).toBeInTheDocument();
    expect(within(sidebar).getByText('buttons.linkUpdate')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.publish.title' })).toBeInTheDocument();
    expect(within(sidebar).getByText('status.publish.label')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.download.title' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'download' })).toBeInTheDocument();
  });

  it('should open and close modal', async () => {
    render(<PlanOverviewPage />);
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should have correct info in first page of Publish modal', async () => {
    render(<PlanOverviewPage />);

    // Click the Publish button to open the modal
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);

    await waitFor(() => {
      const checklist = screen.getByTestId('checklist');
      expect(checklist).toBeInTheDocument();
      expect(within(checklist).getByText('publishModal.publish.checklistItem.primaryContact')).toBeInTheDocument();
      const linkPrimaryContact = within(checklist).getByRole('link', { name: 'Captain Nemo' });
      expect(linkPrimaryContact).toBeInTheDocument();
      expect(within(checklist).getByText(/publishModal\.publish\.checklistItem\.funderText\s*\(/i)).toBeInTheDocument();
      const linkFunder = within(checklist).getByRole('link', { name: 'publishModal.publish.checklistItem.funder' });
      expect(linkFunder).toBeInTheDocument();
      expect(within(checklist).getByText('publishModal.publish.checklistItem.orcidText')).toBeInTheDocument();
      const linkOrcid = within(checklist).getByRole('link', { name: 'publishModal.publish.checklistItem.projectMembers' });
      expect(linkOrcid).toBeInTheDocument();
      expect(within(checklist).getByText('publishModal.publish.checklistItem.complete')).toBeInTheDocument();
      expect(within(checklist).getByText('publishModal.publish.checklistItem.percentageAnswered')).toBeInTheDocument();
      expect(within(checklist).getByText('publishModal.publish.checklistItem.requiredFields')).toBeInTheDocument();
      const requiredFields = screen.getByText((content) =>
        content.includes('3') && content.includes('publishModal.publish.checklistInfo')
      );
      expect(requiredFields).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'buttons.close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'publishModal.publish.buttonNext >' })).toBeInTheDocument();
    });
  });

  it('should have correct info in second page of Publish modal', async () => {
    render(<PlanOverviewPage />);

    // Click the Publish button to open the modal
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);

    const nextButton = screen.getByRole('button', { name: 'publishModal.publish.buttonNext >' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'publishModal.publish.visibilityTitle' })).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityDescription')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'publishModal.publish.visibilityOptionsTitle' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /private/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /public/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /organizational/i })).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.public.label')).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.public.description')).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.organization.label')).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.organization.description')).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.private.label')).toBeInTheDocument();
      expect(screen.getByText('publishModal.publish.visibilityOptions.private.description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'buttons.close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'publishModal.publish.title' })).toBeInTheDocument();
    });
  });

  it('should set correct visibility radio button value when clicked ', async () => {
    render(<PlanOverviewPage />);

    // Click the Publish button to open the modal
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);

    const nextButton = screen.getByRole('button', { name: 'publishModal.publish.buttonNext >' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      const privateRadio = screen.getByRole('radio', { name: /private/i });
      const publicRadio = screen.getByRole('radio', { name: /public/i });
      const organizationalRadio = screen.getByRole('radio', { name: /organizational/i });

      // Check initial state (none selected by default)
      expect(privateRadio).not.toBeChecked();
      expect(publicRadio).toBeChecked();
      expect(organizationalRadio).not.toBeChecked();

      // Select the "Public" radio button
      fireEvent.click(publicRadio);
      expect(publicRadio).toBeChecked();
      expect(privateRadio).not.toBeChecked();
      expect(organizationalRadio).not.toBeChecked();

      // Select the "Private" radio button
      fireEvent.click(privateRadio);
      expect(privateRadio).toBeChecked();
      expect(publicRadio).not.toBeChecked();
      expect(organizationalRadio).not.toBeChecked();
    });
  });

  it('should call publishPlan mutation with correct info when user clicks Publish button', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          publishPlan: {
            success: true,
          },
        },
      }),
    }) as jest.Mock;
    render(<PlanOverviewPage />);

    // Click the Publish button to open the modal
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);

    const nextButton = screen.getByRole('button', { name: 'publishModal.publish.buttonNext >' });
    fireEvent.click(nextButton);

    // Select the visibility option
    const publicRadio = screen.getByRole('radio', { name: /public/i });
    fireEvent.click(publicRadio);

    // Click the Publish button in the modal
    const publishPlanButton = screen.getByRole('button', { name: 'publishModal.publish.title' });
    fireEvent.click(publishPlanButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/graphql"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("mutation PublishPlan"),
        })
      );

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.variables).toEqual({
        planId: expect.any(Number),
        visibility: "PUBLIC",
      });
    });
  });

  it('should call updatePlanStatus mutation with correct info when user changes', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updatePlanStatus: {
            success: true,
          },
        },
      }),
    }) as jest.Mock;

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('DRAFT')).toBeInTheDocument();

    // Click the Update link next to Plan Status to reveal the select dropdown
    const updateLink = screen.getByTestId('updateLink');
    await act(async () => {
      fireEvent.click(updateLink);
    });

    // Find the dropdown button using its aria-label
    const dropdownButton = screen.getByRole('button', { name: /draft/i });
    await act(async () => {
      fireEvent.click(dropdownButton);
    });

    // Find the dropdown container (role="listbox")
    const listbox = screen.getByRole('listbox');

    // Find the "Complete" option (role="option") within the listbox
    const option = within(listbox).getByRole('option', { name: /Complete/i });

    // Click the "Complete" option
    await act(async () => {
      fireEvent.click(option);
    });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });

    // Click the save button
    await act(async () => {
      fireEvent.click(saveButton);
    });


    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/graphql"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("mutation UpdatePlanStatus"),
        })
      );

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.variables).toEqual({
        planId: expect.any(Number),
        status: "COMPLETE",
      });
    });
  });

  it('should display error message when updatePlanStatus mutation is not successful', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Error removing member"))

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('DRAFT')).toBeInTheDocument();

    // Click the Update link next to Plan Status to reveal the select dropdown
    const updateLink = screen.getByTestId('updateLink');
    await act(async () => {
      fireEvent.click(updateLink);
    });

    // Find the dropdown button using its aria-label
    const dropdownButton = screen.getByRole('button', { name: /draft/i });
    await act(async () => {
      fireEvent.click(dropdownButton);
    });

    // Find the dropdown container (role="listbox")
    const listbox = screen.getByRole('listbox');

    // Find the "Complete" option (role="option") within the listbox
    const option = within(listbox).getByRole('option', { name: /Complete/i });

    // Click the "Complete" option
    await act(async () => {
      fireEvent.click(option);
    });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });

    // Click the save button
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('There was a problem connecting to the server. Please try again.')).toBeInTheDocument();
    });
  });

  it('should set general error message when call updatePlanStatus mutation is successful and returns a general error', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updatePlanStatus: {
            errors: { general: 'No such status INCOMPLETE.', status: null },
            id: 1,
            status: 'COMPLETE',
            visibility: 'PUBLIC'
          },
        },
      }),
    }) as jest.Mock;

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('DRAFT')).toBeInTheDocument();

    // Click the Update link next to Plan Status to reveal the select dropdown
    const updateLink = screen.getByTestId('updateLink');
    await act(async () => {
      fireEvent.click(updateLink);
    });

    // Find the dropdown button using its aria-label
    const dropdownButton = screen.getByRole('button', { name: /draft/i });
    await act(async () => {
      fireEvent.click(dropdownButton);
    });

    // Find the dropdown container (role="listbox")
    const listbox = screen.getByRole('listbox');

    // Find the "Complete" option (role="option") within the listbox
    const option = within(listbox).getByRole('option', { name: /Complete/i });

    // Click the "Complete" option
    await act(async () => {
      fireEvent.click(option);
    });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });

    // Click the save button
    await act(async () => {
      fireEvent.click(saveButton);
    });


    await waitFor(() => {
      expect(screen.getByText('No such status INCOMPLETE.')).toBeInTheDocument();
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

