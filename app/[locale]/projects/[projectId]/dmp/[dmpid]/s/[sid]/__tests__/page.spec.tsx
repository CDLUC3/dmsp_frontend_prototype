import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { useParams } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';

import {
  PlanDocument,
  PublishedQuestionsDocument,
  PublishedSectionDocument,
} from '@/generated/graphql';

import PlanOverviewSectionPage from "../page";

expect.extend(toHaveNoViolations);

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

// Mock stripHtml utility
jest.mock('@/utils/general', () => ({
  stripHtml: jest.fn((text) => text),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

const mockParams = {
  projectId: '123',
  dmpid: '456',
  sid: '456',
};

const versionedQuestionsMock = [
  {
    id: 1,
    questionText: 'What types of data will be produced during your project?',
    displayOrder: 1,
    guidanceText: 'Guidance for question 1',
    requirementText: 'Requirement for question 1',
    sampleText: 'Sample for question 1',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: false,
  },
  {
    id: 2,
    questionText: 'What type of metadata will be collected?',
    displayOrder: 2,
    guidanceText: 'Guidance for question 2',
    requirementText: 'Requirement for question 2',
    sampleText: 'Sample for question 2',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: true,
  },
  {
    id: 3,
    questionText: 'Will all data be converted to open source formats?',
    displayOrder: 3,
    guidanceText: 'Guidance for question 3',
    requirementText: 'Requirement for question 3',
    sampleText: 'Sample for question 3',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: false,
  },
];

const versionedSectionMock = {
  id: 456,
  name: 'Data and Metadata Formats',
  introduction: 'Introduction text for the section',
  requirements: 'Requirements text for the section',
  guidance: 'Guidance text for the section',
  displayOrder: 1,
  bestPractice: 'Best practice text',
  tags: {
    id: 1,
    description: 'one',
    name: 'one',
    slug: 'one'
  },
  versionedQuestions: {
    errors: {
      general: null,
      versionedTemplateId: null,
      versionedSectionId: null,
      questionText: null,
      displayOrder: null
    },
    displayOrder: 1,
    guidanceText: 'Guidance',
    id: 1,
    questionText: 'This is the question',
    versionedSectionId: 456,
    versionedTemplateId: 789
  },
  errors: {
    general: null,
    name: null,
    displayOrder: null
  },
  versionedTemplate: {
    id: 789,
    bestPractice: false,
    languageId: 'en-US',
    name: "My template",
    visibility: "PUBLIC"
  }
};

const planMock = {
  id: 456,
  title: "Text Project",
  versionedTemplate: {
    template: {
      id: 789,
      name: 'Test Template',
    },
    name: 'Test Template',
    owner: {
      uri: 'https://example.com/owner',
      displayName: 'Test Owner',
    },
    version: 1,
    created: '2024-01-01',
  },
  fundings: {
    id: 1,
    projectFunding: {
      affiliation: {
        displayName: 'National Science Foundation (nsf.gov)'
      }
    }
  },
  visibility: 'PUBLIC',
  status: 'ACTIVE',
  project: {
    fundings: [
      {
        affiliation: {
          displayName: 'National Science Foundation',
          name: "NSF"
        },
        funderOpportunityNumber: '123'
      }
    ],
    title: 'Test Project',
    collaborators: {
      accessLevel: 'OWN',
      user: {
        id: 1
      },
    }
  },
  members: [],
  versionedSections: [
    {
      versionedSectionId: 456,
      title: 'Data and Metadata Formats',
      totalQuestions: 3,
      answeredQuestions: 2,
      displayOrder: 1,
      tags: [
        { id: 1, name: 'Data description', slug: 'data-description', description: 'Data description tag' },
        { id: 2, name: 'Data organization & documentation', slug: 'data-organization-documentation', description: 'Data organization & documentation tag' }
      ]
    },
  ],
  created: '2024-01-01',
  createdById: 1,
  modified: '2024-01-01',
  dmpId: 'doi-456',
  registered: true,
  feedback: {
    id: 789,
    completed: null
  },
  progress: {
    answeredQuestions: 0,
    percentComplete: 0,
    totalQuestions: 16
  }
};

const mocks = [
  // Successful questions query
  {
    request: {
      query: PublishedQuestionsDocument,
      variables: { planId: 456, versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedQuestions: versionedQuestionsMock,
      },
    },
  },
  // Successful section query
  {
    request: {
      query: PublishedSectionDocument,
      variables: { versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedSection: versionedSectionMock,
      },
    },
  },
  // Successful plan query
  {
    request: {
      query: PlanDocument,
      variables: { planId: 456 },
    },
    result: {
      data: {
        plan: planMock,
      },
    },
  },
];

const errorMocks = [
  // Questions query error
  {
    request: {
      query: PublishedQuestionsDocument,
      variables: { planId: 456, versionedSectionId: 456 },
    },
    error: new Error('Failed to fetch questions'),
  },
  // Section query success (for error test)
  {
    request: {
      query: PublishedSectionDocument,
      variables: { versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedSection: versionedSectionMock,
      },
    },
  },
  // Plan query success (for error test)
  {
    request: {
      query: PlanDocument,
      variables: { planId: 456 },
    },
    result: {
      data: {
        plan: planMock,
      },
    },
  },
];

const emptyQuestionsMocks = [
  // Empty questions query
  {
    request: {
      query: PublishedQuestionsDocument,
      variables: { planId: 456, versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedQuestions: [],
      },
    },
  },
  // Section query success
  {
    request: {
      query: PublishedSectionDocument,
      variables: { versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedSection: versionedSectionMock,
      },
    },
  },
  // Plan query success
  {
    request: {
      query: PlanDocument,
      variables: { planId: 456 },
    },
    result: {
      data: {
        plan: planMock,
      },
    },
  },
];

describe('PlanOverviewSectionPage', () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue(mockParams);
  });

  it('should render the page with questions and section data', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Check that loading state is shown initially
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that questions are rendered
    expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument();
    expect(screen.getByText('What type of metadata will be collected?')).toBeInTheDocument();
    expect(screen.getByText('Will all data be converted to open source formats?')).toBeInTheDocument();

    // Check that section name is used in page title
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();

    // Check that requirements section is rendered
    expect(screen.getByText('headings.requirementsBy')).toBeInTheDocument();
    expect(screen.getByText('Requirements text for the section')).toBeInTheDocument();
    expect(screen.getByText('Requirements by University of California')).toBeInTheDocument();

    // Check for best practice content in sidebar
    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'bestPractice' })).toBeInTheDocument();
    const bestPracticeDataDescription = screen.getByRole('heading', { level: 3, name: 'dataDescription' });
    expect(bestPracticeDataDescription).toBeInTheDocument();
    const bestPracticeDataFormat = screen.getByRole('heading', { level: 3, name: 'dataFormat' });
    expect(bestPracticeDataFormat).toBeInTheDocument();
    const bestPracticeDataVolume = screen.getByRole('heading', { level: 3, name: 'dataVolume' });
    expect(bestPracticeDataVolume).toBeInTheDocument();
  });

  it('should handle empty questions list', async () => {
    render(
      <MockedProvider mocks={emptyQuestionsMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that no questions are rendered
    expect(screen.queryByText('What types of data will be produced during your project?')).not.toBeInTheDocument();

    // Check that other content is still rendered
    expect(screen.getByText('headings.requirementsBy')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'bestPractice' })).toBeInTheDocument();
  });

  it('should handle GraphQL errors gracefully', async () => {
    render(
      <MockedProvider mocks={errorMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error loading questions: Failed to fetch questions')).toBeInTheDocument();
    });
  });

  it('should render question cards with proper structure', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that question cards are rendered
    const questionCards = screen.getAllByRole('region').filter(section =>
      section.className.includes('questionCard')
    );
    expect(questionCards).toHaveLength(3);

    // Check first question card structure
    const firstCard = questionCards[0];
    expect(firstCard).toHaveAttribute('aria-labelledby', 'question-title-1');

    // Check question title
    const title = firstCard.querySelector('h3');
    expect(title).toHaveTextContent('What types of data will be produced during your project?');
    expect(title).toHaveAttribute('id', 'question-title-1');

    // Check progress indicator
    const progressIndicator = firstCard.querySelector('.progressIndicator');
    expect(progressIndicator).toHaveAttribute('aria-label', 'Question status: question.notAnswered');

    // Check action button
    const actionButton = firstCard.querySelector('a[href*="/q/1"]');
    expect(actionButton).toHaveTextContent('sections.start');
  });

  it('should generate correct links for questions', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that links are generated correctly
    const questionLinks = screen.getAllByText('sections.start');
    expect(questionLinks).toHaveLength(2);

    const questionLinksUpdate = screen.getAllByText('sections.update');
    expect(questionLinksUpdate).toHaveLength(1);

    expect(questionLinks[0]).toHaveAttribute(
      'href',
      '/en-US/projects/123/dmp/456/s/456/q/1'
    );
    expect(questionLinks[1]).toHaveAttribute(
      'href',
      '/en-US/projects/123/dmp/456/s/456/q/3'
    );

    expect(questionLinksUpdate[0]).toHaveAttribute(
      'href',
      '/en-US/projects/123/dmp/456/s/456/q/2'
    );
  });

  it('should generate correct completed description for questions', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    expect(screen.getAllByLabelText('Question status: question.answered')).toHaveLength(1);
    expect(screen.getAllByLabelText('Question status: question.notAnswered')).toHaveLength(2);
  });

  it('should handle missing section data gracefully', async () => {
    const missingSectionMocks = [
      {
        request: {
          query: PublishedQuestionsDocument,
          variables: { planId: 456, versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedQuestions: versionedQuestionsMock,
          },
        },
      },
      {
        request: {
          query: PublishedSectionDocument,
          variables: { versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedSection: null,
          },
        },
      },
      {
        request: {
          query: PlanDocument,
          variables: { planId: 456 },
        },
        result: {
          data: {
            plan: planMock,
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={missingSectionMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that default section name is used
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
  });

  it('should handle null questions gracefully', async () => {
    const nullQuestionsMocks = [
      {
        request: {
          query: PublishedQuestionsDocument,
          variables: { planId: 456, versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedQuestions: [null, ...versionedQuestionsMock, null],
          },
        },
      },
      {
        request: {
          query: PublishedSectionDocument,
          variables: { versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedSection: versionedSectionMock,
          },
        },
      },
      {
        request: {
          query: PlanDocument,
          variables: { planId: 456 },
        },
        result: {
          data: {
            plan: planMock,
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={nullQuestionsMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that only valid questions are rendered (3 questions, not 5)
    const questionCards = screen.getAllByRole('region').filter(section =>
      section.className.includes('questionCard')
    );
    expect(questionCards).toHaveLength(3);
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle missing question text gracefully', async () => {
    const incompleteMocks = [
      {
        request: {
          query: PublishedQuestionsDocument,
          variables: { planId: 456, versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedQuestions: [
              {
                id: 1,
                questionText: null,
                displayOrder: 1,
                guidanceText: 'Guidance for question 1',
                requirementText: 'Requirement for question 1',
                sampleText: 'Sample for question 1',
                versionedSectionId: 456,
                versionedTemplateId: 789,
                hasAnswer: false,
              },
            ],
          },
        },
      },
      {
        request: {
          query: PublishedSectionDocument,
          variables: { versionedSectionId: 456 },
        },
        result: {
          data: {
            publishedSection: versionedSectionMock,
          },
        },
      },
      {
        request: {
          query: PlanDocument,
          variables: { planId: 456 },
        },
        result: {
          data: {
            plan: planMock,
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={incompleteMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    });

    // Check that question card is still rendered with empty title
    const questionCards = screen.getAllByRole('region').filter(section =>
      section.className.includes('questionCard')
    );
    expect(questionCards).toHaveLength(1);

    const title = questionCards[0].querySelector('h3');
    expect(title).toHaveTextContent('');
  });
});