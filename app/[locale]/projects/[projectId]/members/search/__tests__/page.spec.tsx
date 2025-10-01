import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { useParams, useRouter } from 'next/navigation';
import { addProjectMemberAction } from '../actions';
import findCollaboratorMock from '../__mocks__/searchCollaboratorsMock.json';
import loadMoreCollaboratorsMock from '../__mocks__/loadMoreCollaboratorsMock.json';

import { axe, toHaveNoViolations } from 'jest-axe';

import {
  FindCollaboratorDocument,
} from '@/generated/graphql';

import ProjectsProjectMembersSearch from '../page';
import logECS from '@/utils/clientLogger';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('../actions', () => ({
  addProjectMemberAction: jest.fn()
}));

const mockRouter = {
  push: jest.fn(),
};

const mockAddProjectMemberAction = addProjectMemberAction as jest.MockedFunction<typeof addProjectMemberAction>;

const MOCKS = [
  {
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: null, // Start fresh search
          limit: 5,
        },
        term: "admin",
      },
    },
    result: {
      data: findCollaboratorMock,
    },
  },
  { //Empty search results
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: null, // Start fresh search
          limit: 5,
        },
        term: "gibberishxyz",
      },
    },
    result: {
      data: {
        findCollaborator: {
          __typename: "CollaboratorSearchResults",
          limit: 5,
          items: [],
          availableSortFields: [],
          nextCursor: null,
          totalCount: 0
        }
      },
    },
  },
  { //Load more results
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: "admin@stanford.edu5", // Cursor from previous result
          limit: 5,
        },
        term: "admin",
      },
    },
    result: {
      data: loadMoreCollaboratorsMock,
    },
  },
];

const ERROR_MOCKS = [
  {
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: null, // Start fresh search
          limit: 5,
        },
        term: "admin",
      },
    },
    result: {
      data: findCollaboratorMock,
    },
  },
  { //Load more results
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: "admin@stanford.edu5", // Cursor from previous result
          limit: 5,
        },
        term: "admin",
      },
    },
    error: new Error('Server Error')
  }
];

