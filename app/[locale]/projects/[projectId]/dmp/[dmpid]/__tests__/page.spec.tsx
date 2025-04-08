import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import {
  usePlanQuery,
} from '@/generated/graphql';
import {
  mockScrollIntoView,
  mockScrollTo
} from "@/__mocks__/common";
import PlanOverviewPage from "../page";
import { mockPlanData } from "../__mocks__/planQueryMock";

// __mocks__/publishPlanAction.ts
jest.mock('../publishPlanAction', () => ({
  publishPlanAction: jest.fn()
}));

jest.mock("@/generated/graphql", () => ({
  usePlanQuery: jest.fn(),
  PlanStatus: {
    DRAFT: 'DRAFT',
    COMPLET: 'COMPLETE',
    ARCHIVED: 'ARCHIVED'
  },
  PlanVisibility: {
    Public: 'PUBLIC',
    Private: 'PRIVATE',
    Organizational: 'ORGANIZATIONAL',
  },
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
    mockUseParams.mockReturnValue({ projectId: '123' });

    // Mock the hook for data state
    (usePlanQuery as jest.Mock).mockReturnValue({
      data: { plan: mockPlanData.plan },
      loading: false,
      error: null,
    });
  })

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
    expect(within(sidebar).getByText('PUBLISHED')).toBeInTheDocument();
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

  /**Test that publish status is updated when user publishes plan */

  /**Test that status changes in sidebar when user selects a different status */

  /** Test that modal closes after the above updates */

  /** Test that clicking on links goes to correct url */

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

