import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@/utils/test-utils';
import TemplateListPage from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useTemplatesQuery, } from '@/generated/graphql';
import { mockScrollIntoView } from '@/__mocks__/common';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';

expect.extend(toHaveNoViolations);

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`
}));

// Mock the GraphQL hook for getting templates
jest.mock('@/generated/graphql', () => ({
  useTemplatesQuery: jest.fn(),
}));

// Mock createApolloClient
jest.mock('@/lib/graphql/client/apollo-client', () => ({
  createApolloClient: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

// Will pass this mock data back when query is made for templates
const mockTemplateData = {
  myTemplates: {
    items: [{
      name: 'UCOP',
      description: 'University of California Office of the President',
      modified: '2024-11-20 00:00:00',
      modifiedByName: 'Test User',
      visibility: 'ORGANIZATION',
      publishStatus: 'PUBLISHED',
      publishDate: '2024-11-20 00:00:00',
      id: 1,
      owner: null
    },
    {
      name: 'CDL',
      description: 'California Digital Library',
      modified: '2024-11-20 00:00:00',
      modifiedByName: 'Test User',
      visibility: 'ORGANIZATION',
      publishStatus: 'PUBLISHED',
      publishDate: '2024-11-20 00:00:00',
      id: 1,
      owner: null
    }]
  }
}

// Helper function to cast to jest.Mock for TypeScript
/* eslint-disable @typescript-eslint/no-explicit-any*/
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  // Return mocked data when graphql query is called for templates
  mockHook(useTemplatesQuery).mockReturnValue({ data: mockTemplateData, loading: false, error: undefined });
};

// mock the query response from client.query() for versionedTemplates
jest.mock('@/lib/graphql/client/apollo-client', () => ({
  createApolloClient: jest.fn(() => ({
    query: jest.fn().mockResolvedValueOnce({
      data: {
        templateVersions: {
          items: [
            {
              name: 'UCOP',
              versionType: 'PUBLISHED',
              id: 1,
              modified: '1672531200000',
            },
          ],
        }
      },
    }),
  })),
}));

interface PageHeaderProps {
  title: string;
  description: string;
  actions: React.ReactNode;
  breadcrumbs: React.ReactNode;
}

jest.mock('@/components/PageHeader', () => {
  return {
    __esModule: true,
    default: ({ title, description, actions, breadcrumbs }: PageHeaderProps) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="header-actions">{actions}</div>
        <div data-testid="breadcrumbs">{breadcrumbs}</div>
      </div>
    ),
  };
});


describe('TemplateListPage', () => {
  beforeEach(() => {
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  });

  it('should render the page header with correct title and description', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toHaveTextContent('title');
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('should render the create template link in header actions', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const createLink = screen.getByText('actionCreate');
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute('href', '/en-US/template/create');
  });

  it('should render the search field with correct label and help text', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    // Searching for translation keys since cannot run next-intl for unit tests
    expect(screen.getByLabelText('searchLabel')).toBeInTheDocument();
    expect(screen.getByText('searchHelpText')).toBeInTheDocument();
  });

  it('should render the template list with correct number of items', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const templateItems = screen.getAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(2);
  });

  it('should render template items with correct titles', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    expect(screen.getByText('UCOP')).toBeInTheDocument();
    const templateData = screen.getAllByTestId('template-metadata');
    const lastRevisedBy = within(templateData[0]).getByText(/lastRevisedBy.*Test User/);
    const lastUpdated = within(templateData[0]).getByText(/lastUpdated.*01-01-2023/);
    const publishStatus = within(templateData[0]).getByText(/published/);
    const visibility = within(templateData[0]).getByText(/visibility.*Organization/);
    expect(lastRevisedBy).toBeInTheDocument();
    expect(publishStatus).toBeInTheDocument();
    expect(lastUpdated).toBeInTheDocument();
    expect(visibility).toBeInTheDocument();
  });

  it('should render the template list with correct ARIA role', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const list = screen.getByRole('list', { name: 'Template list' });
    expect(list).toHaveClass('template-list');
  });

  it('should render breadcrumbs with correct links', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    // Searching for translation keys since cannot run next-intl for unit tests
    const homeLink = screen.getByRole('link', { name: 'breadcrumbs.home' });
    const templatesLink = screen.getByRole('link', { name: 'breadcrumbs.templates' });

    expect(homeLink).toHaveAttribute('href', '/en-US');
    expect(templatesLink).toHaveAttribute('href', '/en-US/template');
  });

  it('should render errors', async () => {
    // Clear previous mock and set up new mock specifically for this test
    mockHook(useTemplatesQuery).mockClear();
    mockHook(useTemplatesQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: 'There was an error.' },
      refetch: jest.fn()
    });

    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    // Searching for translation key since cannot run next-intl for unit tests
    const searchInput = screen.getByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'testing' } });
    });

    expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
  });


  it('should reset filters when user clicks on \'clear fitler\' ', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    // Searching for translation key since cannot run next-intl for unit tests
    const searchInput = screen.getByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'UCOP' } });
    });

    // Click the Search button
    await waitFor(() => {
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
    });

    // Newly filtered list should only show UCOP
    expect(screen.getByText('UCOP')).toBeInTheDocument();
    expect(screen.queryByText('CDL')).not.toBeInTheDocument();
    // Check that the clear filter button is present
    const clearFilterButton = screen.getByText(/clearFilter/i);
    expect(clearFilterButton).toBeInTheDocument();
    // Click the clear filter button
    fireEvent.click(clearFilterButton);
    // Check that the search input is cleared
    expect(searchInput).toHaveValue('');
    // Check that both items are now visible again
    expect(screen.getByText('UCOP')).toBeInTheDocument();
    expect(screen.getByText('CDL')).toBeInTheDocument();
  })

  it('should show error message when we cannot find item that matches search term', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const searchInput = screen.getByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter search term that cannot be found
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } });
    });


    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Check that we can find list item for UCOP
    const errorElement = screen.getByText('noItemsFoundError');
    expect(errorElement).toBeInTheDocument();
  })

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <TemplateListPage />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });

  it('should display correct load more and remaining text', async () => {
    // Five templates in mock
    const mockTemplates = [
      { name: 'A', id: 1 }, { name: 'B', id: 2 }, { name: 'C', id: 3 },
      { name: 'D', id: 4 }, { name: 'E', id: 5 }
    ].map((t, i) => ({
      ...t,
      description: '',
      modified: '',
      modifiedByName: '',
      visibility: '',
      publishStatus: '',
      publishDate: '',
      owner: null,
      ownerDisplayName: '',
      isDirty: false,
    }));

    mockHook(useTemplatesQuery).mockReturnValue({
      data: { myTemplates: { items: mockTemplates } },
      loading: false,
      error: undefined
    });

    await act(async () => {
      render(<TemplateListPage />);
    });

    // By default, visibleCount is 3, so loadMoreNumber = 2, currentlyDisplayed = 3, totalAvailable = 5
    // The button should show the correct label (for 2 more)
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument();

    const loadMoreButton = screen.getByRole('button', { name: /loadMore/i });
    await act(async () => {
      fireEvent.click(loadMoreButton);
    }
    );
    const templateItems = screen.getAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(5);

  });
});
