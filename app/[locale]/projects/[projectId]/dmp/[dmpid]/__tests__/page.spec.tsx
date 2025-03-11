import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import {
  usePlanQuery
} from '@/generated/graphql';
import {
  mockScrollIntoView,
  mockScrollTo
} from "@/__mocks__/common";
import PlanOverviewPage from "../page";
import { mockPlanData } from "../__mocks__/planQueryMock";


jest.mock("@/generated/graphql", () => ({
  usePlanQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

expect.extend(toHaveNoViolations);

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

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
  });

  it('should open and close modal', async () => {
    render(<PlanOverviewPage />);
    const markCompleteButton = screen.getByText(/status.download.markComplete/i);
    fireEvent.click(markCompleteButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

