import React from 'react';
import { act, fireEvent, render, screen, waitFor, within, cleanup } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import PlanCreate from '../page';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';
import {
  ProjectFundingsDocument,
  PublishedTemplatesDocument,
  PublishedTemplatesMetaDataDocument,
  AddPlanDocument,
  AddPlanFundingDocument,
  MeDocument
} from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from '@/__mocks__/common';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));


let mockRouter;

const mockToast = {
  add: jest.fn(),
};


// Initial ProjectFundings query
const projectFundingsMocks = [
  {
    request: {
      query: ProjectFundingsDocument,
      variables: {
        projectId: 1
      },
    },
    result: {
      data: {
        projectFundings: Array.from({ length: 3 }, (_, i) => {
          const count = i + 1;
          return {
            __typename: "ProjectFunding",
            id: count,
            affiliation: {
              __typename: "Affiliation",
              displayName: `Affiliation ${count} Name`,
              uri: `http://affiliation-${count}.gov`,
            },
            status: "PLANNED",
            grantId: null,
            funderOpportunityNumber: `OP-NUM-${count}`,
            funderProjectNumber: null,
          }
        }),
      },
      loading: false
    },
  },

  {
    request: {
      query: ProjectFundingsDocument,
      variables: {
        // Project 2 have no projectFundings
        projectId: 2
      },
    },
    result: {
      data: {
        projectFundings: [],
      },
    },
  },
];


// User Me query
const meMocks = [
  {
    request: {
      query: MeDocument,
      variables: {},
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: 1,
          languageId: "en-US",
          givenName: "user",
          surName: "Admin",
          role: "SUPERADMIN",
          emails: [
            {
              email: "user@example.com",
              id: 16,
              isConfirmed: true,
              isPrimary: true,
              __typename: "UserEmail"
            }
          ],
          errors: {
            __typename: "UserErrors",
            general: null,
            email: null,
            password: null,
            role: null,
          },
          affiliation: {
            __typename: "Affiliation",
            id: 16,
            name: "User Affiliation",
            searchName: "User Affiliation | user-affiliation.gov",
            uri: "http://user-affiliation.gov",
          },
        },
      },
    },
  },
];

// PublishedTemplatesMetaData query
const publishedMetaDataMocks = [
  {
    request: {
      query: PublishedTemplatesMetaDataDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplatesMetaData: {
          __typename: "PublishedTemplateMetaDataResults",
          availableAffiliations: [
            "http://affiliation-1.gov",
            "http://affiliation-2.gov"
          ],
          hasBestPracticeTemplates: false,
        },
      },
    },
  },
];


const publishedTemplatesMocks = [
  // Published Templates, no selectOwners

  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: Array.from({ length: 5 }, (_, i) => {
            const count = i + 1;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
    },
  },
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: Array.from({ length: 5 }, (_, i) => {
            const count = i + 1;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
    },
  },

  // Published with owners
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [
            "http://affiliation-1.gov",
            "http://affiliation-2.gov"
          ],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: Array.from({ length: 5 }, (_, i) => {
            const count = i + 1;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
    },
  },

  // Published Templates filtered to a single funder
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [
            "http://affiliation-1.gov",
          ],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: [{
            __typename: "VersionedTemplateSearchResult",
            id: 1,
            bestPractice: false,
            description: "Template Description",
            name: "Filtered Template Name",
            visibility: "PUBLIC",
            ownerDisplayName: "Template Owner",
            ownerURI: `http://template1.gov`,
            modified: "2021-10-25 18:42:37",
            modifiedByName: "John Doe",
            modifiedById: 14,
            ownerId: 101,
            version: "v5",
            templateId: 11,
            ownerSearchName: "Owner Search Name"
          }],
        },
      },
    },
  },

  // Published Templates With Owners Page 2
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 5,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [
            "http://affiliation-1.gov",
            "http://affiliation-2.gov"
          ],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: Array.from({ length: 3 }, (_, i) => {
            const count = i + 6;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
      loading: false
    },
  },

  // No results : Term = "no-results"
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false,
        },
        term: "no-results",
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 0,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          items: [],
        },
      },
      loading: false
    },
  },

  // Search term = NSF
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: "NSF"
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 1,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          items: [
            {
              __typename: "VersionedTemplateSearchResult",
              bestPractice: false,
              description: "NSF SEARCH",
              id: "1",
              name: "NSF Search",
              visibility: "PUBLIC",
              ownerDisplayName: "National Science Foundation (nsf.gov)",
              ownerURI: "http://nsf.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 4,
              ownerSearchName: "National Science Foundation | nsf.gov | NSF"
            },
          ]
        },
      },
      loading: false
    },
  },
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: ["http://affiliation-1.gov", "http://affiliation-2.gov"],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 1,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          items: Array.from({ length: 3 }, (_, i) => {
            const count = i + 6;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
      loading: false
    },
  },
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: ["http://affiliation-1.gov", "http://affiliation-2.gov"],
          bestPractice: false
        },
        term: "NSF"
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 1,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          items: [
            {
              __typename: "VersionedTemplateSearchResult",
              bestPractice: false,
              description: "NSF SEARCH",
              id: "1",
              name: "NSF Search",
              visibility: "PUBLIC",
              ownerDisplayName: "National Science Foundation (nsf.gov)",
              ownerURI: "http://nsf.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 4,
              ownerSearchName: "National Science Foundation | nsf.gov | NSF"
            },
          ]
        },
      },
      loading: false
    },
  },
  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [
            "http://affiliation-1.gov",
            "http://affiliation-2.gov"
          ],
          bestPractice: false
        },
        term: ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          __typename: "PublishedTemplateSearchResults",
          limit: 5,
          nextCursor: null,
          totalCount: 8,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: false,
          items: Array.from({ length: 5 }, (_, i) => {
            const count = i + 1;
            return {
              __typename: "VersionedTemplateSearchResult",
              id: count,
              bestPractice: (count == 5) ? true : false,
              description: `Template ${count} Description`,
              name: `Template ${count} Name`,
              visibility: "PUBLIC",
              ownerDisplayName: `Template Owner ${count}`,
              ownerURI: `http://template${count}.gov`,
              modified: "2021-10-25 18:42:37",
              modifiedByName: "John Doe",
              modifiedById: 14,
              ownerId: 100 + count,
              version: "v5",
              templateId: 10 + count,
              ownerSearchName: `Owner ${count} Search`
            }
          }),
        },
      },
    },
  },

];

