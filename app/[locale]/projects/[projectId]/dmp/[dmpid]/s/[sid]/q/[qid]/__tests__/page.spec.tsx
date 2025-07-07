import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  useAnswerByVersionedQuestionIdLazyQuery,
  useSectionVersionsQuery,
  usePlanQuery,
  useQuestionQuery,
} from '@/generated/graphql';
import * as apolloClientModule from '@/lib/graphql/client/apollo-client';

import mockAnswerData from '../__mocks__/mockAnswerData.json';
import mockPlanData from '../__mocks__/mockPlanData.json';
import mockQuestionData from '../__mocks__/mockQuestionData.json';

// Mocked question data
import mockCheckboxQuestion from '../__mocks__/mockCheckboxQuestion.json';
import mockSectionVersionsData from '../__mocks__/mockSectionVersions.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockQuestionDataForTextField.json';
import mockRadioQuestion from '@/__mocks__/common/mockRadioQuestion.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockQuestionDataForCurrency.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockQuestionDataForURL.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockQuestionDataForDateRange.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockQuestionDataForTypeAheadSearch.json';

// Mocked answer data
import mockAnswerDataForDateRange from '@/__mocks__/common/mockAnswerDataForDateRange.json';


import { mockScrollIntoView } from "@/__mocks__/common";
import PlanOverviewQuestionPage from "../page";

expect.extend(toHaveNoViolations);


