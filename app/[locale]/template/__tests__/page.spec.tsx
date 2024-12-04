import React from 'react';
import { render, screen, act, fireEvent } from '@/utils/test-utils';
import TemplateListPage from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  useTemplatesQuery,
} from '@/generated/graphql';

expect.extend(toHaveNoViolations);

jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`
}));

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useTemplatesQuery: jest.fn(),
}));

// Mock createApolloClient
jest.mock('@/lib/graphql/client/apollo-client', () => ({
  createApolloClient: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

jest.mock('@/components/TemplateListItem', () => {
  return {
    __esModule: true,
    default: ({ item }: TemplateListItemProps) => (
      <div data-testid="template-list-item" role="listitem">
        <h2>{item.title}</h2>
        <div>{item.content}</div>
      </div>
    ),
  };
});

const mockTemplateData = {
  templates: [{
    name: 'UCOP',
    description: 'University of California Office of the President',
    modified: '2024-11-20 00:00:00',
    id: 1,
    owner: null
  }]
}

// Helper function to cast to jest.Mock for TypeScript
/* eslint-disable @typescript-eslint/no-explicit-any*/
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useTemplatesQuery).mockReturnValue({ data: mockTemplateData, loading: false, error: undefined });
};

// mock the query response from client.query()
jest.mock('@/lib/graphql/client/apollo-client', () => ({
  createApolloClient: jest.fn(() => ({
    query: jest.fn().mockResolvedValueOnce({
      data: {
        templateVersions: [
          {
            name: 'UCOP',
            versionType: 'PUBLISHED',
            id: 1,
            modified: '1672531200000',
          },
        ],
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
interface TemplateListItemProps {
  item: {
    title: string;
    content: React.ReactNode;
  };
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
    // Create a mock scrollIntoView function 
    const mockScrollIntoView = jest.fn();
    // Add it to the Element prototype
    Element.prototype.scrollIntoView = mockScrollIntoView;
  });

  it('should render the page header with correct title and description', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    // Act: Query the h1 element
    const heading = screen.getByRole('heading', { level: 1 });

    // Assert: Check that its text content is correct
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
    expect(createLink).toHaveAttribute('href', '/template/create');
  });

  it('should render the search field with correct label and help text', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    //search for the translation key
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
    expect(templateItems).toHaveLength(1);
  });

  it('should render template items with correct titles', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    expect(screen.getByText('UCOP')).toBeInTheDocument();
    expect(screen.getByText('University of California Office of the President')).toBeInTheDocument();
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

    const homeLink = screen.getByRole('link', { name: 'breadcrumbHome' });
    const templatesLink = screen.getByRole('link', { name: 'title' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(templatesLink).toHaveAttribute('href', '/template');
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

    const searchInput = screen.getByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'testing' } });
    });

    expect(screen.getByText('There was an error.')).toBeInTheDocument();
  });

  it('should show filtered list when user clicks Search button', async () => {
    await act(async () => {
      render(
        <TemplateListPage />
      );
    });

    const searchInput = screen.getByLabelText(/searchLabel/i);
    expect(searchInput).toBeInTheDocument();

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'UCOP' } });
    });


    const searchButton = screen.getByLabelText('Clear search');
    fireEvent.click(searchButton);

    // Check that we can find list item for UCOP
    expect(screen.getByText('UCOP')).toBeInTheDocument();
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
});