const errorMocks = [
  {
    request: {
      query: PublishedTemplatesMetaDataDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    error: new Error("There was an error"),
  },

  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    error: new Error("There was an error"),
  },

  {
    request: {
      query: PublishedTemplatesDocument,
      variables: {
        paginationOptions: {
          offset: 0,
          limit: 5,
          type: "OFFSET",
          sortDir: "DESC",
          selectOwnerURIs: [],
          bestPractice: false
        },
        term: ""
      },
    },
    error: new Error("There was an error"),
  },
];


const addPlanMocks = [
  // AddPlan mutation
  {
    request: {
      query: AddPlanDocument,
      variables: {
        projectId: 1,
        versionedTemplateId: 1
      },
    },
    result: {
      data: {
        addPlan: {
          __typename: "AddPlan",
          id: 7,
          errors: {
            general: null,
            versionedTemplateId: null,
            projectId: null,
          }
        },
      },
    },
  },

  // AddPlan with general errors
  {
    request: {
      query: AddPlanDocument,
      variables: {
        projectId: 2,
        versionedTemplateId: 1
      },
    },
    result: {
      data: {
        addPlan: {
          __typename: "AddPlan",
          id: 7,
          errors: {
            general: "General error",
            versionedTemplateId: null,
            projectId: null,
          },
        },
      },
    },
  },


  {
    request: {
      query: AddPlanFundingDocument,
      variables: {
        planId: 7,
        projectFundingIds: [1, 2, 3],
      }
    },
    result: {
      data: {
        addPlanFunding: {
          __typename: "AddPlanFunding",
          errors: {
            __typename: "PlanFundingErrors",
            general: null,
          },
        },
      },
    },
  },
];

const addPlanErrMocks = [
  // addPlan general error
  {
    request: {
      query: AddPlanDocument,
      variables: {
        // Project 1 just returns a general error
        projectId: 1,
        versionedTemplateId: 1
      },
    },
    error: new Error("There was an error"),
  },

  // Project ID 2 should get past the first step, but fail when adding funders
  {
    request: {
      query: AddPlanDocument,
      variables: {
        // Project ID 2 will return a general error
        projectId: 2,
        versionedTemplateId: 1,
      },
    },
    result: {
      data: {
        addPlan: {
          __typename: "AddPlan",
          id: 7,
          errors: {
            general: null,
            versionedTemplateId: null,
            projectId: null,
          },
        }
      },
    },
  },

  {
    request: {
      query: AddPlanFundingDocument,
      variables: {
        planId: 7,
        projectFundingIds: [],
      }
    },
    error: new Error("There was an error"),
  },
];


const baseMocks = [
  ...meMocks,
  ...projectFundingsMocks,
  ...publishedMetaDataMocks,
  ...publishedTemplatesMocks,
  ...addPlanMocks,
  ...addPlanErrMocks,
];


