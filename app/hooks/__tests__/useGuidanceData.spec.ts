import { renderHook, waitFor } from '@testing-library/react';
import { useGuidanceData } from '../useGuidanceData';
import { useQuery } from '@apollo/client/react';
import {
  VersionedGuidanceDocument,
  PlanQuery,
  PlanVisibility,
  PlanStatus
} from '@/generated/graphql';
import { VersionedGuidanceGroup } from '@/app/types';

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

const mockUseQuery = jest.mocked(useQuery);

const createMockPlanData = (versionedSectionId: number): PlanQuery => ({
  __typename: 'Query',
  plan: {
    __typename: 'Plan',
    id: 1,
    visibility: 'PRIVATE' as PlanVisibility,
    status: 'ACTIVE' as PlanStatus,
    created: '2024-01-01T00:00:00Z',
    createdById: 1,
    modified: '2024-01-01T00:00:00Z',
    dmpId: 'test-dmp-123',
    registered: null,
    title: 'Test Plan',
    versionedTemplate: null,
    fundings: null,
    project: null,
    members: null,
    versionedSections: [
      {
        __typename: 'PlanSectionProgress',
        answeredQuestions: 0,
        displayOrder: 1,
        versionedSectionId,
        title: 'Test Section',
        totalQuestions: 5,
        tags: [
          {
            __typename: 'Tag',
            name: 'Storage & security',
            slug: 'storage-security',
            id: 1,
            description: 'Storage and security guidance',
          },
          {
            __typename: 'Tag',
            name: 'Data Collection',
            slug: 'data-collection',
            id: 3,
            description: 'Data collection guidance',
          },
        ],
      },
    ],
    progress: null,
    feedback: null,
  },
});

const mockGuidanceData: VersionedGuidanceGroup[] = [
  {
    tagId: 1,
    id: 1192,
    guidanceText: '<p>This is guidance for storage & security</p>',
    errors: {},
  },
  {
    tagId: 1,
    id: 1201,
    guidanceText: '<p>This is more guidance for storage & security</p>',
    errors: {},
  },
  {
    tagId: 3,
    id: 1200,
    guidanceText: '<p>This is guidance for data collection</p>',
    errors: {},
  },
];

const setupMocks = (guidanceData: VersionedGuidanceGroup[] = mockGuidanceData, loading = false) => {
  const stableGuidanceReturn = {
    data: {
      versionedGuidance: guidanceData,
    },
    loading,
    error: null,
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === VersionedGuidanceDocument) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return stableGuidanceReturn as any;
    }
    return {
      data: null,
      loading: false,
      error: undefined,
    };
  });
};

describe('useGuidanceData', () => {
  const defaultProps = {
    userAffiliationUri: 'https://ror.org/03yrm5c26',
    userAffiliationName: 'California Digital Library',
    userAffiliationAcronyms: ['CDL'],
    planData: createMockPlanData(123),
    versionedSectionId: '123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return initial values', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.sectionTagsMap).toBeDefined();
      expect(result.current.matchedGuidanceByOrg).toBeDefined();
      expect(result.current.guidanceLoading).toBeDefined();
      expect(result.current.currentSectionTagIds).toBeDefined();
    });

    it('should extract section tags from plan data', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.currentSectionTagIds).toHaveLength(2);
      expect(result.current.currentSectionTagIds[0]).toEqual({
        tagId: 1,
        tagName: 'Storage & security',
        tagSlug: 'storage-security',
        tagDescription: 'Storage and security guidance',
      });
      expect(result.current.currentSectionTagIds[1]).toEqual({
        tagId: 3,
        tagName: 'Data Collection',
        tagSlug: 'data-collection',
        tagDescription: 'Data collection guidance',
      });
    });

    it('should create sectionTagsMap from section tags', () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.sectionTagsMap).toEqual({
        1: 'Storage & security',
        3: 'Data Collection',
      });
    });
  });

  describe('Guidance data processing', () => {
    it('should fetch and process guidance data', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.matchedGuidanceByOrg).toHaveLength(1);
      expect(result.current.matchedGuidanceByOrg[0]).toMatchObject({
        orgURI: 'https://ror.org/03yrm5c26',
        orgName: 'California Digital Library',
        orgShortname: 'CDL',
      });
      expect(result.current.matchedGuidanceByOrg[0].items).toHaveLength(2);
    });

    it('should combine multiple guidance texts for the same tag', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      const storageItem = result.current.matchedGuidanceByOrg[0].items.find(
        (item) => item.id === 1
      );

      expect(storageItem?.guidanceText).toBe(
        '<p>This is guidance for storage & security</p><p>This is more guidance for storage & security</p>'
      );
    });

    it('should use organization shortname from acronyms', async () => {
      setupMocks();
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.matchedGuidanceByOrg[0].orgShortname).toBe('CDL');
    });

    it('should fallback to org name when no acronyms provided', async () => {
      setupMocks();
      const props = {
        ...defaultProps,
        userAffiliationAcronyms: null,
      };

      const { result } = renderHook(() => useGuidanceData(props));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.matchedGuidanceByOrg[0].orgShortname).toBe(
        'California Digital Library'
      );
    });
  });

  describe('Edge cases', () => {
    it('should return empty array when no guidance data exists', async () => {
      setupMocks([]);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.matchedGuidanceByOrg).toEqual([]);
    });

    it('should return empty array when userAffiliationUri is not provided', () => {
      setupMocks();
      const props = {
        ...defaultProps,
        userAffiliationUri: undefined,
      };

      const { result } = renderHook(() => useGuidanceData(props));

      expect(result.current.matchedGuidanceByOrg).toEqual([]);
    });

    it('should return empty array when userAffiliationName is not provided', async () => {
      setupMocks();
      const props = {
        ...defaultProps,
        userAffiliationName: undefined,
      };

      const { result } = renderHook(() => useGuidanceData(props));

      await waitFor(() => {
        expect(result.current.guidanceLoading).toBe(false);
      });

      expect(result.current.matchedGuidanceByOrg).toEqual([]);
    });

    it('should handle section not found in plan data', () => {
      setupMocks();
      const props = {
        ...defaultProps,
        versionedSectionId: '999',
      };

      const { result } = renderHook(() => useGuidanceData(props));

      expect(result.current.currentSectionTagIds).toEqual([]);
      expect(result.current.sectionTagsMap).toEqual({});
    });

    it('should handle undefined plan data', () => {
      setupMocks();
      const props = {
        ...defaultProps,
        planData: undefined,
      };

      const { result } = renderHook(() => useGuidanceData(props));

      expect(result.current.currentSectionTagIds).toEqual([]);
      expect(result.current.sectionTagsMap).toEqual({});
    });

    it('should handle loading state', () => {
      setupMocks(mockGuidanceData, true);
      const { result } = renderHook(() => useGuidanceData(defaultProps));

      expect(result.current.guidanceLoading).toBe(true);
    });
  });
});