import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    visibility: "PUBLIC",
    owner: {
      displayName: "National Science Foundation (nsf.gov)",
      uri: "http://nsf.gov"
    }
  },
  {
    bestPractice: false,
    description: "Arctic Data Center",
    id: "20",
    name: "Arctic Data Center: NSF Polar Programs",
    visibility: "PUBLIC",
    owner: {
      displayName: "National Science Foundation (nsf.gov)",
      uri: "http://nsf.gov"
    }
  },
  {
    bestPractice: false,
    description: "Develop data plans",
    id: "10",
    name: "Data Curation Centre",
    visibility: "PUBLIC",
    owner: {
      displayName: "National Institute of Health",
      uri: "http://nih.gov"
    }
  },
  {
    bestPractice: true,
    description: "Best Practice Template",
    id: "12",
    name: "Best Practice Template",
    visibility: "PUBLIC",
    owner: null
  },
]

const mockProjectFunders = [
  {
    id: 1,
    affiliation: {
      displayName: "National Science Foundation (nsf.gov)",
      uri: "http://nsf.gov"
    }
  },
  {
    id: 11,
    affiliation: {
      displayName: "National Science Foundation (nsf.gov)",
      uri: "http://nsf.gov"
    }
  },
  {
    id: 2,
    affiliation: {
      displayName: "National Institute of health",
      uri: "http://nih.gov"
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
    expect(screen.getByText('checkbox.filterByFunderDescription')).toBeInTheDocument();

    // We should have two checkboxes for project funders checked
    expect(screen.getByRole('checkbox', { name: /National Science Foundation \(nsf.gov\)/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /National Institute of Health/i })).toBeInTheDocument();
    // Expected three funder templates to display by default
    expect(screen.getByRole('heading', { level: 3, name: /Agency for Healthcare Research and Quality/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Arctic Data Center: NSF Polar Programs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Data Curation Centre/i })).toBeInTheDocument();
    // Should not show the best practice template on first load
    expect(screen.queryByRole('heading', { level: 3, name: /Best Practice Template/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('buttons.select')).toHaveLength(3);
  });

  it('should not display duplicate project funder checkboxes', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    // We should have just two checkboxes for project funders checked, even through projectFunders returns duplicates for National Science Foundation
    const NSFCheckbox = screen.getAllByRole('checkbox', { name: /National Science Foundation \(nsf.gov\)/i });
    expect(NSFCheckbox).toHaveLength(1);
    expect(screen.getByRole('checkbox', { name: /National Institute of Health/i })).toBeInTheDocument();
  });

  it('should sort correctly so that project funders are at the top of the list', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    // We should have just two checkboxes for project funders checked, even through projectFunders returns duplicates for National Science Foundation
    const funderCheckboxes = screen.getAllByRole('checkbox');
    // Uncheck initially checked project funder checkboxes
    fireEvent.click(funderCheckboxes[0]);
    fireEvent.click(funderCheckboxes[1]);

    await waitFor(() => {
      // It should now show the initial three templates before Load More button, with the project funder templates at the top
      const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
      expect(listItems).toHaveLength(3);
      expect(listItems[0]).toHaveTextContent(/Arctic Data Center/);
      expect(listItems[1]).toHaveTextContent(/Agency for Healthcare Research and Quality/);
      expect(listItems[2]).toHaveTextContent(/Data Curation Centre/);
    });
  });

  it('should not show any checkboxes if no project funders and no best practice', async () => {
    const mockTemplates = [
      {
        bestPractice: false,
        description: "Develop data plans",
        id: "10",
        name: "Data Curation Centre",
        visibility: "PUBLIC",
        owner: {
          displayName: "UC Davis",
          uri: "http://ucd.gov"
        }
      },
      {
        bestPractice: false,
        description: "Best Practice Template",
        id: "12",
        name: "Best Practice Template",
        visibility: "PUBLIC",
        owner: null
      },
    ]
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: [] }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    const funderCheckboxes = screen.queryAllByRole('checkbox');
    expect(funderCheckboxes).toHaveLength(0);
  });

  it('should display best practices template when no funder templates', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: [] }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    const funderCheckboxes = screen.queryAllByRole('checkbox');
    expect(funderCheckboxes).toHaveLength(1);
    const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent(/Best Practice Template/);
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

  it('should handle no items found in search', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    const searchInput = screen.getByLabelText('Template search');
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'test' } });
    // Click search button
    const searchButton = screen.getByText('buttons.search');
    fireEvent.click(searchButton);

    expect(searchInput).toHaveValue('test');

    // There should be no matches to the search for 'test'
    await waitFor(() => {
      const heading3 = screen.queryAllByRole('heading', { level: 3 });
      expect(heading3).toHaveLength(0);
      expect(screen.getByText('messaging.noItemsFound')).toBeInTheDocument();
    })

  });

  it('should return matching templates on search item', async () => {
    mockUseProjectFundersQuery.mockReturnValue({ data: { projectFunders: mockProjectFunders }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    const searchInput = screen.getByLabelText('Template search');
    // Enter matching search term
    fireEvent.change(searchInput, { target: { value: 'Arctic' } });
    // Click search button
    const searchButton = screen.getByText('buttons.search');
    fireEvent.click(searchButton);
    await waitFor(() => {
      // Should bring up this matching template
      expect(screen.getByRole('heading', { level: 3, name: /Arctic Data Center: NSF Polar Programs/i })).toBeInTheDocument();
    });
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