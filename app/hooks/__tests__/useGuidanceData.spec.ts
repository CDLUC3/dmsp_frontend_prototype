import { renderHook, waitFor } from '@testing-library/react';
import { useGuidanceData } from '../useGuidanceData';
import { useQuery } from '@apollo/client/react';
import { GuidanceSourcesForPlanDocument, GuidanceSourceType } from '@/generated/graphql';

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = jest.mocked(useQuery);
const mockRefetch = jest.fn();

const mockGuidanceSourcesData = {
  guidanceSourcesForPlan: [
    {
      orgURI: null,
      label: 'DMP Tool',
      shortName: 'DMP Tool',
      type: GuidanceSourceType.BestPractice,
      items: [
        {
          id: 1,
          title: 'Storage & security',
          guidanceText: '<p>This is best practice guidance for storage & security</p>',
        },
        {
          id: 3,
          title: 'Data Collection',
          guidanceText: '<p>This is best practice guidance for data collection</p>',
        },
      ],
    },
    {
      orgURI: 'https://ror.org/03yrm5c26',
      label: 'California Digital Library',
      shortName: 'CDL',
      type: GuidanceSourceType.UserAffiliation,
      items: [
        {
          id: 1,
          title: 'Storage & security',
          guidanceText: '<p>This is CDL guidance for storage & security</p>',
        },
        {
          id: 3,
          title: 'Data Collection',
          guidanceText: '<p>This is CDL guidance for data collection</p>',
        },
      ],
    },
    {
      orgURI: 'https://ror.org/04xm1d337',
      label: 'National Science Foundation',
      shortName: 'NSF',
      type: GuidanceSourceType.TemplateOwner,
      items: [
        {
          id: 1,
          title: 'Storage & security',
          guidanceText: '<p>This is NSF guidance for storage & security</p>',
        },
      ],
    },
  ],
};

type GuidanceItem = {
  id: number | null | undefined;
  title: string | null | undefined;
  guidanceText: string;
};

type GuidanceSource = {
  orgURI: string | null;
  label: string;
  shortName: string;
  type: GuidanceSourceType;
  items: GuidanceItem[];
};

type MockGuidanceDataVariant =
  | { guidanceSourcesForPlan: GuidanceSource[] }
  | { guidanceSourcesForPlan: null }
  | null
  | undefined;

const setupMocks = (
  guidanceData: MockGuidanceDataVariant = mockGuidanceSourcesData,
  loading = false,
  error = null
) => {
  const stableGuidanceReturn = {
    data: guidanceData,
    loading,
    error,
    refetch: mockRefetch,
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === GuidanceSourcesForPlanDocument) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return stableGuidanceReturn as any;
    }
    return {
      data: null,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    };
  });
};

