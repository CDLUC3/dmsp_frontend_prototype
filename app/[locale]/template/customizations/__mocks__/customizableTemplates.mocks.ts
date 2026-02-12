import {
  AddTemplateCustomizationDocument,
  CustomizableTemplatesDocument,
  TemplateCustomizationMigrationStatus,
  TemplateCustomizationStatus,
} from '@/generated/graphql';

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
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              versionedTemplateDescription: 'NSF-BIO: Biological Sciences',
              versionedTemplateAffiliationId: "https://ror.org/03yrm5c26",
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateId: 2,
              versionedTemplateName: 'NSF-BIO: Biological Sciences',
              versionedTemplateBestPractice: false,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 2,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 2,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              versionedTemplateDescription: 'NSF-ENG: Engineering',
              versionedTemplateAffiliationId: "https://ror.org/03yrm5c26",
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateId: 2,
              versionedTemplateName: 'NSF-ENG: Engineering',
              versionedTemplateBestPractice: false,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              versionedTemplateDescription: 'NSF-BIO: Biological Sciences',
              versionedTemplateAffiliationId: "https://ror.org/03yrm5c26",
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateId: 2,
              versionedTemplateName: 'NSF-BIO: Biological Sciences',
              versionedTemplateBestPractice: false,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              versionedTemplateDescription: 'NSF-BIO: Biological Sciences',
              versionedTemplateAffiliationId: "https://ror.org/03yrm5c26",
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateId: 2,
              versionedTemplateName: 'NSF-BIO: Biological Sciences',
              versionedTemplateBestPractice: false,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 2,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 2,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              versionedTemplateDescription: 'NSF-ENG: Engineering',
              versionedTemplateAffiliationId: "https://ror.org/03yrm5c26",
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateId: 2,
              versionedTemplateName: 'NSF-ENG: Engineering',
              versionedTemplateBestPractice: false,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
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
      query: AddTemplateCustomizationDocument,
      variables: {
        input: {
          versionedTemplateId: 2,
          status: TemplateCustomizationStatus.Published,
        }
      }
    },
    result: {
      data: {
        addTemplateCustomization: {
          id: 19,
          errors: {
            collaboratorIds: null,
            description: null,
            general: null,
            languageId: null,
            latestPublishVersion: null,
            latestPublishVisibility: null,
            name: null,
            ownerId: null,
            sectionIds: null,
            sourceTemplateId: null,
            __typename: "TemplateErrors"
          },
          isDirty: false,
          currentVersionedTemplateId: 945,
          affiliationId: "https://ror.org/03yrm5c26",
          status: "DRAFT",
          migrationStatus: "OK",
          latestPublishedDate: null,
          __typename: "TemplateCustomization"
        }

      }
    }
  }
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'User 1',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 618,
              versionedTemplateName: 'Template 1',
              versionedTemplateDescription: 'Template 1',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'Funder 1',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 2,
              customizationIsDirty: true,
              customizationLastCustomized: '2024-01-02T00:00:00Z',
              customizationLastCustomizedById: 2,
              customizationLastCustomizedByName: 'User 2',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 619,
              versionedTemplateName: 'Template 2',
              versionedTemplateDescription: 'Template 2',
              versionedTemplateAffiliationId: '2',
              versionedTemplateAffiliationName: 'Funder 2',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-02T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 3,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-03T00:00:00Z',
              customizationLastCustomizedById: 3,
              customizationLastCustomizedByName: 'User 3',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Stale,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 620,
              versionedTemplateName: 'Template 3',
              versionedTemplateDescription: 'Template 3',
              versionedTemplateAffiliationId: '3',
              versionedTemplateAffiliationName: 'Funder 3',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-03T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 4,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-04T00:00:00Z',
              customizationLastCustomizedById: 4,
              customizationLastCustomizedByName: 'User 4',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 621,
              versionedTemplateName: 'Template 4',
              versionedTemplateDescription: 'Template 4',
              versionedTemplateAffiliationId: '4',
              versionedTemplateAffiliationName: 'Funder 4',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-04T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 5,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-05T00:00:00Z',
              customizationLastCustomizedById: 5,
              customizationLastCustomizedByName: 'User 5',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 622,
              versionedTemplateName: 'Template 5',
              versionedTemplateDescription: 'Template 5',
              versionedTemplateAffiliationId: '5',
              versionedTemplateAffiliationName: 'Funder 5',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-05T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 618,
              versionedTemplateName: 'NSF-BIO: Biological Sciences',
              versionedTemplateDescription: 'NSF-BIO: Biological Sciences',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
            },
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 2,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-02T00:00:00Z',
              customizationLastCustomizedById: 2,
              customizationLastCustomizedByName: 'Test User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 619,
              versionedTemplateName: 'NSF-ENG: Engineering',
              versionedTemplateDescription: 'NSF-ENG: Engineering',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-11-01T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'Bio User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 618,
              versionedTemplateName: 'NSF-BIO: Biological Sciences',
              versionedTemplateDescription: 'NSF-BIO: Biological Sciences',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 2,
              customizationIsDirty: true,
              customizationLastCustomized: '2024-01-02T00:00:00Z',
              customizationLastCustomizedById: 2,
              customizationLastCustomizedByName: 'Geo User',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 619,
              versionedTemplateName: 'NSF-GEO: Biological and Geological Sciences',
              versionedTemplateDescription: 'NSF-GEO: Biological and Geological Sciences',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'National Science Foundation',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-02T00:00:00Z',
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
          __typename: 'CustomizableTemplateSearchResults',
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: 1,
              customizationIsDirty: false,
              customizationLastCustomized: '2024-01-01T00:00:00Z',
              customizationLastCustomizedById: 1,
              customizationLastCustomizedByName: 'User 1',
              customizationMigrationStatus: TemplateCustomizationMigrationStatus.Ok,
              customizationStatus: TemplateCustomizationStatus.Published,
              versionedTemplateId: 618,
              versionedTemplateName: 'Template 1',
              versionedTemplateDescription: 'Template 1',
              versionedTemplateAffiliationId: '1',
              versionedTemplateAffiliationName: 'Funder 1',
              versionedTemplateVersion: '1.0',
              versionedTemplateBestPractice: false,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
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
];

