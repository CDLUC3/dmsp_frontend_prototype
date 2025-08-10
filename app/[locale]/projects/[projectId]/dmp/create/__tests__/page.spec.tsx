import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PlanCreate from '../page';
import { useParams, useRouter } from 'next/navigation';
import { print } from 'graphql';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';



import {
  ProjectFundingsDocument,
  PublishedTemplatesDocument,
  PublishedTemplatesMetaDataDocument,
  AddPlanDocument,
} from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from '@/__mocks__/common';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));


// Mock useFormatter from next-intl
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

const mocks = [
  // PublishedTemplatesMetaData query
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
        "term": ""
      },
    },
    result: {
      data: {
        publishedTemplatesMetaData: {
          availableAffiliations: [
            "http://nsf.gov",
            "http://nih.gov"
          ],
          hasBestPracticeTemplates: false,
        },
      },
    },
  },
  // PublishedTemplatesMetaData query
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
        "term": ""
      },
    },
    result: {
      data: {
        publishedTemplatesMetaData: {
          availableAffiliations: [
            "http://nsf.gov",
            "http://nih.gov"
          ],
          hasBestPracticeTemplates: false,
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
        "term": ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          limit: 10,
          nextCursor: null,
          totalCount: 4,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: true,
          items: [
            {
              bestPractice: false,
              description: "Template 1",
              id: "1",
              name: "Agency for Healthcare Research and Quality",
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
            {
              bestPractice: false,
              description: "Arctic Data Center",
              id: "20",
              name: "Arctic Data Center: NSF Polar Programs",
              visibility: "PUBLIC",
              ownerDisplayName: "National Science Foundation (nsf.gov)",
              ownerURI: "http://nsf.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 5,
              ownerSearchName: "National Science Foundation | nsf.gov | NSF"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "10",
              name: "Data Curation Centre",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v2",
              templateId: 3,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "40",
              name: "Practice Template",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v3",
              templateId: 2,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "50",
              name: "Detailed DMP Template",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 1,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: true,
              description: "Best Practice Template",
              id: "12",
              name: "Best Practice Template",
              visibility: "PUBLIC",
              ownerDisplayName: null,
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v6",
              templateId: 7,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
          ]
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
          selectOwnerURIs: ["http://nsf.gov", "http://nih.gov"],
          bestPractice: false
        },
        "term": ""
      },
    },
    result: {
      data: {
        publishedTemplates: {
          limit: 10,
          nextCursor: null,
          totalCount: 4,
          availableSortFields: ['vt.bestPractice'],
          currentOffset: 1,
          hasNextPage: true,
          hasPreviousPage: true,
          items: [
            {
              bestPractice: false,
              description: "Template 1",
              id: "1",
              name: "Agency for Healthcare Research and Quality",
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
            {
              bestPractice: false,
              description: "Arctic Data Center",
              id: "20",
              name: "Arctic Data Center: NSF Polar Programs",
              visibility: "PUBLIC",
              ownerDisplayName: "National Science Foundation (nsf.gov)",
              ownerURI: "http://nsf.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 5,
              ownerSearchName: "National Science Foundation | nsf.gov | NSF"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "10",
              name: "Data Curation Centre",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v2",
              templateId: 3,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "40",
              name: "Practice Template",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v3",
              templateId: 2,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: false,
              description: "Develop data plans",
              id: "50",
              name: "Detailed DMP Template",
              visibility: "PUBLIC",
              ownerDisplayName: "National Institute of Health",
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v5",
              templateId: 1,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
            {
              bestPractice: true,
              description: "Best Practice Template",
              id: "12",
              name: "Best Practice Template",
              visibility: "PUBLIC",
              ownerDisplayName: null,
              ownerURI: "http://nih.gov",
              modified: "2021-10-25 18:42:37",
              modifiedByName: 'John Doe',
              modifiedById: 14,
              ownerId: 122,
              version: "v6",
              templateId: 7,
              ownerSearchName: "National Institute of Health | nih.gov | NIH"
            },
          ]
        },
      },
    },
  },
  // Initial ProjectFundings query
  {
    request: {
      query: ProjectFundingsDocument,
      variables: {
        projectId: 1
      },
    },
    result: {
      data: {
        projectFundings: [
          {
            id: 1,
            affiliation: {
              displayName: "National Science Foundation (nsf.gov)",
              uri: "http://nsf.gov"
            },
            status: "PLANNED",
            grantId: null,
            funderOpportunityNumber: "NSF-23456-ABC",
            funderProjectNumber: null
          },
          {
            id: 11,
            affiliation: {
              displayName: "National League of Voters",
              uri: "http://nlov.gov"
            },
            status: "PLANNED",
            grantId: null,
            funderOpportunityNumber: "NLV-23456-ABC",
            funderProjectNumber: null
          },
          {
            id: 2,
            affiliation: {
              displayName: "National Institute of health",
              uri: "http://nih.gov"
            },
            status: "PLANNED",
            grantId: null,
            funderOpportunityNumber: "NIH-23456-ABC",
            funderProjectNumber: null
          }
        ]
      },
    },
  },
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
          id: 7,
          "__typename": "Plan"
        }
      },
    },
  },
]

