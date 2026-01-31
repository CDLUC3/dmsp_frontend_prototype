import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { useParams } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';

import {
  MeDocument,
  PlanDocument,
  PublishedQuestionsDocument,
  PublishedSectionDocument,
  VersionedGuidanceDocument,
  GuidanceSourcesForPlanDocument
} from '@/generated/graphql';

// Mocks
import versionedQuestionMock from '../__mocks__/versionedQuestionMock';
import versionedSectionMock from '../__mocks__/versionedSectionMock';
import planMock from '../__mocks__/planMock';
import meMock from '../__mocks__/meMock';
import guidanceSourcesForPlanMock from '../__mocks__/guidanceSourcesForPlanMock';
import versionedGuidanceMock from '../__mocks__/versionedGuidanceMock';
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

// Mock GuidancePanel component
jest.mock('@/components/GuidancePanel', () => ({
  __esModule: true,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  default: ({ guidanceItems, sectionTags }: any) => (
    <div data-testid="mock-guidance-panel">
      <div data-testid="guidance-items-count">{guidanceItems.length}</div>
      <div data-testid="section-tags-count">{Object.keys(sectionTags).length}</div>
    </div>
  ),
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

const mocks = [
  // Successful questions query
  {
    request: {
      query: PublishedQuestionsDocument,
      variables: { planId: 456, versionedSectionId: 456 },
    },
    result: {
      data: {
        publishedQuestions: versionedQuestionMock,
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
  // Successful me query
  {
    request: {
      query: MeDocument,
    },
    result: {
      data: {
        me: meMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [1, 2],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: GuidanceSourcesForPlanDocument,
      variables: {
        planId: 456,
        versionedSectionId: 456,
      },
    },
    result: {
      data: {
        guidanceSourcesForPlan: guidanceSourcesForPlanMock,
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
  {
    request: {
      query: MeDocument,
    },
    result: {
      data: {
        me: meMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [1, 2],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: GuidanceSourcesForPlanDocument,
      variables: {
        planId: 456,
        versionedSectionId: 456,
      },
    },
    result: {
      data: {
        guidanceSourcesForPlan: guidanceSourcesForPlanMock,
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
  {
    request: {
      query: MeDocument,
    },
    result: {
      data: {
        me: meMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [1, 2],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: VersionedGuidanceDocument,
      variables: {
        affiliationId: 'https://ror.org/03yrm5c26',
        tagIds: [],
      },
    },
    result: {
      data: {
        versionedGuidance: versionedGuidanceMock,
      },
    },
  },
  {
    request: {
      query: GuidanceSourcesForPlanDocument,
      variables: {
        planId: 456,
        versionedSectionId: 456,
      },
    },
    result: {
      data: {
        guidanceSourcesForPlan: guidanceSourcesForPlanMock,
      },
    },
  },
];


describe('PlanOverviewSectionPage', () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue(mockParams);
    jest.clearAllMocks();
  });

  it('should render the page with questions and section data', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument()
    );

    // Check that questions are rendered
    expect(screen.getByText('What type of metadata will be collected?')).toBeInTheDocument();
    expect(screen.getByText('Will all data be converted to open source formats?')).toBeInTheDocument();

    // Check that section name is used in page title
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();

    // Check that requirements section is rendered
    expect(screen.getByText('headings.requirementsBy')).toBeInTheDocument();
    expect(screen.getByText('Requirements text for the section')).toBeInTheDocument();
    expect(screen.getByText('Requirements by University of California')).toBeInTheDocument();

    // Check for mock sidebar
    expect(screen.getByTestId('mock-guidance-panel')).toBeInTheDocument();

  });

  it('should handle empty questions list', async () => {
    render(
      <MockedProvider mocks={emptyQuestionsMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('Requirements text for the section')).toBeInTheDocument()
    );

    // Check that other content is still rendered
    expect(screen.getByText('headings.requirementsBy')).toBeInTheDocument();
    // Check for mock sidebar
    expect(screen.getByTestId('mock-guidance-panel')).toBeInTheDocument();
  });

  it('should handle GraphQL errors gracefully', async () => {
    render(
      <MockedProvider mocks={errorMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('errors.errorLoadingSections')).toBeInTheDocument();
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
      expect(screen.queryByText('messaging.loading')).not.toBeInTheDocument();
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

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('Requirements text for the section')).toBeInTheDocument()
    );

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

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument()
    );

    expect(screen.getAllByLabelText('Question status: question.answered')).toHaveLength(1);
    expect(screen.getAllByLabelText('Question status: question.notAnswered')).toHaveLength(2);
  });

  it('should handle missing section data gracefully', async () => {
    // Clone the base mocks and override the PublishedSectionDocument result
    const missingSectionMocks = mocks.map(mock => {
      if (
        mock.request.query === PublishedSectionDocument &&
        mock.request.variables?.versionedSectionId === 456
      ) {
        return {
          ...mock,
          result: { data: { publishedSection: null } },
        };
      }
      return mock;
    });


    render(
      <MockedProvider mocks={missingSectionMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument()
    );

    // Check that default section name is used
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
  });

  it('should handle null questions gracefully', async () => {
    const nullQuestionsMocks = mocks.map(mock => {
      if (
        mock.request.query === PublishedQuestionsDocument &&
        mock.request.variables?.planId === 456 &&
        mock.request.variables?.versionedSectionId === 456
      ) {
        return {
          ...mock,
          result: {
            data: {
              publishedQuestions: [null, ...versionedQuestionMock, null],
            },
          },
        };
      }
      return mock;
    });

    render(
      <MockedProvider mocks={nullQuestionsMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );
    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument()
    );

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

    await waitFor(() =>
      expect(screen.getByText('What types of data will be produced during your project?')).toBeInTheDocument()
    );
    await waitFor(() => {
      expect(screen.queryByText('messaging.loading')).not.toBeInTheDocument();
    });

    let results;
    await act(async () => {
      results = await axe(container);
    });

    expect(results).toHaveNoViolations();
  });

  it('should handle missing question text gracefully', async () => {
    const incompleteMocks = mocks.map(mock => {
      if (
        mock.request.query === PublishedQuestionsDocument &&
        mock.request.variables?.planId === 456 &&
        mock.request.variables?.versionedSectionId === 456
      ) {
        return {
          ...mock,
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
        };
      }
      return mock;
    });

    render(
      <MockedProvider mocks={incompleteMocks}>
        <PlanOverviewSectionPage />
      </MockedProvider>
    );

    // Check that initial questions are loaded
    await waitFor(() =>
      expect(screen.getByText('Requirements text for the section')).toBeInTheDocument()
    );

    // Check that question card is still rendered with empty title
    const questionCards = screen.getAllByRole('region').filter(section =>
      section.className.includes('questionCard')
    );
    expect(questionCards).toHaveLength(1);

    const title = questionCards[0].querySelector('h3');
    expect(title).toHaveTextContent('');
  });
});