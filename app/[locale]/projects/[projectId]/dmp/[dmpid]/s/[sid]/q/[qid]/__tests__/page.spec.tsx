import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  useAnswerByVersionedQuestionIdLazyQuery,
  useSectionVersionsQuery,
  usePlanQuery,
  useQuestionQuery,
} from '@/generated/graphql';
import {
  addAnswerAction,
  updateAnswerAction
} from '../actions';

import * as apolloClientModule from '@/lib/graphql/client/apollo-client';

import mockAnswerData from '../__mocks__/mockAnswerData.json';
import mockPlanData from '../__mocks__/mockPlanData.json';
import mockQuestionData from '../__mocks__/mockQuestionData.json';

// Mocked question data
import mockCheckboxQuestion from '../__mocks__/mockCheckboxQuestion.json';
import mockSectionVersionsData from '../__mocks__/mockSectionVersions.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockQuestionDataForTextField.json';
import mockQuestionDataForRadioButton from '@/__mocks__/common/mockQuestionDataForRadioButton.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockQuestionDataForCurrency.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockQuestionDataForURL.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockQuestionDataForDateRange.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockQuestionDataForTypeAheadSearch.json';
import mockQuestionDataForDate from '@/__mocks__/common/mockQuestionDataForDate.json';
import mockQuestionDataForBoolean from '@/__mocks__/common/mockQuestionDataForBoolean.json';
import mockQuestionDataForEmail from '@/__mocks__/common/mockQuestionDataForEmail.json';
import mockQuestionDataForNumberRange from '@/__mocks__/common/mockQuestionDataForNumberRange.json';
import mockQuestionDataForNumber from '@/__mocks__/common/mockQuestionDataForNumber.json';
import mockQuestionDataForMultiSelect from '@/__mocks__/common/mockQuestionDataForMultiSelect.json';
import mockQuestionDataForSelectBox from '@/__mocks__/common/mockQuestionDataForSelectBox.json';
import mockQuestionDataForTextArea from '@/__mocks__/common/mockQuestionDataForTextArea.json';

// Mocked answer data
import mockAnswerDataForTextField from '@/__mocks__/common/mockAnswerDataForTextField.json';
import mockAnswerDataForDate from '@/__mocks__/common/mockAnswerDataForDate.json';
import mockAnswerDataForDateRange from '@/__mocks__/common/mockAnswerDataForDateRange.json';
import mockAnswerDataForTypeAheadSearch from '@/__mocks__/common/mockAnswerDataForTypeAheadSearch.json';
import mockAnswerDataForBoolean from '@/__mocks__/common/mockAnswerDataForBoolean.json';
import mockAnswerDataForURL from '@/__mocks__/common/mockAnswerDataForURL.json';
import mockAnswerDataForEmail from '@/__mocks__/common/mockAnswerDataForEmail.json';
import mockAnswerDataForCurrency from '@/__mocks__/common/mockAnswerDataForCurrency.json';
import mockAnswerDataForNumberRange from '@/__mocks__/common/mockAnswerDataForNumberRange.json';
import mockAnswerDataForNumber from '@/__mocks__/common/mockAnswerDataForNumber.json';
import mockAnswerDataForMultiSelect from '@/__mocks__/common/mockAnswerDataForMultiSelect.json';
import mockAnswerDataForSelectBox from '@/__mocks__/common/mockAnswerDataForSelectBox.json';
import mockAnswerDataForRadioButton from '@/__mocks__/common/mockAnswerDataForRadioButton.json';
import mockAnswerDataForTextArea from '@/__mocks__/common/mockAnswerDataForTextArea.json';
import mockCheckboxAnswer from '../__mocks__/mockCheckboxAnswer.json';


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