describe('useGuidanceData', () => {
  const defaultProps = {
    planId: 123,
    versionedSectionId: 456,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return initial values', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.sectionTagsMap).toBeDefined();
      expect(result.current.guidanceItems).toBeDefined();
      expect(result.current.guidanceLoading).toBeDefined();
      expect(result.current.refetchGuidance).toBeDefined();
    });

    it('should create sectionTagsMap from guidance data', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.sectionTagsMap).toEqual({
        1: 'Storage & security',
        3: 'Data Collection',
      });
    });

    it('should transform guidance sources to component format', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toHaveLength(3);

      // Check best practice source
      expect(result.current.guidanceItems[0]).toMatchObject({
        orgURI: null,
        orgName: 'DMP Tool',
        orgShortname: 'DMP Tool',
        type: GuidanceSourceType.BestPractice,
      });
      expect(result.current.guidanceItems[0].items).toHaveLength(2);

      // Check CDL source
      expect(result.current.guidanceItems[1]).toMatchObject({
        orgURI: 'https://ror.org/03yrm5c26',
        orgName: 'California Digital Library',
        orgShortname: 'CDL',
        type: GuidanceSourceType.UserAffiliation,
      });
      expect(result.current.guidanceItems[1].items).toHaveLength(2);

      // Check NSF source
      expect(result.current.guidanceItems[2]).toMatchObject({
        orgURI: 'https://ror.org/04xm1d337',
        orgName: 'National Science Foundation',
        orgShortname: 'NSF',
        type: GuidanceSourceType.TemplateOwner,
      });
      expect(result.current.guidanceItems[2].items).toHaveLength(1);
    });

    it('should map guidance items correctly', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      const bestPracticeItems = result.current.guidanceItems[0].items;

      expect(bestPracticeItems[0]).toEqual({
        id: 1,
        title: 'Storage & security',
        guidanceText: '<p>This is best practice guidance for storage & security</p>',
      });

      expect(bestPracticeItems[1]).toEqual({
        id: 3,
        title: 'Data Collection',
        guidanceText: '<p>This is best practice guidance for data collection</p>',
      });
    });

    it('should expose refetch function', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.refetchGuidance).toBe(mockRefetch);

      result.current.refetchGuidance();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query variables', () => {
    it('should pass planId and versionedSectionId to query', () => {
      setupMocks();
      renderHook(() =>
        useGuidanceData({
          planId: 123,
          versionedSectionId: 456,
        })
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        GuidanceSourcesForPlanDocument,
        expect.objectContaining({
          variables: {
            planId: 123,
            versionedSectionId: 456,
            versionedQuestionId: undefined,
          },
        })
      );
    });

    it('should pass versionedQuestionId when provided', () => {
      setupMocks();
      renderHook(() =>
        useGuidanceData({
          planId: 123,
          versionedQuestionId: 789,
        })
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        GuidanceSourcesForPlanDocument,
        expect.objectContaining({
          variables: {
            planId: 123,
            versionedSectionId: undefined,
            versionedQuestionId: 789,
          },
        })
      );
    });

    it('should skip query when planId is falsy', () => {
      setupMocks();
      renderHook(() =>
        useGuidanceData({
          planId: 0,
          versionedSectionId: 456,
        })
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        GuidanceSourcesForPlanDocument,
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('should not skip query when planId is provided', () => {
      setupMocks();
      renderHook(() =>
        useGuidanceData({
          planId: 123,
          versionedSectionId: 456,
        })
      );

      expect(mockUseQuery).toHaveBeenCalledWith(
        GuidanceSourcesForPlanDocument,
        expect.objectContaining({
          skip: false,
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('should return empty array when no guidance data exists', async () => {
      setupMocks({ guidanceSourcesForPlan: [] });
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toEqual([]);
      expect(result.current.sectionTagsMap).toEqual({});
    });

    it('should return empty array when guidanceSourcesForPlan is null', async () => {
      setupMocks({ guidanceSourcesForPlan: null });
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      setupMocks(null);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toEqual([]);
      expect(result.current.sectionTagsMap).toEqual({});
    });

    it('should handle loading state', () => {
      setupMocks(mockGuidanceSourcesData, true);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.guidanceLoading).toBe(true);
    });

    it('should handle items with null or undefined id', async () => {
      const dataWithNullIds = {
        guidanceSourcesForPlan: [
          {
            orgURI: null,
            label: 'Test Org',
            shortName: 'TO',
            type: GuidanceSourceType.BestPractice,
            items: [
              {
                id: null,
                title: 'Test Title',
                guidanceText: '<p>Test guidance</p>',
              },
              {
                id: undefined,
                title: null,
                guidanceText: '<p>Another test</p>',
              },
            ],
          },
        ],
      };

      setupMocks(dataWithNullIds);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems[0].items).toEqual([
        {
          id: undefined,
          title: 'Test Title',
          guidanceText: '<p>Test guidance</p>',
        },
        {
          id: undefined,
          title: undefined,
          guidanceText: '<p>Another test</p>',
        },
      ]);

      // Should not include items with null/undefined ids in sectionTagsMap
      expect(result.current.sectionTagsMap).toEqual({});
    });

    it('should handle empty items array', async () => {
      const dataWithEmptyItems = {
        guidanceSourcesForPlan: [
          {
            orgURI: 'https://ror.org/test',
            label: 'Test Org',
            shortName: 'TO',
            type: GuidanceSourceType.BestPractice,
            items: [],
          },
        ],
      };

      setupMocks(dataWithEmptyItems);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toHaveLength(1);
      expect(result.current.guidanceItems[0].items).toEqual([]);
    });
  });

  describe('Multiple sources', () => {
    it('should handle multiple guidance sources', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.guidanceItems).toHaveLength(3);
      expect(result.current.guidanceItems.map((item) => item.orgName)).toEqual([
        'DMP Tool',
        'California Digital Library',
        'National Science Foundation',
      ]);
    });

    it('should include all items from all sources in sectionTagsMap', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      // Should have all unique tag IDs from all sources
      expect(Object.keys(result.current.sectionTagsMap).length).toBe(2);
      expect(result.current.sectionTagsMap[1]).toBe('Storage & security');
      expect(result.current.sectionTagsMap[3]).toBe('Data Collection');
    });
  });

  describe('Hook stability', () => {
    it('should return stable references when data does not change', () => {
      setupMocks();
      const { result, rerender } = renderHook(() => useGuidanceData(defaultProps));

      const firstGuidanceItems = result.current.guidanceItems;
      const firstSectionTagsMap = result.current.sectionTagsMap;

      rerender();

      expect(result.current.guidanceItems).toBe(firstGuidanceItems);
      expect(result.current.sectionTagsMap).toBe(firstSectionTagsMap);
    });

    it('should update when guidance data changes', async () => {
      setupMocks();
      const { result, rerender } = renderHook(() => useGuidanceData(defaultProps));

      const firstGuidanceItems = result.current.guidanceItems;

      // Update mock with different data
      const newData = {
        guidanceSourcesForPlan: [
          {
            orgURI: null,
            label: 'New Org',
            shortName: 'NO',
            type: GuidanceSourceType.BestPractice,
            items: [
              {
                id: 999,
                title: 'New Guidance',
                guidanceText: '<p>New guidance text</p>',
              },
            ],
          },
        ],
      };
      setupMocks(newData);

      rerender();

      await waitFor(() => {
        expect(result.current.guidanceItems).not.toBe(firstGuidanceItems);
      });

      expect(result.current.guidanceItems).toHaveLength(1);
      expect(result.current.guidanceItems[0].orgName).toBe('New Org');
    });
  });
});