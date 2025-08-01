import React from 'react';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
import { cookies } from "next/headers";
import {
  publishPlanAction,
  updatePlanStatusAction,
  updatePlanTitleAction
} from '../actions';
import { usePlanQuery } from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';

jest.mock('../actions/index', () => ({
  publishPlanAction: jest.fn(),
  updatePlanStatusAction: jest.fn(),
  updatePlanTitleAction: jest.fn(),
}));

// Mock the graphql hooks
jest.mock("@/generated/graphql", () => ({
  PlanStatus: {
    Archived: 'ARCHIVED',
    Complete: 'COMPLETE',
    Draft: 'DRAFT',
  },
  PlanVisibility: {
    Public: 'PUBLIC',
    Private: 'PRIVATE',
    Organizational: 'ORGANIZATIONAL',
  },
  usePlanQuery: jest.fn(),
}));

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

const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  add: jest.fn(),
};

expect.extend(toHaveNoViolations);


describe('PlanOverviewPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1 });

    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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
    expect(screen.getByText('National Science Foundation (nsf.gov), Irish Research Council (research.ie)')).toBeInTheDocument();
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

    // // Check sidebar items
    const sidebar = screen.getByTestId('sidebar-panel');
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'buttons.preview' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'buttons.publish' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.feedback.title' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'links.request' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.title' })).toBeInTheDocument();
    expect(within(sidebar).getByText('Draft')).toBeInTheDocument();
    expect(within(sidebar).getByText('buttons.linkUpdate')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.publish.title' })).toBeInTheDocument();
    expect(within(sidebar).getByText('status.publish.label')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.download.title' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'download' })).toBeInTheDocument();
  });

  it('should function as expected if plan data is missing id, dmpId, registered, title, and status', async () => {
    const updatedMockPlanData = {
      ...mockPlanData.plan,
      id: null,
      dmpId: null,
      registered: null,
      title: null,
      status: null
    };

    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: updatedMockPlanData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<PlanOverviewPage />);

    expect(screen.queryByRole('heading', { name: 'Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations' })).not.toBeInTheDocument();
    expect(screen.getByText('National Science Foundation (nsf.gov), Irish Research Council (research.ie)')).toBeInTheDocument();
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
    expect(within(sidebar).queryByText('Draft')).not.toBeInTheDocument();
    expect(within(sidebar).getByText('buttons.linkUpdate')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.publish.title' })).toBeInTheDocument();
    expect(within(sidebar).getByText('status.publish.label')).toBeInTheDocument();
    expect(within(sidebar).getByRole('heading', { name: 'status.download.title' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'download' })).toBeInTheDocument();
  });

  it('should display plan status PUBLISHED if \'registered\' prop has a value', async () => {

    const updatedMockPlanData = {
      ...mockPlanData.plan,
      registered: '2023-10-01T00:00:00Z',
    };

    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: updatedMockPlanData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<PlanOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  it('should display plan status UNPUBLISHED if \'registered\' prop has a value of null', async () => {

    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: mockPlanData.plan },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<PlanOverviewPage />);
    await waitFor(() => {
      expect(screen.getByText('Unpublished')).toBeInTheDocument();
    });
  });

  it('should display zero percentageAnswered when there are no sections', async () => {

    const mockPlanDataWithNoSections = {
      ...mockPlanData.plan,
      sections: [],
    };
    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: mockPlanDataWithNoSections },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<PlanOverviewPage />);

    // Click the Publish button to open the modal
    const publishButton = screen.getByText(/buttons.publish/i);
    fireEvent.click(publishButton);
    const checklist = screen.getByTestId('checklist');

    await waitFor(() => {
      expect(within(checklist).getByText('publishModal.publish.checklistItem.percentageAnswered')).toBeInTheDocument();
    });
  });

  it('should use \'Start\' for section buttons if no questions in that section have been answered, otherwise it should use \'Update\'', async () => {
    const { container } = render(<PlanOverviewPage />);

    const sectionWithSomeAnswers = container.querySelector('section[aria-labelledby="section-title-8"]') as HTMLElement;
    if (sectionWithSomeAnswers) {
      const button = within(sectionWithSomeAnswers).getByText('sections.update');
      expect(button).toBeInTheDocument();
    }

    const sectionWithNoAnswers = container.querySelector('section[aria-labelledby="section-title-11"]') as HTMLElement;
    if (sectionWithNoAnswers) {
      const button = within(sectionWithNoAnswers).getByText('sections.start');
      expect(button).toBeInTheDocument();
    }
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
      expect(within(checklist).getByText(/publishModal\.publish\.checklistItem\.fundingText\s*\(/i)).toBeInTheDocument();
      const linkFunding = within(checklist).getByRole('link', { name: 'publishModal.publish.checklistItem.funding' });
      expect(linkFunding).toBeInTheDocument();
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
      expect(screen.getByRole('radio', { name: /organization/i })).toBeInTheDocument();
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
      const organizationalRadio = screen.getByRole('radio', { name: /organization/i });

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

  it('should call publishPlanAction mutation with correct info when user clicks Publish button', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    (publishPlanAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          status: null,
          visibility: null
        },
        visibility: 'PUBLIC',
        status: 'COMPLETE'
      },
    });

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
      expect(publishPlanAction).toHaveBeenCalledWith({
        planId: expect.any(Number),
        visibility: "PUBLIC",
      });
    });
    expect(mockToast.add).toHaveBeenCalledWith('messages.success.successfullyPublished', { type: 'success' });
  });

  it('should display error when publishPlanAction mutation returns field-level errors', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    (publishPlanAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: 'There was a problem publishing the plan',
          status: null,
          visibility: null
        },
        visibility: 'PUBLIC',
        status: 'COMPLETE'
      },
    });

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
      expect(publishPlanAction).toHaveBeenCalledWith({
        planId: expect.any(Number),
        visibility: "PUBLIC",
      });
      expect(screen.getByText('There was a problem publishing the plan')).toBeInTheDocument();
    });

  });

  it('should redirect if publishPlanAction mutation returns a redirect prop in its response', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    (publishPlanAction as jest.Mock).mockResolvedValue({
      success: false,
      redirect: '/login',
    });

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
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('should call updatePlanStatusAction mutation with correct info when user changes', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);

    (updatePlanStatusAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          status: null
        },
        id: 6,
        status: 'COMPLETE',
        visibility: 'PRIVATE',
      },
    });

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('Draft')).toBeInTheDocument();

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
      expect(updatePlanStatusAction).toHaveBeenCalledWith({
        planId: expect.any(Number),
        status: "COMPLETE",
      });
      expect(mockToast.add).toHaveBeenCalledWith('messages.success.successfullyUpdatedStatus', { type: 'success' });

    });
  });

  it('should redirect if updatePlanStatusAction returns a redirect in response', async () => {
    (updatePlanStatusAction as jest.Mock).mockResolvedValue({
      success: false,
      redirect: '/login'
    });

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('Draft')).toBeInTheDocument();

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
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('should display error message when updatePlanStatusAction mutation is not successful', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    (updatePlanStatusAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ['There was a problem connecting to the server. Please try again.'],
    });

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('Draft')).toBeInTheDocument();

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


    (updatePlanStatusAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: 'There was a problem updating the plan status.',
          status: null
        },
        id: 6,
        status: 'COMPLETE',
        visibility: 'PRIVATE',
      },
    });

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('Draft')).toBeInTheDocument();

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
      expect(screen.getByText('There was a problem updating the plan status.')).toBeInTheDocument();
    });
  });

  it('should set error message when call updatePlanStatus mutation is successful and returns an error that is not general', async () => {
    // Mock the cookies function
    const mockCookies = {
      toString: jest.fn().mockReturnValue("mockedCookie=value"),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


    (updatePlanStatusAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          status: 'Status cannot be updated to COMPLETE.',
        },
        id: 6,
        status: 'COMPLETE',
        visibility: 'PRIVATE',
      },
    });

    render(<PlanOverviewPage />);

    // First check that inital Plan Status is DRAFT
    expect(screen.getByText('Draft')).toBeInTheDocument();

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
      expect(screen.getByText('Status cannot be updated to COMPLETE.')).toBeInTheDocument();
    });
  });

  it('should call updatePlanTitleAction when user enters a new title and clicks save', async () => {

    (updatePlanTitleAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
          email: null,
        },
        id: 1,
        title: 'Changed title',
      },
    });

    render(<PlanOverviewPage />);

    const editButton = screen.getByRole('button', { name: 'links.editTitle' });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const input = screen.getByPlaceholderText('page.planTitlePlaceholder');
    fireEvent.change(input, { target: { value: 'New plan title' } });

    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    })

    // Wait for the updatePlanTitleAction to be called
    await waitFor(() => {
      expect(updatePlanTitleAction).toHaveBeenCalledWith({
        planId: 1,
        title: 'New plan title',
      });
    });
  });

  it('should set errors when handleTitleChange is called and returns a general error', async () => {

    (updatePlanTitleAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: 'There was an error changing title',
          email: null,
        },
        id: 15,
        title: 'Changed title',
      },
    });


    render(<PlanOverviewPage />);

    const editButton = screen.getByRole('button', { name: 'links.editTitle' });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const input = screen.getByPlaceholderText('page.planTitlePlaceholder');
    fireEvent.change(input, { target: { value: 'New plan title' } });

    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    })

    expect(screen.getByText('There was an error changing title')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

