import { TemplatesDocument } from '@/generated/graphql';

export const mocks = [
  // Initial load mock
  {
    request: {
      query: TemplatesDocument,
      variables: {
        paginationOptions: {
          limit: 5,
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 2,
          nextCursor: null,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'UCOP',
            description: 'University of California Office of the President',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 1,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'CDL',
            description: 'California Digital Library',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 2,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          }]
        }
      },
    },
  },
  // Search mock for 'UCOP'
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'ucop',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 1,
          nextCursor: null,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [
            {
              name: 'UCOP',
              description: 'University of California Office of the President',
              modified: '2024-11-20 00:00:00',
              modifiedByName: 'Test User',
              latestPublishVisibility: 'ORGANIZATION',
              latestPublishVersion: 'v1',
              latestPublishDate: '2024-11-20 00:00:00',
              id: 1,
              ownerId: 'http://example.com/user/1',
              ownerDisplayName: 'Test Affiliation',
              modifiedById: 1,
              isDirty: false,
              bestPractice: false
            }
          ]
        }
      },
    },
  },
  // Search mock for 'test' (no results)
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'test',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 0,
          nextCursor: null,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: []
        }
      },
    },
  },
];

export const multipleItemsMock = [
  {
    request: {
      query: TemplatesDocument,
      variables: {
        paginationOptions: {
          limit: 5,
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 10,
          nextCursor: 1,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'UCOP',
            description: 'University of California Office of the President',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 1,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'CDL',
            description: 'California Digital Library',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 2,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 1',
            description: 'Test Template 1 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 3,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 2',
            description: 'Test Template 2 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 4,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 3',
            description: 'Test Template 3 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 5,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
  {
    request: {
      query: TemplatesDocument,
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: 1,
          limit: 5,
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 10,
          nextCursor: null,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'Test Template 4',
            description: 'Test Template 4 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 6,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 5',
            description: 'Test Template 5 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 7,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
  // Search mock for 'template' returning multiple items
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'template',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 5,
          nextCursor: 1,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'Test Template 1',
            description: 'Test Template 1 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 3,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 2',
            description: 'Test Template 2 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 4,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 3',
            description: 'Test Template 3 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 5,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
  // Search load more mock
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'template',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
          cursor: 1,
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 5,
          nextCursor: null,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'Test Template 4',
            description: 'Test Template 4 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 6,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 5',
            description: 'Test Template 5 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 7,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
];

export const multipleItemsErrorMock = [
  {
    request: {
      query: TemplatesDocument,
      variables: {
        paginationOptions: {
          limit: 5,
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 5,
          nextCursor: 1,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'Test Template 1',
            description: 'Test Template 1 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 1,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 2',
            description: 'Test Template 2 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 2,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'template',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
        },
      },
    },
    result: {
      data: {
        myTemplates: {
          totalCount: 5,
          nextCursor: 1,
          availableSortFields: {},
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 5,
          items: [{
            name: 'Test Template 1',
            description: 'Test Template 1 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 1,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          {
            name: 'Test Template 2',
            description: 'Test Template 2 Description',
            modified: '2024-11-20 00:00:00',
            modifiedByName: 'Test User',
            latestPublishVisibility: 'ORGANIZATION',
            latestPublishVersion: 'v1',
            latestPublishDate: '2024-11-20 00:00:00',
            id: 2,
            ownerId: 'http://example.com/user/1',
            ownerDisplayName: 'Test Affiliation',
            modifiedById: 1,
            isDirty: false,
            bestPractice: false
          },
          ]
        }
      },
    },
  },
  {
    request: {
      query: TemplatesDocument,
      variables: {
        term: 'template',
        paginationOptions: {
          limit: 5,
          type: "CURSOR",
          cursor: 1,
        },
      },
    },
    error: new Error('Network error'),
  },
];

export const errorMock = [
  {
    request: {
      query: TemplatesDocument,
      variables: {
        paginationOptions: {
          limit: 5,
        },
      },
    },
    error: new Error('Network error'),
  },
];
