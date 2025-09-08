import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PlanCreate from '../page';
import { useParams, useRouter } from 'next/navigation';
import {
  useAddPlanMutation,
  useProjectFundingsQuery,
  usePublishedTemplatesQuery
} from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from '@/__mocks__/common';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/generated/graphql', () => ({
  useProjectFundingsQuery: jest.fn(),
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



const mockPublishedTemplates = {
  items: [
    {
      bestPractice: false,
      description: "Template 1",
      id: "1",
      name: "Agency for Healthcare Research and Quality",
      visibility: "PUBLIC",
      ownerDisplayName: "National Science Foundation (nsf.gov)",
      ownerURI: "http://nsf.gov",
      modifiedByName: "John Doe",
    },
    {
      bestPractice: false,
      description: "Arctic Data Center",
      id: "20",
      name: "Arctic Data Center: NSF Polar Programs",
      visibility: "PUBLIC",
      ownerDisplayName: "National Science Foundation (nsf.gov)",
      ownerURI: "http://nsf.gov",
      modified: "2021-10-25 18:42:37",
      modifiedByName: 'John Doe'
    },
    {
      bestPractice: false,
      description: "Develop data plans",
      id: "10",
      name: "Data Curation Centre",
      visibility: "PUBLIC",
      ownerDisplayName: "National Institute of Health",
      ownerURI: "http://nih.gov",
      modified: "2021-10-25 18:42:37",
      modifiedByName: 'John Doe'
    },
    {
      bestPractice: false,
      description: "Develop data plans",
      id: "40",
      name: "Practice Template",
      visibility: "PUBLIC",
      ownerDisplayName: "National Institute of Health",
      ownerURI: "http://nih.gov"
    },
    {
      bestPractice: false,
      description: "Develop data plans",
      id: "50",
      name: "Detailed DMP Template",
      visibility: "PUBLIC",
      ownerDisplayName: "National Institute of Health",
      ownerURI: "http://nih.gov"
    },
    {
      bestPractice: true,
      description: "Best Practice Template",
      id: "12",
      name: "Best Practice Template",
      visibility: "PUBLIC",
      ownerDisplayName: null,
      ownerURI: null,
      modified: "2021-10-25 18:42:37",
      modifiedByName: 'John Doe'
    },
  ]
}

const mockProjectFundings = [
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
  const mockUseProjectFundingsQuery = useProjectFundingsQuery as jest.Mock;
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
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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
    // Expected three funder templates to display by default
    expect(screen.getByRole('heading', { level: 3, name: /Agency for Healthcare Research and Quality/i })).toBeInTheDocument();
    const templateData = screen.getAllByTestId('template-metadata');
    const lastRevisedBy1 = within(templateData[0]).getByText(/lastRevisedBy.*John Doe/);
    const publishStatus1 = within(templateData[0]).getByText('published');
    const visibility1 = within(templateData[0]).getByText(/visibility.*Public/);
    expect(lastRevisedBy1).toBeInTheDocument();
    expect(publishStatus1).toBeInTheDocument();
    expect(visibility1).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Arctic Data Center: NSF Polar Programs/i })).toBeInTheDocument();
    const lastRevisedBy2 = within(templateData[1]).getByText(/lastRevisedBy.*John Doe/);
    const lastUpdated2 = within(templateData[1]).getByText(/lastUpdated.*01-01-2023/);
    const publishStatus2 = within(templateData[1]).getByText('published');
    const visibility2 = within(templateData[1]).getByText(/visibility.*Public/);
    expect(lastRevisedBy2).toBeInTheDocument();
    expect(lastUpdated2).toBeInTheDocument();
    expect(publishStatus2).toBeInTheDocument();
    expect(visibility2).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Data Curation Centre/i })).toBeInTheDocument();
    const lastRevisedBy3 = within(templateData[2]).getByText(/lastRevisedBy.*John Doe/);
    const lastUpdated3 = within(templateData[2]).getByText(/lastUpdated.*01-01-2023/);
    const publishStatus3 = within(templateData[2]).getByText('published');
    const visibility3 = within(templateData[2]).getByText(/visibility.*Public/);
    expect(lastRevisedBy3).toBeInTheDocument();
    expect(lastUpdated3).toBeInTheDocument();
    expect(publishStatus3).toBeInTheDocument();
    expect(visibility3).toBeInTheDocument();
    // Should not show the best practice template on first load
    expect(screen.queryByRole('heading', { level: 3, name: /Best Practice Template/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('buttons.select')).toHaveLength(5);
  });

  it('should not display duplicate project funder checkboxes', async () => {
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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
    await waitFor(() => {
      // It should now show the initial three templates before Load More button, with the project funder templates at the top
      const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
      expect(listItems).toHaveLength(3);
      expect(listItems[0]).toHaveTextContent(/Data Curation Centre/);
      const heading = within(listItems[1]).getByRole('heading', { name: /Practice Template/ });
      expect(heading).toBeInTheDocument();
      const heading2 = within(listItems[2]).getByRole('heading', { name: /Detailed DMP Template/ });
      expect(heading2).toBeInTheDocument();
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
        ownerDisplayName: "UC Davis",
        ownerURI: "http://ucd.gov"
      },
      {
        bestPractice: false,
        description: "Best Practice Template",
        id: "12",
        name: "Best Practice Template",
        ownerDisplayName: 'NIH',
        visibility: "PUBLIC",
        owner: null
      },
    ]
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: [] }, loading: false, error: null });
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
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: [] }, loading: false, error: null });
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

  it('should display best practices template when there are no matching templates', async () => {
    const mockPublishedTemplates2 = {
      items: [
        {
          bestPractice: false,
          description: "Template 1",
          id: "1",
          name: "Agency for Healthcare Research and Quality",
          visibility: "PUBLIC",
          ownerDisplayName: "National Science Foundation (nsf.gov)",
          ownerURI: "http://random.gove"
        },
        {
          bestPractice: true,
          description: "Best Practice Template",
          id: "12",
          name: "Best Practice Template",
          visibility: "PUBLIC",
          ownerDisplayName: 'NIH',
          ownerURI: null
        },
      ]
    }
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: [] }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates2 }, loading: false, error: null });
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
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: null }, loading: true, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: null }, loading: true, error: null });

    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: null }, loading: false, error: new Error('Error') });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: [] }, loading: false, error: null });

    await act(async () => {
      render(
        <PlanCreate />
      );
    });
    expect(screen.getByText('messaging.error')).toBeInTheDocument();
  });

  it('should handle no items found in search', async () => {
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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

  it('should handle Load More functionality', async () => {
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
    mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
    await act(async () => {
      render(
        <PlanCreate />
      );
    });

    // Get all checkboxes with name="funders"
    const funderCheckboxes = screen.getAllByRole('checkbox').filter(
      (checkbox) => checkbox.getAttribute('name') === 'funders'
    );

    // Uncheck each one if it's checked
    for (const checkbox of funderCheckboxes) {
      if ((checkbox as HTMLInputElement).checked) {
        await act(async () => {
          fireEvent.click(checkbox);
        });
        expect((checkbox as HTMLInputElement).checked).toBe(false); // Confirm it's unchecked
      }
    }

    const loadMoreButton = screen.getByRole('button', { name: /buttons.loadMore/i });
    await waitFor(() => {
      // Should bring up this matching template
      expect(loadMoreButton).toBeInTheDocument();
      fireEvent.click(loadMoreButton);
    });

    const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
    expect(listItems).toHaveLength(6);
  });


  it('should pass axe accessibility test', async () => {
    mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
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