// Mock the GraphQL query and mutation hooks
jest.mock("@/generated/graphql", () => ({
  useAnswerByVersionedQuestionIdLazyQuery: jest.fn(),
  useSectionVersionsQuery: jest.fn(),
  usePlanQuery: jest.fn(),
  useQuestionQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('@/lib/graphql/client/apollo-client');

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;

describe('PlanOverviewQuestionPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1, sid: 22, qid: 344 });
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    (useSectionVersionsQuery as jest.Mock).mockReturnValue({
      data: mockSectionVersionsData,
      loading: false,
      error: undefined,
    });

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionData,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is your loadAnswer function
      {
        data: mockAnswerData,
        loading: false,
        error: undefined,
      },
    ]);

  })

  // Test that correct question loads (test a couple of different question types) with correct content
  // Test interactions with each question type to make sure changes are handled correctly
  // Test that the correct title is displayed in heading
  // Test that expected content is displayed for requirements and guidance
  // Test that the "View sample text" is displayed for text area type, but not for other types
  // Test that the comments button is present
  // Test that the "Required by funder" text is present when the question is required, and not present when the question is not required
  // Test for info icon
  // Test that Back to Section and Save button are displayed
  // Test that when a user clicks on the "View sample text" button that the DrawerPanel opens with the correct content
  // Test that when the user clicks the "Close" button that the Drawer Panel closes
  // Test that when the user clicks "use answer" button when the drawer is open, that the contents is transferred to the question answer
  // Test that when the user clicks on the "Comments" button that the DrawerPanel opens
  // Test that when the user clicks the "Close" button that the Drawer Panel closes

  it('should load correct question content for textArea question', async () => {
    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });
    // Check for Requirements content
    expect(screen.getByRole('heading', { level: 3, name: 'page.requirementsBy' })).toBeInTheDocument();
    const boldedRequirements = screen.getByText('Requirements - Lorem Ipsum');
    expect(boldedRequirements).toBeInTheDocument();
    expect(boldedRequirements.tagName).toBe('STRONG');
    expect(screen.getByText((content) => content.includes('is simply dummy requirements text'))).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Requirements by University of California' })).toBeInTheDocument();
    const orgRequirements = screen.getByText(/cleared by the ethics committee/i);
    expect(orgRequirements.tagName).toBe('P');
    // check that the 'Jump to guidance' link is present
    expect(screen.getByRole('link', { name: /page.jumpToGuidance/i })).toBeInTheDocument();

    // Check that question card is in the page with correct question details
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Text area question' })).toBeInTheDocument();
    const requirementsByFunder = screen.getByText('page.requiredByFunder');
    expect(requirementsByFunder).toBeInTheDocument();
    expect(requirementsByFunder.tagName).toBe('STRONG');
    // check for info icon button
    expect(screen.getByRole('button', { name: 'Required by funder' })).toBeInTheDocument();
    // check for drawer panel trigger buttons
    expect(screen.getByRole('button', { name: 'page.viewSampleAnswer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    // Check that the textArea question field is in page
    expect(screen.getByLabelText('question-text-editor')).toBeInTheDocument();

    // Check for guidance content
    expect(screen.getByRole('heading', { level: 3, name: 'page.guidanceBy' })).toBeInTheDocument();
    const boldedGuidance = screen.getByText('Guidance text - Lorem Ipsum');
    expect(boldedGuidance).toBeInTheDocument();
    expect(boldedGuidance.tagName).toBe('STRONG');
    expect(screen.getByText((content) => content.includes('is simply dummy guidance text'))).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Guidance by University of California' }));
    const orgGuidance = screen.getByText(/This is the most detailed section/i);
    expect(orgGuidance.tagName).toBe('P');
    expect(screen.getByRole('button', { name: 'labels.saveAnswer' })).toBeInTheDocument();

    // Check for best practice content in sidebar
    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Best practice by DMP Tool' })).toBeInTheDocument();
    const bestPracticeSubHeading = screen.getByText(/Most relevant best practice guide/i);
    expect(bestPracticeSubHeading).toBeInTheDocument();
    expect(bestPracticeSubHeading.tagName).toBe('P');
    expect(screen.getByRole('link', { name: /Data sharing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Data preservation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Data protection/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All topics/i })).toBeInTheDocument();
  })

  it('should load correct question content for checkbox question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // Check that question card is in the page with correct question details
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Checkbox question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    const checkboxGroup = screen.getByTestId('checkbox-group');
    expect(checkboxGroup).toBeInTheDocument();
    const checkboxes = within(checkboxGroup).getAllByRole('checkbox');
    const alexCheckbox = checkboxes.find(
      (checkbox) => (checkbox as HTMLInputElement).value === 'Alex'
    );
    const barbaraCheckbox = checkboxes.find(
      (checkbox) => (checkbox as HTMLInputElement).value === 'Barbara'
    );
    const charlieCheckbox = checkboxes.find(
      (checkbox) => (checkbox as HTMLInputElement).value === 'Charlie'
    );

    expect(alexCheckbox).toBeInTheDocument();
    expect(barbaraCheckbox).toBeInTheDocument();
    expect(barbaraCheckbox).toBeChecked();
    expect(charlieCheckbox).toBeInTheDocument();
    expect(charlieCheckbox).toBeChecked();
  })

  it('should load correct question content for text field question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: "Testing" })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    const textFieldWrapper = screen.getByTestId('field-wrapper');
    expect(textFieldWrapper).toBeInTheDocument();
    expect(within(textFieldWrapper).getByLabelText('text')).toBeInTheDocument();
    const input = within(textFieldWrapper).getByRole('textbox');
    expect(input).toBeInTheDocument();
  })

  it('should load correct question content for typeaheadSearch question', async () => {
    const mockQuery = jest.fn();
    const mockClient = { query: mockQuery };
    (apolloClientModule.createApolloClient as jest.Mock).mockImplementation(() => mockClient);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Affiliation search question' }))
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    const typeAheadContainer = screen.getByTestId('typeaheadWithOther');
    expect(typeAheadContainer).toBeInTheDocument();
    expect(within(typeAheadContainer).getByText('Affiliation')).toBeInTheDocument();
    const input = within(typeAheadContainer).getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(within(typeAheadContainer).getByText('Enter a search term to find your affiliation')).toBeInTheDocument();
  })

  it('should load correct question content for date range question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is your loadAnswer function
      {
        data: mockAnswerDataForDateRange,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    screen.debug(undefined, Infinity);
    expect(screen.getByRole('heading', { level: 2, name: 'Date range question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    // Date range container
    const dateRangeContainer = screen.getByTestId('date-range-container');
    expect(dateRangeContainer).toBeInTheDocument();
    const datePicker = screen.queryAllByTestId('date-picker');
    const startDate = within(datePicker[0]);
    const endDate = within(datePicker[1]);
    expect(datePicker).toHaveLength(2);

    // Start Date
    expect(within(datePicker[0]).getByText('Beginning')).toBeInTheDocument();
    const startMonthSegment = startDate.getByRole('spinbutton', { name: /month/i })
    const startDaySegment = startDate.getByRole('spinbutton', { name: /day/i })
    const startYearSegment = startDate.getByRole('spinbutton', { name: /year/i })
    expect(startMonthSegment).toHaveTextContent('5');
    expect(startDaySegment).toHaveTextContent('5');
    expect(startYearSegment).toHaveTextContent('2025');

    // End Date
    expect(within(datePicker[1]).getByText('Ending')).toBeInTheDocument();
    const EndMonthSegment = endDate.getByRole('spinbutton', { name: /month/i })
    const EndDaySegment = endDate.getByRole('spinbutton', { name: /day/i })
    const EndYearSegment = endDate.getByRole('spinbutton', { name: /year/i })
    expect(EndMonthSegment).toHaveTextContent('7');
    expect(EndDaySegment).toHaveTextContent('5');
    expect(EndYearSegment).toHaveTextContent('2025');

  })

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewQuestionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});

