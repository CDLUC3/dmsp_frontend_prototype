import { renderHook, act } from '@testing-library/react';
import { useAffiliationSearch } from '@/components/Form/TypeAheadWithOther';
import { useAffiliationsLazyQuery } from '@/generated/graphql';

// Mock debounce to run immediately instead of waiting 300ms
jest.mock('@/hooks/debounce', () => ({
  /* eslint-disable @typescript-eslint/no-explicit-any */
  debounce: (fn: any) => fn,
}));

jest.mock('@/generated/graphql', () => ({
  useAffiliationsLazyQuery: jest.fn(),
}));

describe('useAffiliationSearch', () => {
  let mockFetchAffiliations: jest.Mock;

  beforeEach(() => {
    mockFetchAffiliations = jest.fn();
    (useAffiliationsLazyQuery as jest.Mock).mockReturnValue([mockFetchAffiliations]);
  });

  it('should clear suggestions when term is empty', async () => {
    const { result } = renderHook(() => useAffiliationSearch());

    await act(async () => {
      result.current.handleSearch('');
    });

    expect(result.current.suggestions).toEqual([]);
    expect(mockFetchAffiliations).not.toHaveBeenCalled();
  });

  it('should call fetchAffiliations and set suggestions when data is returned', async () => {
    mockFetchAffiliations.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: 1, displayName: 'Test Org', uri: 'http://example.com' },
            null,
          ],
        },
      },
    });

    const { result } = renderHook(() => useAffiliationSearch());

    await act(async () => {
      result.current.handleSearch('Test');
    });

    expect(mockFetchAffiliations).toHaveBeenCalledWith({
      variables: { name: 'test' },
    });

    expect(result.current.suggestions).toEqual([
      { id: '1', displayName: 'Test Org', uri: 'http://example.com' },
    ]);
  });

  it('should set affiliation id to empty string if no id is passed in', async () => {
    mockFetchAffiliations.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: null, displayName: 'Test Org', uri: 'http://example.com' },
            null,
          ],
        },
      },
    });

    const { result } = renderHook(() => useAffiliationSearch());

    await act(async () => {
      result.current.handleSearch('Test');
    });

    expect(mockFetchAffiliations).toHaveBeenCalledWith({
      variables: { name: 'test' },
    });

    expect(result.current.suggestions).toEqual([
      { id: '', displayName: 'Test Org', uri: 'http://example.com' },
    ]);
  });

  it('should not update suggestions if data has no items', async () => {
    mockFetchAffiliations.mockResolvedValueOnce({
      data: { affiliations: { items: [] } },
    });

    const { result } = renderHook(() => useAffiliationSearch());

    await act(async () => {
      result.current.handleSearch('Another');
    });

    expect(result.current.suggestions).toEqual([]);
  });
});