describe('PlanCreate Component using base mock', () => {
  const mockUseParams = useParams as jest.Mock;
  let apolloCache: InMemoryCache;

  beforeEach(() => {
    // Create fresh cache for each test
    apolloCache = new InMemoryCache();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });

    // mock router
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
    apolloCache.reset();
    cleanup();
  })


  it('should render PlanCreate component with funder checkbox', async () => {
    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    // Wait for the funder checkboxes to load
    // await screen.findByText('checkbox.filterByFunderLabel');

    await waitFor(() => {
      // We should have two checkboxes for project funders checked
      expect(screen.getByRole('checkbox', { name: 'Affiliation 1 Name' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Affiliation 2 Name' })).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {

      // Expected three funder templates to display by default
      const funderTemplateResults = [0, 1, 2];
      funderTemplateResults.forEach((i) => {
        expect(screen.getByRole('heading', { level: 3, name: `Template ${i + 1} Name` })).toBeInTheDocument();
        const templateData = screen.getAllByTestId('template-metadata');
        const lastRevisedBy1 = within(templateData[i]).getByText(/lastRevisedBy.*John Doe/);
        const publishStatus1 = within(templateData[i]).getByText('published');
        const visibility1 = within(templateData[i]).getByText(/visibility.*Public/);
        expect(lastRevisedBy1).toBeInTheDocument();
        expect(publishStatus1).toBeInTheDocument();
        expect(visibility1).toBeInTheDocument();
      });

      // Should not show the best practice template on first load
      expect(screen.queryByRole('heading', { level: 3, name: /labels.dmpBestPractice/i })).not.toBeInTheDocument();

      // Make sure all 5 template select buttons are present
      expect(screen.getAllByText('buttons.select')).toHaveLength(5);
    }, { timeout: 5000 });
  });

  // it('should handle funder filter changes', async () => {
  //   render(
  //     <MockedProvider mocks={baseMocks} cache={apolloCache}>
  //       <PlanCreate />
  //     </MockedProvider>
  //   );

  //   await waitFor(() => {
  //     // Both checkboxes should be checked initially
  //     const checkbox1 = screen.getByRole('checkbox', { name: 'Affiliation 1 Name' }) as HTMLInputElement;
  //     const checkbox2 = screen.getByRole('checkbox', { name: 'Affiliation 2 Name' }) as HTMLInputElement;
  //     expect(checkbox1).toBeInTheDocument();
  //     expect(checkbox2).toBeInTheDocument();
  //     expect(checkbox1.checked).toBe(true);
  //     expect(checkbox2.checked).toBe(true);

  //     // Uncheck the second affiliation item
  //     fireEvent.click(checkbox2);
  //   }, { timeout: 3000 });

  //   await waitFor(() => {
  //     // Only Affiliation 1 should remain checked
  //     const checkbox1 = screen.getByRole('checkbox', { name: 'Affiliation 1 Name' }) as HTMLInputElement;
  //     expect(checkbox1.checked).toBe(true);
  //     // Affiliation 2 should be unchecked
  //     const checkbox2 = screen.getByRole('checkbox', { name: 'Affiliation 2 Name' }) as HTMLInputElement;
  //     expect(checkbox2.checked).toBe(false);

  //     // Only the filtered template should be shown
  //     expect(screen.getAllByText('buttons.select')).toHaveLength(1);
  //     expect(screen.getByRole('heading', { level: 3, name: 'Filtered Template Name' })).toBeInTheDocument();
  //   });
  // });

  it('should handle no items found in search', async () => {
    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    await waitFor(() => {
      const searchInput = screen.getByLabelText('Template search');
      fireEvent.change(searchInput, { target: { value: 'no-results' } });

      const searchButton = screen.getByText('buttons.search');
      fireEvent.click(searchButton);
    });

    // There should be two matches to the search for 'test'
    await waitFor(() => {
      expect(screen.getByText('messaging.noItemsFound')).toBeInTheDocument();
    })
  });

  it('should return matching templates on search item', async () => {
    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    await waitFor(() => {
      const searchInput = screen.getByLabelText('Template search');
      // Enter matching search term
      fireEvent.change(searchInput, { target: { value: 'NSF' } });

      // Click search button
      const searchButton = screen.getByText('buttons.search');
      fireEvent.click(searchButton);
    }, { timeout: 3000 });

    await waitFor(() => {
      // Should bring up this matching template
      expect(screen.getByRole('heading', { level: 3, name: /NSF Search/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    //Empty out the search text
    const searchInput = screen.getByLabelText('Template search');
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      // Should expect to see a template from initial load
      screen.getByRole('heading', { level: 3, name: "Template 1 Name" });
    }, { timeout: 3000 });
  });

  it('should reset templates if user clicks on \'clear filter\' link', async () => {
    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    await waitFor(() => {
      const searchInput = screen.getByLabelText('Template search');
      // Enter matching search term
      fireEvent.change(searchInput, { target: { value: 'NSF' } });

      // Click search button
      const searchButton = screen.getByText('buttons.search');
      fireEvent.click(searchButton);
    }, { timeout: 3000 });

    await waitFor(() => {
      // Should bring up this matching template
      expect(screen.getByRole('heading', { level: 3, name: /NSF Search/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    //Click clear filter button
    const clearFilterBtn = screen.getByTestId('clear-filter');
    fireEvent.click(clearFilterBtn);

    await waitFor(() => {
      // Should expect to see a template from initial load
      screen.getByRole('heading', { level: 3, name: "Template 1 Name" });
    }, { timeout: 3000 });
  });

  it('should not show any checkboxes if no project funders and no best practice', async () => {
    // Project 2 have don't have any funders
    mockUseParams.mockReturnValue({ projectId: '2' });
    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    const funderCheckboxes = screen.queryAllByRole('checkbox');
    expect(funderCheckboxes).toHaveLength(0);
  });

  it('should display error state', async () => {
    // Project 2 have don't have any funders
    mockUseParams.mockReturnValue({ projectId: '2' });

    const mocks = [
      ...meMocks,
      ...projectFundingsMocks,
      ...errorMocks,
    ];

    render(
      <MockedProvider mocks={mocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    // There should be an error from the initial load
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Plan Create queries',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/2/dmp/create' },
        })
      )
      expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/2');
    }, { timeout: 3000 });
  });

  it('should handle general error from addPlan mutation', async () => {
    // Project 2 will return errors
    mockUseParams.mockReturnValue({ projectId: '2' });

    render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    // Find the first template and select it
    await waitFor(() => {
      expect(screen.getAllByText('buttons.select')).toHaveLength(5);
    }, { timeout: 3000 });

    const btn = screen.getAllByText('buttons.select')[0];
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("General error")).toBeInTheDocument();
      expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
    }, { timeout: 3000 });
  });

  // it('should handle server errors on addPlan mutation', async () => {
  //   const mocks = [
  //     ...meMocks,
  //     ...projectFundingsMocks,
  //     ...publishedMetaDataMocks,
  //     ...publishedTemplatesMocks,
  //     ...addPlanErrMocks,
  //   ];

  //   render(
  //     <MockedProvider mocks={mocks} cache={apolloCache}>
  //       <PlanCreate />
  //     </MockedProvider>
  //   );

  //   // Find the first template and select it
  //   await waitFor(() => {
  //     expect(screen.getAllByText('buttons.select')).toHaveLength(5);
  //   }, { timeout: 3000 });

  //   const btn = screen.getAllByText('buttons.select')[0];
  //   fireEvent.click(btn);

  //   await waitFor(() => {
  //     expect(logECS).toHaveBeenCalledWith(
  //       'error',
  //       'addPlanMutation',
  //       expect.objectContaining({
  //         error: expect.anything(),
  //         url: { path: '/en-US/projects/1/dmp/create' },
  //       })
  //     )
  //     expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
  //   }, { timeout: 3000 });
  // });

  // it('should handle server errors on addPlanFunding mutation', async () => {
  //   // Project 2 return a server for the second step
  //   mockUseParams.mockReturnValue({ projectId: '2' });

  //   const mocks = [
  //     ...meMocks,
  //     ...projectFundingsMocks,
  //     ...publishedMetaDataMocks,
  //     ...publishedTemplatesMocks,
  //     ...addPlanErrMocks,
  //   ];

  //   render(
  //     <MockedProvider mocks={mocks} cache={apolloCache}>
  //       <PlanCreate />
  //     </MockedProvider>
  //   );

  //   // Find the first template and select it
  //   await waitFor(() => {
  //     expect(screen.getAllByText('buttons.select')).toHaveLength(5);
  //   }, { timeout: 3000 });

  //   const btn = screen.getAllByText('buttons.select')[0];
  //   fireEvent.click(btn);

  //   await waitFor(() => {
  //     expect(logECS).toHaveBeenCalledWith(
  //       'error',
  //       'addPlanMutation',
  //       expect.objectContaining({
  //         error: expect.anything(),
  //         url: { path: '/en-US/projects/2/dmp/create' },
  //       })
  //     )
  //     expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
  //   }, { timeout: 3000 });
  // });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MockedProvider mocks={baseMocks} cache={apolloCache}>
        <PlanCreate />
      </MockedProvider>
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