// Mock actions
jest.mock('../actions/index', () => ({
  addAnswerAction: jest.fn(),
  updateAnswerAction: jest.fn(),
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

describe('PlanOverviewQuestionPage render of questions', () => {
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
      jest.fn(), // this is the loadAnswer function
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

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForTextArea,
        loading: false,
        error: undefined,
      },
    ]);

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

  it('should load correct question content for radioButton question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForRadioButton,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForRadioButton,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // Check that question card is in the page with correct question details
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Radio button question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    //Radio group
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    const yesRadio = within(radioGroup).getByRole('radio', { name: /yes/i });
    expect(yesRadio).toBeInTheDocument();
    const noRadio = within(radioGroup).getByRole('radio', { name: /no/i });
    expect(noRadio).toBeInTheDocument();
    const maybeRadio = within(radioGroup).getByRole('radio', { name: /maybe/i });
    expect(maybeRadio).toBeInTheDocument();
    // Check that the correct radio button is selected
    const yesLabel = screen.getByText('Yes').closest('label');
    expect(yesLabel).toBeInTheDocument();
    expect(yesLabel).toHaveAttribute('data-selected', 'true');
  })

  it('should load correct question content for text field question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForTextField,
        loading: false,
        error: undefined,
      },
    ]);

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

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForTypeAheadSearch,
        loading: false,
        error: undefined,
      },
    ]);


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
      jest.fn(), // this is the loadAnswer function
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

  it('should load correct question content for date question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDate,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForDate,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Date field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();
    // Date picker container
    const datePicker = screen.getByTestId('date-picker');
    const date = within(datePicker);

    // Date
    expect(within(datePicker).getByText('Date')).toBeInTheDocument();
    const monthSegment = date.getByRole('spinbutton', { name: /month/i })
    const daySegment = date.getByRole('spinbutton', { name: /day/i })
    const yearSegment = date.getByRole('spinbutton', { name: /year/i })
    expect(monthSegment).toHaveTextContent('7');
    expect(daySegment).toHaveTextContent('1');
    expect(yearSegment).toHaveTextContent('2025');
  })

  it('should load correct question content for boolean question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForBoolean,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForBoolean,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Yes/No question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    //Radio group
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    const yesCheckbox = within(radioGroup).getByRole('radio', { name: /yes/i });
    expect(yesCheckbox).toBeInTheDocument();
    const noCheckbox = within(radioGroup).getByRole('radio', { name: /no/i });
    expect(noCheckbox).toBeInTheDocument();
  })

  it('should load correct question content for url question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForURL,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForURL,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Url question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    const urlInput = screen.getByPlaceholderText('url');
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveValue('https://cdlib.org');
  })

  it('should load correct question content for email question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForEmail,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForEmail,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Email field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('js@example.com');
  })

  it('should load correct question content for currency question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForCurrency,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForCurrency,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Currency Field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    // Should see increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');
    expect(decreaseButton.length).toBe(1);
    expect(increaseButton.length).toBe(1);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('$1.00');
  })

  it('should load correct question content for numberRange question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumberRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForNumberRange,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Number Range question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    expect(screen.getByText('Starting')).toBeInTheDocument();
    expect(screen.getByText('Ending')).toBeInTheDocument();
    // Should see increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');
    expect(decreaseButton.length).toBe(2);
    expect(increaseButton.length).toBe(2);
    // Should see input fields with correct values
    const startInput = screen.getByPlaceholderText('start');
    const endInput = screen.getByPlaceholderText('end');
    expect(startInput).toHaveValue('1');
    expect(endInput).toHaveValue('10');
  })

  it('should load correct question content for number question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumber,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForNumber,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Number Field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    expect(screen.getByText('number')).toBeInTheDocument();
    // Should see increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');
    expect(decreaseButton.length).toBe(1);
    expect(increaseButton.length).toBe(1);
    // Should see input fields with correct values
    const input = screen.getByPlaceholderText('number');
    expect(input).toHaveValue('2');
  })

  it('should load correct question content for multiSelect question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForMultiSelect,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForMultiSelect,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Multi select question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    expect(screen.getByText('Select Items (Multiple)')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Pear')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();

    // Get all options
    const options = screen.getAllByRole('option');

    // Check selected state by aria-selected
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
    expect(options[3]).toHaveAttribute('aria-selected', 'true');
  })

  it('should load correct question content for selectBox question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForSelectBox,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForSelectBox,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Select box question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 Comments' })).toBeInTheDocument();

    const selectButton = screen.getByTestId('select-button');
    expect(within(selectButton).getByText('Oregon')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'California' })).not.toBeInTheDocument();
    act(() => {
      fireEvent.click(selectButton);
    })
    expect(screen.getByRole('option', { name: 'California' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Washington' })).toBeInTheDocument();
  })

  it('should redirect to section overview page when user clicks \'Back to section\' button', async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForTextArea,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const backToSectionBtn = screen.getByRole('button', { name: 'labels.returnToSection' });

    fireEvent.click(backToSectionBtn);

    expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/1/dmp/1/s/22');
  })

  it('should pass accessibility tests', async () => {
    const { container } = render(<PlanOverviewQuestionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});

describe('Call to updateAnswerAction', () => {
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
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerData,
        loading: false,
        error: undefined,
      },
    ]);
  })

  it('should call updateAnswerAction with correct data for checkbox', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockCheckboxAnswer,
        loading: false,
        error: undefined,
      },
    ]);

    (addAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
        },
        id: 27,
        json: "{\"answer\":[\"Barbara\",\"Charlie\",\"Alex\"]}",
        modified: "1751929006000",
        versionedQuestion: {
          versionedSectionId: 20
        }
      },
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const checkboxGroup = screen.getByTestId('checkbox-group');
    expect(checkboxGroup).toBeInTheDocument();
    const checkboxes = within(checkboxGroup).getAllByRole('checkbox');
    const alexCheckbox = checkboxes.find(
      (checkbox) => (checkbox as HTMLInputElement).value === 'Alex'
    );

    await userEvent.click(alexCheckbox!);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 27,
        json: "{\"answer\":[\"Barbara\",\"Charlie\"]}"
      });
    });
  });

  it('should call updateAnswerAction with correct data for radioButton', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForRadioButton,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForRadioButton,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    const noRadio = within(radioGroup).getByRole('radio', { name: /no/i });

    await userEvent.click(noRadio!);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 5,
        json: "{\"answer\":\"No\"}"
      });
    });
  });

  it('should call updateAnswerAction with correct data for text field', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForTextField,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const textFieldWrapper = screen.getByTestId('field-wrapper');
    expect(textFieldWrapper).toBeInTheDocument();
    expect(within(textFieldWrapper).getByLabelText('text')).toBeInTheDocument();
    const input = within(textFieldWrapper).getByRole('textbox');

    // trigger change in textbox value
    await userEvent.clear(input);
    await userEvent.type(input, 'New input value');

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 21,
        json: "{\"answer\":\"New input value\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for date range question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
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

    const buttons = screen.getAllByLabelText('Calendar');

    // Open the date picker
    await userEvent.click(buttons[0]);

    // Find the day button for the date you want to select (e.g., 15th)
    const dayButton = await screen.findByRole('button', { name: /15/ });
    await userEvent.click(dayButton);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 16,
        json: "{\"answer\":{\"startDate\":\"2025-05-15\",\"endDate\":\"2025-07-05\"}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for date question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDate,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForDate,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const dateBtn = screen.getByLabelText('Calendar');

    // Open the date picker
    await userEvent.click(dateBtn);

    // Find the day button for the date you want to select (e.g., 15th)
    const dayButton = await screen.findByRole('button', { name: /15/ });
    await userEvent.click(dayButton);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 15,
        json: "{\"answer\":{\"startDate\":\"2025-07-15\",\"endDate\":\"\"}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for boolean', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForBoolean,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForBoolean,
        loading: false,
        error: undefined,
      },
    ]);


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    //Radio group
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    const yesCheckbox = within(radioGroup).getByRole('radio', { name: /yes/i });
    expect(yesCheckbox).toBeInTheDocument();
    const noCheckbox = within(radioGroup).getByRole('radio', { name: /no/i });
    expect(noCheckbox).toBeInTheDocument();

    await userEvent.click(noCheckbox!);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 14,
        json: "{\"answer\":\"no\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for url question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForURL,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForURL,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const urlInput = screen.getByPlaceholderText('url');
    // trigger change in textbox value
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, 'https://ucop.edu');

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 13,
        json: "{\"answer\":\"https://ucop.edu\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for email question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForEmail,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForEmail,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });
    const emailInput = screen.getByPlaceholderText('email');
    // trigger change in textbox value
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 12,
        json: "{\"answer\":\"test@example.com\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for currency question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForCurrency,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForCurrency,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const numberGroup = screen.getByRole('group');
    const currencyInput = within(numberGroup).getByRole('textbox');

    await userEvent.clear(currencyInput);
    await userEvent.type(currencyInput, '15.00');
    await userEvent.tab(); // 👈 React Aria Component NumberField requires this to be able to register an input change

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 11,
        json: "{\"answer\":15}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for numberRange question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumberRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForNumberRange,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const startInput = screen.getByPlaceholderText('start');

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '2');
    await userEvent.tab(); // 👈 React Aria Component NumberField requires this to be able to register an input change

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 10,
        json: "{\"answer\":{\"startNumber\":2,\"endNumber\":10}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for number question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumber,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForNumber,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });
    const startInput = screen.getByPlaceholderText('number');

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '3');
    await userEvent.tab(); // 👈 React Aria Component NumberField requires this to be able to register an input change

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 9,
        json: "{\"answer\":3}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for multiSelect question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForMultiSelect,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForMultiSelect,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // Get all options
    const options = screen.getAllByRole('option');

    fireEvent.click(options[0]);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 18,
        json: "{\"answer\":[\"Banana\",\"Pear\",\"Orange\",\"Apple\"]}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for selectBox question', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForSelectBox,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdLazyQuery as jest.Mock).mockReturnValue([
      jest.fn(), // this is the loadAnswer function
      {
        data: mockAnswerDataForSelectBox,
        loading: false,
        error: undefined,
      },
    ]);

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const selectButton = screen.getByTestId('select-button');
    act(() => {
      fireEvent.click(selectButton);
    })
    const caOption = screen.getByRole('option', { name: 'California' });

    fireEvent.click(caOption);

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 30,
        json: "{\"answer\":\"California\"}"
      });
    });
  })
})

