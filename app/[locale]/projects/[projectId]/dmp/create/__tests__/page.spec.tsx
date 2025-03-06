import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import PlanCreate from '../page';
import { useParams, useRouter } from 'next/navigation';
import { useProjectFundersQuery, usePublishedTemplatesQuery, useAddPlanMutation } from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  mockScrollIntoView,
  mockScrollTo
} from '@/__mocks__/common';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/generated/graphql', () => ({
  useProjectFundersQuery: jest.fn(),
  usePublishedTemplatesQuery: jest.fn(),
  useAddPlanMutation: jest.fn(),
}));

// Mock useFormatter from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));


const mockPublishedTemplates = [
  {
    bestPractice: false,
    description: "Template 1",
    id: "1",
    name: "Agency for Healthcare Research and Quality",
    visibility: "PUBLIC"
  },
  {
    bestPractice: false,
    description: "Arctic Data Center",
    id: "20",
    name: "Arctic Data Center: NSF Polar Programs",
    visibility: "PUBLIC"
  },
  {
    bestPractice: true,
    description: "Develop data plans",
    id: "10",
    name: "Data Curation Centre",
    visibility: "PUBLIC"
  },
]

const mockProjectFunders = [
  {
    id: 1,
    affiliation: {
      displayName: "National Science Foundation (nsf.gov)",
      uri: "http://nsf.gov"
    }
  }
]
describe('PlanCreate Component', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseProjectFundersQuery = useProjectFundersQuery as jest.Mock;
  const mockUsePublishedTemplatesQuery = usePublishedTemplatesQuery as jest.Mock;
  const mockUseAddPlanMutation = useAddPlanMutation as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseAddPlanMutation.mockReturnValue([jest.fn()]);
  });

  afterEach(() => {
    jest.clearAllMocks()
  });

  it('should render PlanCreate component with funder checkbox', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByLabelText('labels.searchByKeyword')).toBeInTheDocument();
    expect(screen.getByText('helpText.searchHelpText')).toBeInTheDocument();
    expect(screen.getByText('buttons.search')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /checkbox.filterByFunderLabel/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /National Science Foundation \(nsf.gov\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Data Curation Centre/i })).toBeInTheDocument();
    expect(screen.getAllByText('buttons.select')).toHaveLength(3);
  });

  it('should display loading state', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: null }, loading: true, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: null }, loading: true, error: null });

    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: null }, loading: false, error: new Error('Error') });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: [] }, loading: false, error: null });

    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    expect(screen.getByText('messaging.error')).toBeInTheDocument();
  });

  it('should handle search input change', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    const searchInput = screen.getByLabelText('Template search');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');
  });

  it('should handle search button click', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    const searchInput = screen.getByLabelText('Template search');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const searchButton = screen.getByText('buttons.search');
    fireEvent.click(searchButton);
    expect(screen.getByText('messaging.noItemsFound')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });

    const { container } = render(
      <PlanCreate />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});