import { CustomizableTemplatesDocument } from '@/generated/graphql';

// Mock data for customizable templates
export const mocks = [
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'NSF-BIO: Biological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 2,
              versionedTemplateId: 619,
              name: 'NSF-ENG: Engineering',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-02T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: null,
              isDirty: null,
              templateModified: '2023-11-01T00:00:00Z',
            },
          ],
          nextCursor: "cursor-1",
          totalCount: 2,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
        term: 'biological',
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'NSF-BIO: Biological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
          ],
          nextCursor: "cursor-1",
          totalCount: 1,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
        term: 'test',
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [],
          nextCursor: "cursor-1",
          totalCount: 0,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'NSF-BIO: Biological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 2,
              versionedTemplateId: 619,
              name: 'NSF-ENG: Engineering',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-02T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: null,
              isDirty: null,
              templateModified: '2023-11-01T00:00:00Z',
            },
          ],
          nextCursor: "cursor-1",
          totalCount: 2,
        },
      },
    },
  },
];

// Mock with multiple items for pagination testing
export const multipleItemsMock = [
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'Template 1',
              affiliationName: 'Funder 1',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'User 1',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 2,
              versionedTemplateId: 619,
              name: 'Template 2',
              affiliationName: 'Funder 2',
              lastCustomized: '2024-01-02T00:00:00Z',
              lastCustomizedByName: 'User 2',
              migrationStatus: 'OK',
              isDirty: true,
              templateModified: '2023-12-02T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 3,
              versionedTemplateId: 620,
              name: 'Template 3',
              affiliationName: 'Funder 3',
              lastCustomized: '2024-01-03T00:00:00Z',
              lastCustomizedByName: 'User 3',
              migrationStatus: 'STALE',
              isDirty: false,
              templateModified: '2023-12-03T00:00:00Z',
            },
          ],
          nextCursor: 'cursor-1',
          totalCount: 5,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: 'cursor-1',
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 4,
              versionedTemplateId: 621,
              name: 'Template 4',
              affiliationName: 'Funder 4',
              lastCustomized: '2024-01-04T00:00:00Z',
              lastCustomizedByName: 'User 4',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-04T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 5,
              versionedTemplateId: 622,
              name: 'Template 5',
              affiliationName: 'Funder 5',
              lastCustomized: '2024-01-05T00:00:00Z',
              lastCustomizedByName: 'User 5',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-05T00:00:00Z',
            },
          ],
          nextCursor: "cursor-1",
          totalCount: 5,
        },
      },
    },
  },
];

// Mock with search results and pagination
export const searchWithPaginationMock = [
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'NSF-BIO: Biological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 2,
              versionedTemplateId: 619,
              name: 'NSF-ENG: Engineering',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-02T00:00:00Z',
              lastCustomizedByName: 'Test User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-11-01T00:00:00Z',
            },
          ],
          nextCursor: 'cursor-1',
          totalCount: 2,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
        term: 'biological',
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'NSF-BIO: Biological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'Bio User',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
          ],
          nextCursor: 'search-cursor-1',
          totalCount: 2,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: 'search-cursor-1',
          limit: 5,
        },
        term: 'biological',
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 2,
              versionedTemplateId: 619,
              name: 'NSF-GEO: Biological and Geological Sciences',
              affiliationName: 'National Science Foundation',
              lastCustomized: '2024-01-02T00:00:00Z',
              lastCustomizedByName: 'Geo User',
              migrationStatus: 'OK',
              isDirty: true,
              templateModified: '2023-12-02T00:00:00Z',
            },
          ],
          nextCursor: 'search-cursor-2',
          totalCount: 2,
        },
      },
    },
  },
];

// Mock with error on load more
export const multipleItemsErrorMock = [
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    result: {
      data: {
        customizableTemplates: {
          __typename: 'PaginatedCustomizedTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizedTemplatesSearchResult',
              templateCustomizationId: 1,
              versionedTemplateId: 618,
              name: 'Template 1',
              affiliationName: 'Funder 1',
              lastCustomized: '2024-01-01T00:00:00Z',
              lastCustomizedByName: 'User 1',
              migrationStatus: 'OK',
              isDirty: false,
              templateModified: '2023-12-01T00:00:00Z',
            },
          ],
          nextCursor: 'error-cursor',
          totalCount: 2,
        },
      },
    },
  },
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: 'error-cursor',
          limit: 5,
        },
      },
    },
    error: new Error('Network error'),
  },
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
] as any;

// Mock with error on initial load
export const errorMock = [
  {
    request: {
      query: CustomizableTemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: 5,
        },
      },
    },
    error: new Error('Network error'),
  },
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
] as any;