describe('PlanCreate Component', () => {
  const mockUseParams = useParams as jest.Mock;

  beforeEach(() => {
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
    jest.clearAllMocks()
  });

  it('should render PlanCreate component with funder checkbox', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
      expect(screen.getByLabelText('labels.searchByKeyword')).toBeInTheDocument();
      expect(screen.getByText('helpText.searchHelpText')).toBeInTheDocument();
      expect(screen.getByText('buttons.search')).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /checkbox.filterByFunderLabel/i })).toBeInTheDocument();
      expect(screen.getByText('checkbox.filterByFunderDescription')).toBeInTheDocument();

      // We should have two checkboxes for project funders checked
      expect(screen.getByRole('checkbox', { name: /National Science Foundation \(nsf.gov\)/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /National Institute of Health/i })).toBeInTheDocument();

      // Expected three funder templates to display by default
      expect(screen.getByRole('heading', { level: 3, name: /Agency for Healthcare Research and Quality/i })).toBeInTheDocument();
      const templateData = screen.getAllByTestId('template-metadata');
      const lastRevisedBy1 = within(templateData[0]).getByText(/lastRevisedBy.*John Doe/);
      const publishStatus1 = within(templateData[0]).getByText('published');
      const visibility1 = within(templateData[0]).getByText(/visibility.*Public/);
      expect(lastRevisedBy1).toBeInTheDocument();
      expect(publishStatus1).toBeInTheDocument();
      expect(visibility1).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Arctic Data Center: NSF Polar Programs/i })).toBeInTheDocument();
      const lastRevisedBy2 = within(templateData[1]).getByText(/lastRevisedBy.*John Doe/);
      const lastUpdated2 = within(templateData[1]).getByText(/lastUpdated.*01-01-2023/);
      const publishStatus2 = within(templateData[1]).getByText('published');
      const visibility2 = within(templateData[1]).getByText(/visibility.*Public/);
      expect(lastRevisedBy2).toBeInTheDocument();
      expect(lastUpdated2).toBeInTheDocument();
      expect(publishStatus2).toBeInTheDocument();
      expect(visibility2).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Data Curation Centre/i })).toBeInTheDocument();
      const lastRevisedBy3 = within(templateData[2]).getByText(/lastRevisedBy.*John Doe/);
      const lastUpdated3 = within(templateData[2]).getByText(/lastUpdated.*01-01-2023/);
      const publishStatus3 = within(templateData[2]).getByText('published');
      const visibility3 = within(templateData[2]).getByText(/visibility.*Public/);
      expect(lastRevisedBy3).toBeInTheDocument();
      expect(lastUpdated3).toBeInTheDocument();
      expect(publishStatus3).toBeInTheDocument();
      expect(visibility3).toBeInTheDocument();
      // Should not show the best practice template on first load
      expect(screen.queryByRole('heading', { level: 3, name: /labels.dmpBestPractice/i })).not.toBeInTheDocument();
      expect(screen.getAllByText('buttons.select')).toHaveLength(6);
    });
  });

  it('should not display duplicate project funder checkboxes', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });
    await waitFor(() => {
      // We should have just two checkboxes for project funders checked, even through projectFunders returns duplicates for National Science Foundation
      const NSFCheckbox = screen.getAllByRole('checkbox', { name: /National Science Foundation \(nsf.gov\)/i });
      expect(NSFCheckbox).toHaveLength(1);
      expect(screen.getByRole('checkbox', { name: /National Institute of Health/i })).toBeInTheDocument();
    })
  });


  it('should not show any checkboxes if no project funders and no best practice', async () => {
    const mocksWithNoProjectFunders = [
      // PublishedTemplatesMetaData query
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
            "term": ""
          },
        },
        result: {
          data: {
            publishedTemplatesMetaData: {
              availableAffiliations: [
                "http://nsf.gov",
                "http://nih.gov"
              ],
              hasBestPracticeTemplates: false,
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
            "term": ""
          },
        },
        result: {
          data: {
            publishedTemplates: {
              limit: 10,
              nextCursor: null,
              totalCount: 4,
              availableSortFields: ['vt.bestPractice'],
              currentOffset: 1,
              hasNextPage: true,
              hasPreviousPage: true,
              items: [
                {
                  bestPractice: false,
                  description: "Develop data plans",
                  id: "10",
                  name: "Data Curation Centre",
                  visibility: "PUBLIC",
                  ownerDisplayName: "UC Davis",
                  ownerURI: "http://ucd.gov",
                  modified: "2021-10-25 18:42:37",
                  modifiedByName: 'John Doe',
                  modifiedById: 14,
                  ownerId: 122,
                  version: "v2",
                  templateId: 10,
                  ownerSearchName: "UC Davis"
                },
                {
                  id: "12",
                  templateId: 11,
                  name: "Best Practice Template",
                  description: "Best Practice Template",
                  visibility: "PUBLIC",
                  bestPractice: false,
                  version: "v2",
                  modified: "2021-10-25 18:42:37",
                  modifiedById: 14,
                  modifiedByName: 'John Doe',
                  ownerId: 122,
                  ownerURI: "http://nih.gov",
                  ownerDisplayName: 'NIH',
                  ownerSearchName: "National Institute of Health | nih.gov | NIH",
                }

              ]
            },
          },
        },
      },
      {
        request: {
          query: ProjectFundingsDocument,
          variables: {
            projectId: 1
          },
        },
        result: {
          data: {
            projectFundings: [
              {
                id: 1,
                affiliation: {
                  displayName: "National Science Foundation (nsf.gov)",
                  uri: "http://nsf1.gov"
                },
                status: "PLANNED",
                grantId: null,
                funderOpportunityNumber: "NSF-23456-ABC",
                funderProjectNumber: null
              },
              {
                id: 11,
                affiliation: {
                  displayName: "National League of Voters",
                  uri: "http://nlov2.gov"
                },
                status: "PLANNED",
                grantId: null,
                funderOpportunityNumber: "NLV-23456-ABC",
                funderProjectNumber: null
              },
              {
                id: 2,
                affiliation: {
                  displayName: "National Institute of health",
                  uri: "http://nih3.gov"
                },
                status: "PLANNED",
                grantId: null,
                funderOpportunityNumber: "NIH-23456-ABC",
                funderProjectNumber: null
              }
            ]
          },
        },
      },
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
              id: 7,
              "__typename": "Plan"
            }
          },
        },
      },
    ]


    await act(async () => {
      render(
        <MockedProvider mocks={mocksWithNoProjectFunders} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });

    const funderCheckboxes = screen.queryAllByRole('checkbox');
    expect(funderCheckboxes).toHaveLength(0);
  });

  it('should display best practices template when no funder templates', async () => {

    const mocksWithOnlyBestPractice = [
      // PublishedTemplatesMetaData query
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
            "term": ""
          },
        },
        result: {
          data: {
            publishedTemplatesMetaData: {
              availableAffiliations: [
                "http://nsf.gov",
                "http://nih.gov"
              ],
              hasBestPracticeTemplates: true,
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
            "term": ""
          },
        },
        result: {
          data: {
            publishedTemplates: {
              limit: 10,
              nextCursor: null,
              totalCount: 4,
              availableSortFields: ['vt.bestPractice'],
              currentOffset: 1,
              hasNextPage: true,
              hasPreviousPage: true,
              items: [
                {
                  bestPractice: true,
                  description: "Develop data plans",
                  id: "10",
                  name: "Data Curation Centre",
                  visibility: "PUBLIC",
                  ownerDisplayName: "UC Davis",
                  ownerURI: "http://ucd.gov",
                  modified: "2021-10-25 18:42:37",
                  modifiedByName: 'John Doe',
                  modifiedById: 14,
                  ownerId: 122,
                  version: "v2",
                  templateId: 10,
                  ownerSearchName: "UC Davis"
                },
                {
                  id: "12",
                  templateId: 11,
                  name: "Best Practice Template",
                  description: "Best Practice Template",
                  visibility: "PUBLIC",
                  bestPractice: true,
                  version: "v2",
                  modified: "2021-10-25 18:42:37",
                  modifiedById: 14,
                  modifiedByName: 'John Doe',
                  ownerId: 122,
                  ownerURI: "http://bestPractice.gov",
                  ownerDisplayName: 'NIH',
                  ownerSearchName: "DMP Best Practice",
                }

              ]
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
              bestPractice: true
            },
            "term": ""
          },
        },
        result: {
          data: {
            publishedTemplates: {
              limit: 10,
              nextCursor: null,
              totalCount: 4,
              availableSortFields: ['vt.bestPractice'],
              currentOffset: 1,
              hasNextPage: true,
              hasPreviousPage: true,
              items: [
                {
                  bestPractice: true,
                  description: "Develop data plans",
                  id: "10",
                  name: "Data Curation Centre",
                  visibility: "PUBLIC",
                  ownerDisplayName: "UC Davis",
                  ownerURI: "http://ucd.gov",
                  modified: "2021-10-25 18:42:37",
                  modifiedByName: 'John Doe',
                  modifiedById: 14,
                  ownerId: 122,
                  version: "v2",
                  templateId: 10,
                  ownerSearchName: "UC Davis"
                },
                {
                  id: "12",
                  templateId: 11,
                  name: "Best Practice Template",
                  description: "Best Practice Template",
                  visibility: "PUBLIC",
                  bestPractice: true,
                  version: "v2",
                  modified: "2021-10-25 18:42:37",
                  modifiedById: 14,
                  modifiedByName: 'John Doe',
                  ownerId: 122,
                  ownerURI: "http://bestPractice.gov",
                  ownerDisplayName: 'NIH',
                  ownerSearchName: "DMP Best Practice",
                }

              ]
            },
          },
        },
      },
      {
        request: {
          query: ProjectFundingsDocument,
          variables: {
            projectId: 1
          },
        },
        result: {
          data: {
            projectFundings: []
          },
        },
      },
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
              id: 7,
              "__typename": "Plan"
            }
          },
        },
      },
    ]
    await act(async () => {
      render(
        <MockedProvider mocks={mocksWithOnlyBestPractice} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });


    await waitFor(() => {
      const checkBoxes = screen.getByRole('checkbox', { name: "best practices" });
      expect(checkBoxes).toBeInTheDocument();
      expect(screen.getByText('checkbox.filterByBestPracticesLabel')).toBeInTheDocument();
      expect(screen.getByText('checkbox.filterByBestPracticesDescription')).toBeInTheDocument();
      expect(screen.getByText("labels.dmpBestPractice")).toBeInTheDocument();
      const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
      expect(listItems).toHaveLength(2);
      expect(screen.getByRole('heading', { level: 3, name: "Data Curation Centre" })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: "Best Practice Template" })).toBeInTheDocument();

    })
  });


  it('should display loading state', async () => {
    const mocksLoading = [
      // PublishedTemplatesMetaData query
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
            "term": ""
          },
        },
        result: {
          data: null,
          loading: true,
          error: null
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
            "term": ""
          },
        },
        result: {
          data: null,
          loading: true,
          error: null
        },
      },
      {
        request: {
          query: ProjectFundingsDocument,
          variables: {
            projectId: 1
          },
        },
        result: {
          data: {
            projectFundings: []
          },
        },
      },
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
              id: 7,
              "__typename": "Plan"
            }
          },
        },
      },
    ];
    await act(async () => {
      render(
        <MockedProvider mocks={mocksLoading} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });
    expect(screen.getByText(/...messaging.loading/i)).toBeInTheDocument();
  });

  it('should display error state', async () => {
    const mocksError = [
      // PublishedTemplatesMetaData query
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
            "term": ""
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
            "term": ""
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
            "term": ""
          },
        },
        error: new Error("There was an error"),
      },
      {
        request: {
          query: ProjectFundingsDocument,
          variables: {
            projectId: 1
          },
        },
        result: {
          data: {
            projectFundings: []
          },
        },
      },
    ];

    await act(async () => {
      render(
        <MockedProvider mocks={mocksError} addTypename={false}>
          <PlanCreate />
        </MockedProvider>
      );
    });

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Plan Create queries',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/projects/1/dmp/create' },
        })
      )
      expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/projects/1');
    });
  });

  // it('should handle no items found in search', async () => {
  //   mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
  //   mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
  //   await act(async () => {
  //     render(
  //       <PlanCreate />
  //     );
  //   });
  //   const searchInput = screen.getByLabelText('Template search');
  //   // Enter search term
  //   fireEvent.change(searchInput, { target: { value: 'test' } });
  //   // Click search button
  //   const searchButton = screen.getByText('buttons.search');
  //   fireEvent.click(searchButton);

  //   expect(searchInput).toHaveValue('test');

  //   // There should be no matches to the search for 'test'
  //   await waitFor(() => {
  //     const heading3 = screen.queryAllByRole('heading', { level: 3 });
  //     expect(heading3).toHaveLength(0);
  //     expect(screen.getByText('messaging.noItemsFound')).toBeInTheDocument();
  //   })

  // });

  // it('should return matching templates on search item', async () => {
  //   mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
  //   mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
  //   await act(async () => {
  //     render(
  //       <PlanCreate />
  //     );
  //   });

  //   const searchInput = screen.getByLabelText('Template search');
  //   // Enter matching search term
  //   fireEvent.change(searchInput, { target: { value: 'Arctic' } });

  //   // Click search button
  //   const searchButton = screen.getByText('buttons.search');
  //   fireEvent.click(searchButton);


  //   await waitFor(() => {
  //     // Should bring up this matching template
  //     expect(screen.getByRole('heading', { level: 3, name: /Arctic Data Center: NSF Polar Programs/i })).toBeInTheDocument();
  //   });
  // });

  // it('should handle Load More functionality', async () => {
  //   mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
  //   mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });
  //   await act(async () => {
  //     render(
  //       <PlanCreate />
  //     );
  //   });

  //   // Get all checkboxes with name="funders"
  //   const funderCheckboxes = screen.getAllByRole('checkbox').filter(
  //     (checkbox) => checkbox.getAttribute('name') === 'funders'
  //   );

  //   // Uncheck each one if it's checked
  //   for (const checkbox of funderCheckboxes) {
  //     if ((checkbox as HTMLInputElement).checked) {
  //       await act(async () => {
  //         fireEvent.click(checkbox);
  //       });
  //       expect((checkbox as HTMLInputElement).checked).toBe(false); // Confirm it's unchecked
  //     }
  //   }

  //   const loadMoreButton = screen.getByRole('button', { name: /buttons.loadMore/i });
  //   await waitFor(() => {
  //     // Should bring up this matching template
  //     expect(loadMoreButton).toBeInTheDocument();
  //     fireEvent.click(loadMoreButton);
  //   });

  //   const listItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('templateItem'));
  //   expect(listItems).toHaveLength(6);
  // });


  // it('should pass axe accessibility test', async () => {
  //   mockUseProjectFundingsQuery.mockReturnValue({ data: { projectFundings: mockProjectFundings }, loading: false, error: null });
  //   mockUsePublishedTemplatesQuery.mockReturnValue({ data: { publishedTemplates: mockPublishedTemplates }, loading: false, error: null });

  //   const { container } = render(
  //     <PlanCreate />
  //   );
  //   await act(async () => {
  //     const results = await axe(container);
  //     expect(results).toHaveNoViolations();
  //   });
  // });
});