export const mutationErrorMock = [
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
          items: [
            {
              __typename: 'CustomizableTemplateSearchResult',
              customizationId: null, // No existing customization
              customizationIsDirty: false,
              customizationLastCustomized: null,
              customizationLastCustomizedById: null,
              customizationLastCustomizedByName: null,
              customizationMigrationStatus: null,
              versionedTemplateDescription: 'Test Template',
              versionedTemplateAffiliationId: "https://ror.org/test",
              versionedTemplateAffiliationName: 'Test Funder',
              versionedTemplateId: 999,
              versionedTemplateName: 'Test Template',
              versionedTemplateBestPractice: false,
              customizationStatus: null,
              versionedTemplateLastModified: '2023-12-01T00:00:00Z',
            },
          ],
          nextCursor: null,
          totalCount: 1,
        },
      },
    },
  },
  {
    request: {
      query: AddTemplateCustomizationDocument,
      variables: {
        input: {
          versionedTemplateId: 999,
          status: TemplateCustomizationStatus.Draft,
        }
      }
    },
    result: {
      data: {
        addTemplateCustomization: {
          id: null,
          errors: {
            collaboratorIds: null,
            description: null,
            general: "Something went wrong",
            languageId: null,
            latestPublishVersion: null,
            latestPublishVisibility: null,
            name: null,
            ownerId: null,
            sectionIds: null,
            sourceTemplateId: null,
            __typename: "TemplateErrors"
          },
          isDirty: false,
          currentVersionedTemplateId: null,
          affiliationId: null,
          status: null,
          migrationStatus: null,
          latestPublishedDate: null,
          __typename: "TemplateCustomization"
        }
      }
    }
  }
];

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
];

