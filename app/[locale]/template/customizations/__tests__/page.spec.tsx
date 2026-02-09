import React from 'react';
import { act, fireEvent, render, screen, within, waitFor, cleanup } from '@/utils/test-utils';
import { MockedProvider } from '@apollo/client/testing/react';
import { InMemoryCache } from '@apollo/client';

import TemplateListCustomizationsPage from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  mocks,
  errorMock,
  multipleItemsMock,
  multipleItemsErrorMock,
  searchWithPaginationMock
} from '../__mocks__/customizableTemplates.mocks';

expect.extend(toHaveNoViolations);

// Mock useFormatter and useTranslations  next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)),
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

let apolloCache: InMemoryCache;
describe('TemplateListCustomizationsPage', () => {
  beforeEach(() => {
    // Create fresh cache for each test
    apolloCache = new InMemoryCache();
    // Prevent DOMException from scrollIntoView
    HTMLElement.prototype.scrollIntoView = jest.fn();

    // Prevent DOMException from focus
    HTMLElement.prototype.focus = jest.fn();
  });

  afterEach(async () => {
    // Flush pending Apollo microtasks (VERY IMPORTANT)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    jest.clearAllMocks();
    await apolloCache.reset();
    cleanup();
  })

  const renderPage = (apolloMocks: typeof mocks = mocks) => render(
    <MockedProvider
      mocks={apolloMocks}
      cache={apolloCache}
      defaultOptions={{
        query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
        watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
        mutate: { errorPolicy: 'all' }
      }}
    >
      <TemplateListCustomizationsPage />
    </MockedProvider>
  );

  it('should render the page header with correct title and description', async () => {
    renderPage();

    // MockedProvider requires await for requests to resolve
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');

    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('should render the search field with correct label and help text', async () => {

    renderPage();
    // MockedProvider requires await for requests to resolve
    // Searching for translation keys since cannot run next-intl for unit tests
    expect(screen.getByLabelText('searchLabel')).toBeInTheDocument();
    expect(screen.getByText('searchHelpText')).toBeInTheDocument();
  });

  it('should render the template list with correct number of items', async () => {

    renderPage();

    // Wait until the list renders with the right name
    const list = await waitFor(() => screen.getByRole('list', { name: 'templateList' }));
    expect(list).toBeInTheDocument();

    // MockedProvider requires await for requests to resolve
    const templateItems = await screen.findAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(2);
  });

  it('should render template items with correct metadata', async () => {
    renderPage();
    // MockedProvider requires await for requests to resolve
    expect(await screen.findByText('NSF-BIO: Biological Sciences')).toBeInTheDocument();
    expect(await screen.findByText('NSF-ENG: Engineering')).toBeInTheDocument();

    const templateData = screen.getAllByTestId('template-metadata');
    // First item should show customization metadata
    const lastCustomizedBy = within(templateData[0]).getByText(/templateStatus.lastCustomizedBy.*Test User/);
    const lastCustomized = within(templateData[0]).getByText(/templateStatus.lastCustomized.*01-01-2023/);
    const customizationStatus = within(templateData[0]).getByText(/templateStatus.customizationStatus.*templateStatus.published/i);

    expect(lastCustomizedBy).toBeInTheDocument();
    expect(lastCustomized).toBeInTheDocument();
    expect(customizationStatus).toBeInTheDocument();
  });

  it('should render the template list with correct ARIA role', async () => {
    renderPage();

    // Wait until the list renders with the right name
    const list = await waitFor(() => screen.getByRole('list', { name: 'templateList' }));
    expect(list).toBeInTheDocument();
    // Count children by data-testid
    // Wait for all template items to appear
    const templateItems = await screen.findAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(2); // or however many are in your mock
  })

  it('should render breadcrumbs with correct links', async () => {
    renderPage();

    // MockedProvider requires await for requests to resolve
    // Searching for translation keys since cannot run next-intl for unit tests
    const homeLink = await screen.findByRole('link', { name: 'breadcrumbs.home' });
    const templatesLink = await screen.findByRole('link', { name: 'breadcrumbs.templates' });

    expect(homeLink).toHaveAttribute('href', '/en-US');
    expect(templatesLink).toHaveAttribute('href', '/en-US/template');
  });

  it('should render error when graphql query returns as error', async () => {
    renderPage(errorMock);

    // MockedProvider requires await for requests to resolve
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });


  it('should reset filters when user clicks on \'clear filter\' ', async () => {
    renderPage();

    // Wait for initial list to render
    const initialItems = await screen.findAllByTestId('template-list-item');
    expect(initialItems.length).toBeGreaterThan(0);

    // Search for "biological" - wait a bit for button to be ready
    const searchInput = await screen.findByLabelText(/searchLabel/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'biological' } });
    });

    // Find button by text content (React Aria SearchField shows "buttons.search" text)
    const searchButton = await screen.findByText('buttons.search');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    // Wait for filtered results
    const filteredItems = await screen.findAllByTestId('template-list-item');
    // Should only show the biological sciences template
    expect(filteredItems.some(item => item.textContent?.includes('NSF-BIO: Biological Sciences'))).toBe(true);
    expect(filteredItems.some(item => item.textContent?.includes('NSF-ENG: Engineering'))).toBe(false);

    // Check that the clear filter button is present
    const clearFilterButton = await screen.findAllByText(/links.clearFilter/i);
    expect(clearFilterButton.length).toBeGreaterThan(0);

    // Click the clear filter button
    fireEvent.click(clearFilterButton[0]);

    // Should show all items again
    const allItemsAfterClear = await screen.findAllByTestId('template-list-item');
    expect(allItemsAfterClear.some(item => item.textContent?.includes('NSF-BIO: Biological Sciences'))).toBe(true);
    expect(allItemsAfterClear.some(item => item.textContent?.includes('NSF-ENG: Engineering'))).toBe(true);
  })

  it('should show error message when we cannot find item anything matching search term', async () => {
    renderPage();

    // MockedProvider requires await for requests to resolve
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');

    // MockedProvider requires await for requests to resolve

    const searchInput = await screen.findByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'test' } });


    const searchButton = await screen.findByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Check that we see the no items found message
    const errorElement = await screen.findByText('messaging.noItemsFound');
    expect(errorElement).toBeInTheDocument();

  })

  it('should display correct load more and remaining text when doing a search', async () => {
    renderPage(searchWithPaginationMock);

    // Searching for translation key since cannot run next-intl for unit tests
    const searchInput = await screen.findByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter search term that matches searchWithPaginationMock and trigger search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'biological' } });
    });

    // Find button by text content and click it
    const searchButton = await screen.findByText('buttons.search');
    await act(async () => {
      fireEvent.click(searchButton);
    });

    // Should show initial 1 item from search results
    const templateItems = await screen.findAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(1);

    const loadMoreButton = await screen.findByRole('button', { name: /loadMoreSearchResults/i });

    // Wrap click in act and wait for results
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    // Use waitFor to wait for the items to update
    await waitFor(() => {
      const templateItems2 = screen.getAllByTestId('template-list-item');
      expect(templateItems2).toHaveLength(2);
    });
  });


  it('should display correct load more and remaining text', async () => {
    renderPage(multipleItemsMock);

    // MockedProvider requires await for requests to resolve
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');

    // multipleItemsMock returns 3 items initially (LIMIT = 3)
    const templateItems = await screen.findAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(3);

    const loadMoreButton = await screen.findByRole('button', { name: /loadMoreTemplates/i });
    expect(loadMoreButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    // After loading more, should have 5 total items - wait for the items to update
    await waitFor(() => {
      const templateItems2 = screen.getAllByTestId('template-list-item');
      expect(templateItems2).toHaveLength(5);
    });
  });

  it('should display error if loadMore fetch returns error', async () => {
    renderPage(multipleItemsErrorMock);

    // Wait for initial items to render
    const templateItems = await screen.findAllByTestId('template-list-item');
    expect(templateItems.length).toBeGreaterThan(0);

    // Click "Load more" to trigger error
    const loadMoreButton = await screen.findByRole('button', { name: /loadMoreTemplates/i });
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    }, { timeout: 3000 });

  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MockedProvider
        mocks={mocks}
        cache={apolloCache}
        defaultOptions={{
          query: { fetchPolicy: 'no-cache' },
          watchQuery: { fetchPolicy: 'no-cache' },
        }}
      >
        <TemplateListCustomizationsPage />
      </MockedProvider>
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});