// Create a mock that throws an exception for the load more call
const NETWORK_ERROR_MOCKS = [
  {
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: null,
          limit: 5,
        },
        term: "admin",
      },
    },
    result: {
      data: findCollaboratorMock,
    },
  },
  {
    request: {
      query: FindCollaboratorDocument,
      variables: {
        options: {
          type: "CURSOR",
          cursor: "admin@stanford.edu5",
          limit: 5,
        },
        term: "admin",
      },
    },
    // Use networkError instead of throwing in result function to avoid unhandled rejection
    networkError: new Error('Network connection failed')
  },
];
describe('ProjectsProjectMembersSearch', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

    // Mock scrollIntoView for all elements
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: "6" });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock the addProjectMemberAction to return success
    mockAddProjectMemberAction.mockResolvedValue({
      success: true,
      redirect: '/en-US/projects/1/members',
      data: undefined,
      errors: []
    });
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title', async () => {
    render(
      <MockedProvider>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should render the search field with label and description', async () => {
    render(
      <MockedProvider>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    expect(screen.getByLabelText('searchLabel')).toBeInTheDocument();
    expect(screen.getByText("searchDescription")).toBeInTheDocument();
  });

  it('should execute search and displays results', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    // Check that specific affiliations are displayed
    expect(screen.getByText('California Digital Library')).toBeInTheDocument();

    // This text appears in both name and organization, so use getAllByText and check it exists
    const uniElements = screen.getAllByText('Universidade de São Paulo', { exact: false });
    expect(uniElements.length).toBeGreaterThan(0);

    expect(screen.getByText('United States Geological Survey')).toBeInTheDocument();

    expect(screen.getByTestId('search-load-more-btn')).toBeInTheDocument();
    expect(screen.getByText('links.clearFilter')).toBeInTheDocument();
  });

  it('should execute and load more items when "Load More" button is clicked', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    const loadMoreButton = screen.getByTestId('search-load-more-btn');
    fireEvent.click(loadMoreButton);

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(10); // Should display 10 results
    });
  });

  it('should log error if load more returns an error', async () => {
    render(
      <MockedProvider mocks={ERROR_MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    const loadMoreButton = screen.getByTestId('search-load-more-btn');
    fireEvent.click(loadMoreButton);

    // Wait for results to be rendered
    await waitFor(() => {
      expect(screen.getByText('messaging.errors.failedToLoadMoreCollaborators')).toBeInTheDocument();
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'handleSearchLoadMore',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/6/members/search' },
        })
      );
    });
  });

  it('should handle network errors in catch block during load more', async () => {

    render(
      <MockedProvider mocks={NETWORK_ERROR_MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5);
    });

    const loadMoreButton = screen.getByTestId('search-load-more-btn');
    fireEvent.click(loadMoreButton);

    // Wait for error to be caught in catch block
    await waitFor(() => {
      expect(screen.getByText('messaging.errors.failedToLoadMoreCollaborators')).toBeInTheDocument();
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'handleSearchLoadMore',
        expect.objectContaining({
          error: expect.any(Error),
          url: { path: '/en-US/projects/6/members/search' },
        })
      );
    });
  });

  it('should not run search whensearch button is clicked with an empty input', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.queryByText('headings.searchResultsHeader')).not.toBeInTheDocument();
    });
  });

  it('should clear search results when user clicks on clear filter', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    // Check that specific affiliations are displayed
    expect(screen.getByText('California Digital Library')).toBeInTheDocument();

    const clearFilterLink = screen.getByText('links.clearFilter');
    fireEvent.click(clearFilterLink);

    await waitFor(() => {
      // Should clear the search results
      expect(screen.queryByText('California Digital Library')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('search-load-more-btn')).not.toBeInTheDocument();
      expect(screen.queryByText('links.clearFilter')).not.toBeInTheDocument();
    });
  });

  it('should handle "Add" button click for a search result', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    // Find the first result by data-result-index="0"
    const firstResult = screen.getByTestId('result-0');
    expect(firstResult).toBeInTheDocument();

    // Find the Add button within the first result
    const addButton = within(firstResult).getByRole('button');
    fireEvent.click(addButton);

    await waitFor(() => {
      // Should redirect to the members page when successfully added
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/6/members');
    });
  });

  it('should display error addProjectMember response.success is false', async () => {
    // Override the mock for this specific test to return success: false
    mockAddProjectMemberAction.mockResolvedValueOnce({
      success: false,
      errors: ['Failed to add member'],
      data: undefined
    });

    render(
      <MockedProvider mocks={ERROR_MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    // Find the first result by data-result-index="0"
    const firstResult = screen.getByTestId('result-0');
    expect(firstResult).toBeInTheDocument();

    // Find the Add button within the first result
    const addButton = within(firstResult).getByRole('button');
    fireEvent.click(addButton);

    await waitFor(() => {
      // Should display error message
      expect(screen.getByText('messaging.errors.failedToAddProjectMember')).toBeInTheDocument();
    });
  });

  it('should display field-level errors returned in response', async () => {
    // Override the mock for this specific test to return success: true with errors
    mockAddProjectMemberAction.mockResolvedValueOnce({
      success: true,
      errors: [],
      data: {
        id: 31,
        givenName: 'NIH',
        surName: 'Admin',
        email: '',
        affiliation: {
          id: 1,
          name: 'Test Org',
          uri: 'https://ror.org/test'
        },
        orcid: null,
        errors: {
          general: 'Failed to add member',
        }
      }
    });

    render(
      <MockedProvider mocks={ERROR_MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5); // Should display 5 results as per the mock
    });

    // Find the first result by data-result-index="0"
    const firstResult = screen.getByTestId('result-0');
    expect(firstResult).toBeInTheDocument();

    // Find the Add button within the first result
    const addButton = within(firstResult).getByRole('button');
    fireEvent.click(addButton);

    await waitFor(() => {
      // Should display the field-level error message
      expect(screen.getByText('Failed to add member')).toBeInTheDocument();
    });
  });

  it('should display validation errors from addProjectMember response.data.errors', async () => {
    // Mock to return success: true but with validation errors in data.errors
    mockAddProjectMemberAction.mockResolvedValueOnce({
      success: true,
      data: {
        id: 31,
        givenName: 'NIH',
        surName: 'Admin',
        email: '',
        affiliation: {
          id: 1,
          name: 'Test Org',
          uri: 'https://ror.org/test'
        },
        orcid: null,
        errors: {
          email: 'User with this email already exists.'
        }
      }
    });

    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Enter search term and click search
    fireEvent.change(input, { target: { value: 'admin' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete and results to render
    await waitFor(() => {
      expect(screen.getByText('headings.searchResultsHeader')).toBeInTheDocument();
    });

    // Wait for results to be rendered
    await waitFor(() => {
      const results = screen.getAllByTestId(/result-/);
      expect(results.length).toBe(5);
    });

    // Find the first result and click Add button
    const firstResult = screen.getByTestId('result-0');
    const addButton = within(firstResult).getByRole('button');
    fireEvent.click(addButton);

    await waitFor(() => {
      // Should display the specific validation error
      expect(screen.getByText('User with this email already exists.')).toBeInTheDocument();
    });
  });

  it('should handle "Create collaborator" button click', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const createCollaboratorButton = screen.getByRole('button', { name: "buttons.createMember" });
    fireEvent.click(createCollaboratorButton);

    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/6/members/create');
    });
  });

  it('should display no results when search term returns empty', async () => {
    render(
      <MockedProvider mocks={MOCKS}>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const input = screen.getByLabelText('searchLabel');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Search for something that returns no results
    fireEvent.change(input, { target: { value: 'gibberishxyz' } });
    fireEvent.click(searchButton);

    // Wait for the GraphQL query to complete
    await waitFor(() => {
      // Should show the "no items found" message
      expect(screen.getByText('messaging.noItemsFound')).toBeInTheDocument();
    });

    // Should not show any search results
    expect(screen.queryByText('California Digital Library')).not.toBeInTheDocument();
    expect(screen.queryByTestId('result-0')).not.toBeInTheDocument();

    // Should not show "Load More" button since there are no results
    expect(screen.queryByTestId('search-load-more-btn')).not.toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
