import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AffiliationSearchForGuidance from '../index';
import { useLazyQuery } from '@apollo/client/react';
import { ManagedAffiliationsWithGuidanceDocument } from '@/generated/graphql';

// Mock Apollo Client
jest.mock('@apollo/client/react', () => ({
  useLazyQuery: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'labels.nameSearch': 'Search by name',
      'placeholders.nameSearch': 'Enter organization name',
      'buttons.search': 'Search',
      'helpText.funderSearch': 'Search for organizations with guidance',
    };
    return translations[key] || key;
  }),
}));

const mockUseLazyQuery = jest.mocked(useLazyQuery);

describe('AffiliationSearchForGuidance', () => {
  let mockFetchManagedAffiliations: jest.Mock;
  let mockOnResults: jest.Mock;
  let mockOnSearchChange: jest.Mock;

  const mockSearchResults = {
    managedAffiliationsWithGuidance: {
      __typename: 'AffiliationSearchResults' as const,
      items: [
        {
          __typename: 'AffiliationSearch' as const,
          id: '1',
          uri: 'https://ror.org/03yrm5c26',
          displayName: 'California Digital Library',
          funder: false,
          acronyms: ['CDL'],
        },
      ],
      limit: 5,
      totalCount: 1,
      hasNextPage: false,
      hasPreviousPage: null,
      nextCursor: null,
    },
  };

  const defaultProps = {
    onResults: jest.fn(),
    moreTrigger: 0,
    limit: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFetchManagedAffiliations = jest.fn();
    mockOnResults = jest.fn();
    mockOnSearchChange = jest.fn();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    mockUseLazyQuery.mockReturnValue([
      mockFetchManagedAffiliations,
      { data: null, loading: false, error: undefined },
    ] as any);
  });

  describe('Rendering', () => {
    it('should render the search form with all elements', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      expect(screen.getByLabelText('Search by name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter organization name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
      expect(screen.getByText('Search for organizations with guidance')).toBeInTheDocument();
    });

    it('should initialize useLazyQuery with correct document', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      expect(mockUseLazyQuery).toHaveBeenCalledWith(
        ManagedAffiliationsWithGuidanceDocument,
        {}
      );
    });

    it('should render with custom limit prop', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} limit={10} />);

      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });
  });

  describe('Search input handling', () => {
    it('should update search term when typing', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'California');

      expect(searchInput).toHaveValue('California');
    });

    it('should call onSearchChange when typing', async () => {
      const user = userEvent.setup();
      render(
        <AffiliationSearchForGuidance
          {...defaultProps}
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'CDL');

      expect(mockOnSearchChange).toHaveBeenCalledTimes(3); // Once per character
      expect(mockOnSearchChange).toHaveBeenLastCalledWith('CDL');
    });

    it('should not call onSearchChange when callback is not provided', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test');

      // Should not throw error when onSearchChange is undefined
      expect(searchInput).toHaveValue('Test');
    });

    it('should clear input when value is deleted', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test');
      await user.clear(searchInput);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Search submission', () => {
    it('should trigger search query on form submit', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} onResults={mockOnResults} />);

      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: 'Clear search' });

      await user.type(searchInput, 'California');
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 5,
          },
          name: 'california', // Should be lowercased
        },
      });
    });

    it('should lowercase search term before submitting', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'UPPERCASE TEST');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 5,
          },
          name: 'uppercase test',
        },
      });
    });

    it('should not submit search when input is empty', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).not.toHaveBeenCalled();
    });

    it('should not submit search when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, '   ');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).not.toHaveBeenCalled();
    });

    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test{Enter}');

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 5,
          },
          name: 'test',
        },
      });
    });

    it('should use custom limit when provided', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} limit={10} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 10,
          },
          name: 'test',
        },
      });
    });
  });

  describe('Results handling', () => {
    it('should call onResults when data is received', async () => {
      // Set up mock to return data after search
      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: mockSearchResults, loading: false, error: undefined },
      ] as any);

      render(<AffiliationSearchForGuidance {...defaultProps} onResults={mockOnResults} />);

      // Wait for useEffect to process the data
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(
          mockSearchResults.managedAffiliationsWithGuidance,
          true // newSearch flag
        );
      });
    });

    it('should pass newSearch=true for initial search', async () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: mockSearchResults, loading: false, error: undefined },
      ] as any);

      render(<AffiliationSearchForGuidance {...defaultProps} onResults={mockOnResults} />);

      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(
          mockSearchResults.managedAffiliationsWithGuidance,
          true
        );
      });
    });

    it('should not call onResults when data is null', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: null, loading: false, error: undefined },
      ] as any);

      render(<AffiliationSearchForGuidance {...defaultProps} onResults={mockOnResults} />);

      expect(mockOnResults).not.toHaveBeenCalled();
    });

    it('should store nextCursor from results', async () => {
      const resultsWithCursor = {
        managedAffiliationsWithGuidance: {
          ...mockSearchResults.managedAffiliationsWithGuidance,
          nextCursor: 'cursor-123',
        },
      };

      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: resultsWithCursor, loading: false, error: undefined },
      ] as any);

      render(<AffiliationSearchForGuidance {...defaultProps} onResults={mockOnResults} />);

      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination (moreTrigger)', () => {
    it('should fetch more results when moreTrigger increases', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} />
      );

      // First search
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'California');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      // Simulate pagination trigger
      rerender(<AffiliationSearchForGuidance {...defaultProps} moreTrigger={1} />);

      await waitFor(() => {
        expect(mockFetchManagedAffiliations).toHaveBeenCalledTimes(2);
      });

      // Second call should use cursor
      expect(mockFetchManagedAffiliations).toHaveBeenLastCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            cursor: null, // No cursor initially
            limit: 5,
          },
          name: 'california',
        },
      });
    });

    it('should pass newSearch=false for pagination', async () => {
      // Setup with cursor in results
      const resultsWithCursor = {
        managedAffiliationsWithGuidance: {
          ...mockSearchResults.managedAffiliationsWithGuidance,
          nextCursor: 'cursor-123',
        },
      };

      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: resultsWithCursor, loading: false, error: undefined },
      ] as any);

      const { rerender } = render(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} onResults={mockOnResults} />
      );

      // Wait for initial data
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(
          resultsWithCursor.managedAffiliationsWithGuidance,
          true
        );
      });

      // Clear mock for pagination test
      mockOnResults.mockClear();

      // FIRST: Trigger moreTrigger change WITHOUT changing data yet
      rerender(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={1} onResults={mockOnResults} />
      );

      // Wait for moreTrigger effect to run and call fetchManagedAffiliations
      await waitFor(() => {
        expect(mockFetchManagedAffiliations).toHaveBeenCalledTimes(1);
      });

      // SECOND: Now update the mock to return new paginated data
      const paginatedResults = {
        managedAffiliationsWithGuidance: {
          ...mockSearchResults.managedAffiliationsWithGuidance,
          nextCursor: null,
        },
      };
      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: paginatedResults, loading: false, error: undefined },
      ] as any);

      // Force a re-render to pick up the new data
      rerender(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={1} onResults={mockOnResults} />
      );

      // Now wait for the data effect to process the paginated results
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(
          paginatedResults.managedAffiliationsWithGuidance,
          false // newSearch should be false for pagination
        );
      });
    });

    it('should use stored nextCursor for pagination', async () => {
      const user = userEvent.setup();

      const resultsWithCursor = {
        managedAffiliationsWithGuidance: {
          ...mockSearchResults.managedAffiliationsWithGuidance,
          nextCursor: 'cursor-abc-123',
        },
      };
      /* eslint-disable @typescript-eslint/no-explicit-any */
      mockUseLazyQuery.mockReturnValue([
        mockFetchManagedAffiliations,
        { data: resultsWithCursor, loading: false, error: undefined },
      ] as any);

      const { rerender } = render(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} onResults={mockOnResults} />
      );

      // Perform initial search
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      // Wait for results to be processed
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalled();
      });

      // Trigger pagination
      rerender(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={1} onResults={mockOnResults} />
      );

      await waitFor(() => {
        expect(mockFetchManagedAffiliations).toHaveBeenLastCalledWith({
          variables: {
            paginationOptions: {
              type: 'CURSOR',
              cursor: 'cursor-abc-123',
              limit: 5,
            },
            name: 'test',
          },
        });
      });
    });

    it('should not fetch when moreTrigger does not change', () => {
      const { rerender } = render(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} />
      );

      rerender(<AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} />);

      // The lazy query function should NOT be called (no fetch triggered)
      expect(mockFetchManagedAffiliations).not.toHaveBeenCalled();
    });

  });

  describe('Edge cases', () => {
    it('should handle multiple rapid searches', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: 'Clear search' });

      await user.type(searchInput, 'First');
      await user.click(searchButton);

      await user.clear(searchInput);
      await user.type(searchInput, 'Second');
      await user.click(searchButton);

      await user.clear(searchInput);
      await user.type(searchInput, 'Third');
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Test & Co. (2024)');

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 5,
          },
          name: 'test & co. (2024)',
        },
      });
    });

    it('should handle very long search terms', async () => {
      const user = userEvent.setup();
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const longSearchTerm = 'A'.repeat(500);
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, longSearchTerm);

      const searchButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(searchButton);

      expect(mockFetchManagedAffiliations).toHaveBeenCalledWith({
        variables: {
          paginationOptions: {
            type: 'CURSOR',
            limit: 5,
          },
          name: longSearchTerm.toLowerCase(),
        },
      });
    });

    it('should handle rapid moreTrigger changes', async () => {
      const { rerender } = render(
        <AffiliationSearchForGuidance {...defaultProps} moreTrigger={0} />
      );

      rerender(<AffiliationSearchForGuidance {...defaultProps} moreTrigger={1} />);
      rerender(<AffiliationSearchForGuidance {...defaultProps} moreTrigger={2} />);
      rerender(<AffiliationSearchForGuidance {...defaultProps} moreTrigger={3} />);

      await waitFor(() => {
        expect(mockFetchManagedAffiliations).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const searchField = screen.getByRole('searchbox');
      expect(searchField).toHaveAttribute('aria-label', 'Search funders');
      expect(searchField).toHaveAttribute('aria-describedby', 'search-help');
    });

    it('should have accessible form structure', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-labelledby', 'search-section');
    });

    it('should have visible label for search input', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      expect(screen.getByText('Search by name')).toBeInTheDocument();
    });

    it('should have help text for search input', () => {
      render(<AffiliationSearchForGuidance {...defaultProps} />);

      const helpText = screen.getByText('Search for organizations with guidance');
      expect(helpText).toHaveAttribute('id', 'search-help');
    });
  });
});