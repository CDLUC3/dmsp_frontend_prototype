import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  useAnswerByVersionedQuestionIdQuery,
  usePublishedQuestionQuery,
  usePlanQuery,
  useMeQuery,
  useGuidanceGroupsQuery
} from '@/generated/graphql';
import {
  addAnswerAction,
  updateAnswerAction
} from '../actions';
import mockAnswerData from '../__mocks__/mockAnswerData.json';
import mockPlanData from '../__mocks__/mockPlanData.json';
import mockPublishedQuestion from '../__mocks__/mockPublishedQuestion.json';
import mockGuidanceGroupsData from '../__mocks__/mocksGuidanceGroupData.json';
import mockMeData from '../__mocks__/mockMeQuery.json';
// Mocked question data
import mockCheckboxQuestion from '../__mocks__/mockCheckboxQuestion.json';
import mockQuestionDataForBoolean from '@/__mocks__/common/mockPublishedQuestionDataForBoolean.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockPublishedQuestionDataForCurrency.json';
import mockQuestionDataForDate from '@/__mocks__/common/mockPublishedQuestionDataForDate.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockPublishedQuestionDataForDateRange.json';
import mockQuestionDataForEmail from '@/__mocks__/common/mockPublishedQuestionDataForEmail.json';
import mockQuestionDataForMultiSelect from '@/__mocks__/common/mockPublishedQuestionDataForMultiSelect.json';
import mockQuestionDataForNumber from '@/__mocks__/common/mockPublishedQuestionDataForNumber.json';
import mockQuestionDataForNumberRange from '@/__mocks__/common/mockPublishedQuestionDataForNumberRange.json';
import mockQuestionDataForRadioButton from '@/__mocks__/common/mockPublishedQuestionDataForRadioButton.json';
import mockQuestionDataForSelectBox from '@/__mocks__/common/mockPublishedQuestionDataForSelectBox.json';
import mockQuestionDataForTextArea from '@/__mocks__/common/mockPublishedQuestionDataForTextArea.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockPublishedQuestionDataForTextField.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockPublishedQuestionDataForAffiliationSearch.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockPublishedQuestionDataForURL.json';
import mockOtherQuestion from '../__mocks__/mockOtherQuestionData.json';
import mockQuestionDataForResearchOutput from '../__mocks__/mockROPublishedQuestion.json';

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
import mockOtherAnswerData from '../__mocks__/mockOtherAnswerData.json'
import mockAnswerDataForResearchOutput from '../__mocks__/mockROAnswer.json';

import { mockScrollIntoView } from "@/__mocks__/common";
import PlanOverviewQuestionPage from "../page";
import { AffiliationSearchQuestionType } from "@dmptool/types";

// Mock for useComments hook
import { mockUseComments, defaultMockReturn } from '../hooks/__mocks__/useComments';
import { TypeAheadInputProps } from '@/components/Form/TypeAheadWithOther/TypeAheadWithOther';
import mocksAffiliations from '@/__mocks__/common/mockAffiliations.json';

jest.mock('@/components/Form/TypeAheadWithOther', () => ({
  __esModule: true,
  useAffiliationSearch: jest.fn(() => ({
    suggestions: mocksAffiliations,
    handleSearch: jest.fn(),
  })),
  TypeAheadWithOther: ({ label, placeholder, fieldName, updateFormData, value }: TypeAheadInputProps) => {
    const [inputValue, setInputValue] = React.useState(value || '');

    return (
      <div>
        <label>
          {label}
          <input
            aria-label={label}
            placeholder={placeholder}
            name={fieldName}
            role="textbox"
            value={inputValue}
            data-id="https://ror.org/0168r3w48" // Mock the expected ID
            onChange={(e) => {
              const newValue = e.target.value;
              setInputValue(newValue);
              const dataId = (e.target as HTMLElement).dataset.id || '';
              updateFormData?.(dataId, newValue);
            }}
          />
        </label>
        <ul role="listbox">
          <li>Search Term</li>
        </ul>
      </div>
    );
  },
}));

jest.mock('../hooks/useComments', () => {
  const { mockUseComments } = jest.requireActual('../hooks/__mocks__/useComments');
  return {
    useComments: mockUseComments,
  };
});

// Mock the ResearchOutputAnswerComponent directly at its source file
jest.mock('@/components/Form/ResearchOutputAnswerComponent', () => ({
  __esModule: true,
  default: ({ columns, rows, setRows, onSave, columnHeadings }: any) => (
    <div data-testid="research-output-table">
      <div data-testid="column-count">{columns.length}</div>
      <div data-testid="row-count">{rows.length}</div>
      <div data-testid="heading-count">{columnHeadings?.length || 0}</div>
      <button
        onClick={() => {
          // Simulate adding a row
          setRows([...rows, { columns: [] }]);
        }}
      >
        Add Output
      </button>
      <button onClick={() => onSave?.('save')}>Save Output</button>
    </div>
  ),
}));

beforeEach(() => {
  const affiliationQuery = `
  query Affiliations($name: String!) {
    affiliations(name: $name) {
      totalCount
      nextCursor
      items {
        id
        displayName
        uri
      }
    }
  }
`;


  const json: AffiliationSearchQuestionType = {
    type: 'affiliationSearch',
    attributes: {
      label: 'Institution',
      help: 'Search for your institution',
    },
    graphQL: {
      displayFields: [{
        label: "Institution",
        propertyName: "displayName",
      }],
      query: affiliationQuery,
      responseField: 'affiliations.items',
      variables: [{
        label: "Search for your institution",
        minLength: 3,
        name: "name",
        type: "string",
      }],
      answerField: 'uri'
    },
    meta: {
      schemaVersion: '1.0'
    },
  };
  mockQuestionDataForTypeAheadSearch.publishedQuestion.json = JSON.stringify(json);

  // Mock the useComments hook
  mockUseComments.mockReturnValue(defaultMockReturn);
});

expect.extend(toHaveNoViolations);


// Mock the GraphQL query and mutation hooks
jest.mock("@/generated/graphql", () => ({
  useMeQuery: jest.fn(),
  usePlanQuery: jest.fn(),
  usePublishedQuestionQuery: jest.fn(),
  useAnswerByVersionedQuestionIdQuery: jest.fn(),
  useGuidanceGroupsQuery: jest.fn(),
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

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });

    mockUseComments.mockReturnValue(defaultMockReturn);

    (usePlanQuery as jest.Mock).mockReturnValue({
      data: mockPlanData,
      loading: false,
      error: undefined,
    });

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockPublishedQuestion,
      loading: false,
      error: undefined,
    });

    (useGuidanceGroupsQuery as jest.Mock).mockReturnValue({
      data: mockGuidanceGroupsData,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerData,
      loading: false,
      error: undefined,
    });

  })

  it('should load correct question content for textArea question', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });


    //Check for Requirements content
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
    // Should strip out HTML tags for the Question Text
    expect(screen.getByRole('heading', { level: 2, name: 'Text area question' })).toBeInTheDocument();
    const requirementsByFunder = screen.getByText('page.requirementsBy');
    expect(requirementsByFunder).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('is simply dummy requirements'))).toBeInTheDocument();
    expect(requirementsByFunder.tagName).toBe('H3');
    // check for info icon button
    expect(screen.getByRole('button', { name: 'Required by funder' })).toBeInTheDocument();
    // check for drawer panel trigger buttons
    expect(screen.getByRole('button', { name: 'page.viewSampleAnswer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
    // Check that the textArea question field is in page
    expect(screen.getByLabelText('question-text-editor')).toBeInTheDocument();

    // Check for guidance content
    const boldedGuidance = screen.getByText('Guidance text - Lorem Ipsum');
    expect(boldedGuidance).toBeInTheDocument();
    expect(boldedGuidance.tagName).toBe('STRONG');
    expect(screen.getByText((content) => content.includes('is simply dummy guidance text'))).toBeInTheDocument();
    // There are multiple h3 headings with 'page.guidanceBy' (one for funder, one for org)
    const guidanceHeadings = screen.getAllByRole('heading', { level: 3, name: 'page.guidanceBy' });
    expect(guidanceHeadings).toHaveLength(2);
    expect(screen.getByText('Use the active voice whenever possible')).toBeInTheDocument();
    expect(screen.getByText("Dot your i's and cross your t's")).toBeInTheDocument();
    expect(screen.getByText('Guidance text - Lorem Ipsum')).toBeInTheDocument();
    const orgGuidance = screen.getByText(/is simply dummy guidance text/i);
    expect(orgGuidance.tagName).toBe('P');
    expect(screen.getByRole('button', { name: 'labels.saveAnswer' })).toBeInTheDocument();

    // Check for best practice content in sidebar
    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'bestPractice' })).toBeInTheDocument();
    const bestPracticeDataDescription = screen.getByRole('heading', { level: 3, name: 'dataDescription' });
    expect(bestPracticeDataDescription).toBeInTheDocument();
    const bestPracticeDataFormat = screen.getByRole('heading', { level: 3, name: 'dataFormat' });
    expect(bestPracticeDataFormat).toBeInTheDocument();
    const bestPracticeDataVolume = screen.getByRole('heading', { level: 3, name: 'dataVolume' });
    expect(bestPracticeDataVolume).toBeInTheDocument();
  })

  it('should display disabled comment button when an answer does not exist for the question', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // check for comment button
    const commentButton = screen.getByRole('button', { name: 'buttons.commentWithNumber' });
    expect(commentButton).toBeInTheDocument();
    expect(commentButton).toHaveClass('buttonSmallDisabled');
  })

  it('should load sampleText in textArea if useSampleTextAsDefault is true and sampleText exists in question', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // Check that the textArea question field is in page
    const textAreaQuestion = screen.getByLabelText('question-text-editor');
    expect(textAreaQuestion).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Sample text'))).toBeInTheDocument();
  })

  it('should load correct question content for checkbox question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
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
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
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
    expect(barbaraCheckbox).toHaveAttribute('checked');
    expect(charlieCheckbox).toBeInTheDocument();
    expect(charlieCheckbox).toHaveAttribute('checked');
  })

  it('should load correct question content for radioButton question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForRadioButton,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForRadioButton,
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
    expect(screen.getByRole('heading', { level: 2, name: 'Radio button question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextField,
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
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
    const textFieldWrapper = screen.getByTestId('field-wrapper');
    expect(textFieldWrapper).toBeInTheDocument();
    expect(within(textFieldWrapper).getByLabelText('text')).toBeInTheDocument();
    const input = within(textFieldWrapper).getByRole('textbox');
    expect(input).toBeInTheDocument();
  })

  it('should load correct question content for typeaheadSearch question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTypeAheadSearch,
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
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
    expect(screen.getByLabelText('Institution')).toBeInTheDocument();
    const input = screen.getByLabelText('Institution');
    expect(input).toHaveAttribute('data-id', 'https://ror.org/0168r3w48');

  })

  it('should load correct question content for date range question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForDateRange,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Date range question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDate,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForDate,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Date field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();
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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForBoolean,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForBoolean,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Yes/No question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

    //Radio group
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    const yesCheckbox = within(radioGroup).getByRole('radio', { name: /yes/i });
    expect(yesCheckbox).toBeInTheDocument();
    const noCheckbox = within(radioGroup).getByRole('radio', { name: /no/i });
    expect(noCheckbox).toBeInTheDocument();
  })

  it('should load correct question content for url question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForURL,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForURL,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Url question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

    const urlInput = screen.getByPlaceholderText('url');
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveValue('https://cdlib.org');
  })

  it('should load correct question content for email question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForEmail,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForEmail,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Email field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('js@example.com');
  })

  it('should load correct question content for currency question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForCurrency,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForCurrency,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Currency Field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumberRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForNumberRange,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Number Range question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumber,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForNumber,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Number Field question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForMultiSelect,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForMultiSelect,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Multi select question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForSelectBox,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForSelectBox,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Select box question' })).toBeInTheDocument();
    // View sample text button should not display when the question is not a textArea question type
    expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.commentWithNumber' })).toBeInTheDocument();

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

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const backToSectionBtn = screen.getByRole('button', { name: 'labels.returnToSection' });

    fireEvent.click(backToSectionBtn);

    expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/1/dmp/1/s/22');
  })

});


describe('accessibility', () => {
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

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockPublishedQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerData,
      loading: false,
      error: undefined,
    });

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });

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

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockPublishedQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerData,
      loading: false,
      error: undefined,
    });

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });

    mockUseComments.mockReturnValue(defaultMockReturn);
  })

  it('should call updateAnswerAction when data changes for typeaheadSearch field', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });


    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const searchLabelInput = screen.getByLabelText('Institution');
    fireEvent.change(searchLabelInput, { target: { value: 'UCOP' } });


    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 20,
        json: "{\"type\":\"affiliationSearch\",\"answer\":{\"affiliationId\":\"https://ror.org/0168r3w48\",\"affiliationName\":\"UCOP\"}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for checkbox', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxAnswer,
      loading: false,
      error: undefined,
    });

    (addAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
        },
        id: 27,
        json: "{\"type\":\"checkBoxes\",\"answer\":[\"Barbara\",\"Charlie\",\"Alex\"]}",
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
        json: "{\"type\":\"checkBoxes\",\"answer\":[\"Barbara\",\"Charlie\"]}"
      });
    });
  });

  it('should call updateAnswerAction with correct data for radioButton', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForRadioButton,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForRadioButton,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"radioButtons\",\"answer\":\"No\"}"
      });
    });
  });

  it('should call updateAnswerAction with correct data for text field', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextField,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"text\",\"answer\":\"New input value\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for date range question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForDateRange,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"dateRange\",\"answer\":{\"start\":\"2025-05-15\",\"end\":\"2025-07-05\"}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for date question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDate,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForDate,
      loading: false,
      error: undefined,
    });


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
        json: "{\"type\":\"date\",\"answer\":\"2025-07-15\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for boolean', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForBoolean,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForBoolean,
      loading: false,
      error: undefined,
    });


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
        json: "{\"type\":\"boolean\",\"answer\":\"no\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for url question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForURL,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForURL,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"url\",\"answer\":\"https://ucop.edu\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for email question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForEmail,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForEmail,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"email\",\"answer\":\"test@example.com\"}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for textArea question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    // Store the change handler reference
    let changeHandler: (() => void) | null = null;

    // Create a mock editor instance
    const mockEditor = {
      setContent: jest.fn(),
      getContent: jest.fn().mockReturnValue('This is the text area content'),
      on: jest.fn((events: string, handler: () => void) => {
        if (events === 'Change KeyUp Input Blur') {
          changeHandler = handler;
        }
      }),
    };

    // Intercept the init call and simulate init_instance_callback
    window.tinymce.init = jest.fn((config) => {
      // Call setup to register event handlers
      if (config.setup) {
        config.setup(mockEditor);
      }

      // Call the init callback
      config.init_instance_callback(mockEditor);
    });

    await act(async () => {
      render(<PlanOverviewQuestionPage />);
    });

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Trigger the change handler if it exists
    await act(async () => {
      changeHandler?.(); // Optional chaining - safe way to call
    });

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateAnswerAction).toHaveBeenCalledWith({
        answerId: 4,
        json: "{\"type\":\"textArea\",\"answer\":\"This is the text area content\"}"
      });
    });
  });

  it('should call updateAnswerAction with correct data for currency question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForCurrency,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForCurrency,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"currency\",\"answer\":15}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for numberRange question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumberRange,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForNumberRange,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"numberRange\",\"answer\":{\"start\":2,\"end\":10}}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for number question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumber,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForNumber,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"number\",\"answer\":3}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for multiSelect question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForMultiSelect,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForMultiSelect,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"multiselectBox\",\"answer\":[\"Banana\",\"Pear\",\"Orange\",\"Apple\"]}"
      });
    });
  })

  it('should call updateAnswerAction with correct data for selectBox question', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForSelectBox,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForSelectBox,
      loading: false,
      error: undefined,
    });

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
        json: "{\"type\":\"selectBox\",\"answer\":\"California\"}"
      });
    });
  })

  it('should redirect if the response to calling updateAnswerAction returns a redirect', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
      redirect: '/project/1/dmp/1/s/22'
    });

    (updateAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
        },
        id: 27,
        json: "{\"type\":\"textArea\",\"answer\":\"This is a test\"}",
        modified: "1751929006000",
        versionedQuestion: {
          versionedSectionId: 20
        }
      },
      redirect: '/project/1/dmp/1/s/22'
    });

    // Create a mock editor instance
    const mockEditor = {
      setContent: jest.fn(),
      getContent: jest.fn().mockReturnValue('This is the text area content'),
      on: jest.fn(),
    };

    // Intercept the init call and simulate init_instance_callback
    window.tinymce.init = jest.fn((config) => {
      config.init_instance_callback(mockEditor);

      // Manually trigger the `Change` event
      setTimeout(() => {
        const changeHandler = mockEditor.on.mock.calls.find(
          ([eventName]) => eventName === 'Change'
        )?.[1];
        if (changeHandler) changeHandler(); // simulate content change
      }, 0);
    });

    await act(async () => {
      render(<PlanOverviewQuestionPage />);
    });

    // Wait for the simulated TinyMCE 'Change' event to propagate
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    await act(async () => {
      fireEvent.click(saveBtn);
    })

    expect(mockUseRouter().push).toHaveBeenNthCalledWith(2, '/en-US/projects/1/dmp/1/s/22');
  })

  it('should display errors if updateAnswerAction returns errors in the response', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
      redirect: '/project/1/dmp/1/s/22'
    });

    (updateAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: 'The answer is not in the proper format.',
          versionedQuestionId: 'versionedQuestionId already exists'
        },
        id: 27,
        json: "{\"type\":\"textArea\",\"answer\":\"This is a test\"}",
        modified: "1751929006000",
        versionedQuestion: {
          versionedSectionId: 20
        }
      },
    });

    // Create a mock editor instance
    const mockEditor = {
      setContent: jest.fn(),
      getContent: jest.fn().mockReturnValue('This is the text area content'),
      on: jest.fn(),
    };

    // Intercept the init call and simulate init_instance_callback
    window.tinymce.init = jest.fn((config) => {
      config.init_instance_callback(mockEditor);

      // Manually trigger the `Change` event
      setTimeout(() => {
        const changeHandler = mockEditor.on.mock.calls.find(
          ([eventName]) => eventName === 'Change'
        )?.[1];
        if (changeHandler) changeHandler(); // simulate content change
      }, 0);
    });

    await act(async () => {
      render(<PlanOverviewQuestionPage />);
    });

    // Wait for the simulated TinyMCE 'Change' event to propagate
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Click "Save" button
    const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });

    await act(async () => {
      fireEvent.click(saveBtn);
    })

    expect(
      screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' &&
          content === 'The answer is not in the proper format.';
      })
    ).toBeInTheDocument();
  })

  it('should load page with error when answer type is not in the list ', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockOtherQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockOtherAnswerData,
      loading: false,
      error: undefined,
      redirect: '/project/1/dmp/1/s/22'
    });

    (updateAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: 'The answer is not in the proper format.',
          versionedQuestionId: 'versionedQuestionId already exists'
        },
        id: 27,
        json: "{\"type\":\"textArea123\",\"answer\":\"This is a test\"}",
        modified: "1751929006000",
        versionedQuestion: {
          versionedSectionId: 20
        }
      },
    });

    await act(async () => {
      render(<PlanOverviewQuestionPage />);
    });

    expect(screen.getByText('messaging.errors.questionUnexpectedFormat')).toBeInTheDocument();
  })
})

describe('Call to addAnswerAction', () => {
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

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockPublishedQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerData,
      loading: false,
      error: undefined,
    });

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });
  })

  it('should call addAnswerAction with correct data for checkbox when there is no corresponding answer in our db', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

    (addAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
        },
        id: 27,
        json: "{\"type\":\"checkBoxes\",\"answer\":[\"Barbara\",\"Charlie\",\"Alex\"]}",
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
      expect(addAnswerAction).toHaveBeenCalledWith({
        planId: 1,
        versionedSectionId: 22,
        versionedQuestionId: 344,
        json: "{\"type\":\"checkBoxes\",\"answer\":[\"Barbara\",\"Charlie\",\"Alex\"]}"
      });
    });
  });
});

describe('DrawerPanel', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

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

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockPublishedQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerData,
      loading: false,
      error: undefined,
    });

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });

    mockUseComments.mockReturnValue(defaultMockReturn);

  })

  it('should open Sample text DrawerPanel when user clicks on the \'View sample answer\' button', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // sidebar panel
    const allDrawerPanels = screen.queryAllByTestId('drawer-panel');
    const visibleDrawerPanel = allDrawerPanels.find(
      panel => panel.getAttribute('aria-hidden') !== 'true'
    );
    const sidebarPanel = screen.queryByTestId('sidebar-panel');

    // check for drawer panel trigger buttons
    const viewSampleTextBtn = screen.getByRole('button', { name: 'page.viewSampleAnswer' });
    expect(viewSampleTextBtn).toBeInTheDocument();
    expect(sidebarPanel).toBeInTheDocument();
    expect(visibleDrawerPanel).toBeUndefined();

    // Check that the textArea question field is in page
    const textAreaQuestion = screen.getByLabelText('question-text-editor');
    expect(textAreaQuestion).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('is simply dummy text'))).toBeInTheDocument();

    // click on the viewSampleTextBtn
    await act(async () => {
      fireEvent.click(viewSampleTextBtn);
    });

    const allDrawerPanels2 = screen.getAllByTestId('drawer-panel');
    const visibleDrawerPanel2 = allDrawerPanels2.find(
      panel => panel.getAttribute('aria-hidden') !== 'false'
    )!; // Non-null assertion operator
    const sidebarPanel2 = screen.queryByTestId('sidebar-panel');

    expect(sidebarPanel2).toHaveClass('state-closed');
    // Check that the sidebar-panel is visible
    expect(visibleDrawerPanel2).toBeInTheDocument();

    // While the drawer is open, click the 'Close' button to clower the panel
    // Check that the close action exists within the visible drawer panel
    const closeAction = screen.queryAllByTestId('close-action');

    // Click the close button
    await userEvent.click(closeAction[0]);

    // Get new info on sidebar and drawer panel - drawer should be closed and sidebar panel should be displayed
    const allDrawerPanels3 = screen.getAllByTestId('drawer-panel');
    const visibleDrawerPanel3 = allDrawerPanels3.find(
      panel => panel.getAttribute('aria-hidden') !== 'true'
    )!; // Non-null assertion operator
    const sidebarPanel3 = screen.queryByTestId('sidebar-panel');
    expect(sidebarPanel3).toBeInTheDocument();
    expect(visibleDrawerPanel3).toBeUndefined();
  })

  it('should transfer sample text into the textArea field when user clicks on the \'use answer\' button', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    const viewSampleTextBtn = screen.getByRole('button', { name: 'page.viewSampleAnswer' });

    // click on the viewSampleTextBtn
    await act(async () => {
      fireEvent.click(viewSampleTextBtn);
    });

    const useAnswerBtn = screen.getByRole('button', { name: 'buttons.useAnswer' });
    // Click the useAnswer button
    await userEvent.click(useAnswerBtn);

    // Get new info on sidebar and drawer panel - drawer should be closed and sidebar panel should be displayed
    const allDrawerPanels2 = screen.getAllByTestId('drawer-panel');
    const visibleDrawerPanel2 = allDrawerPanels2.find(
      panel => panel.getAttribute('aria-hidden') !== 'true'
    )!; // Non-null assertion operator
    const sidebarPanel2 = screen.queryByTestId('sidebar-panel');
    expect(sidebarPanel2).toBeInTheDocument();
    expect(visibleDrawerPanel2).toBeUndefined();

    // The sample text should be visible in the textarea question
    expect(screen.getByText((content) => content.includes('Sample text'))).toBeInTheDocument();
  })


  it('should open Comments DrawerPanel when user clicks on the \'Comments\' button', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });

    // sidebar panel
    const allDrawerPanels = screen.queryAllByTestId('drawer-panel');
    const visibleDrawerPanel = allDrawerPanels.find(
      panel => panel.getAttribute('aria-hidden') !== 'true'
    );
    const sidebarPanel = screen.queryByTestId('sidebar-panel');

    // check for drawer panel trigger buttons
    const viewCommentsBtn = screen.getByRole('button', { name: 'buttons.commentWithNumber' });
    expect(viewCommentsBtn).toBeInTheDocument();
    expect(sidebarPanel).toBeInTheDocument();
    expect(visibleDrawerPanel).toBeUndefined();

    // Check that the textArea question field is in page
    const textAreaQuestion = screen.getByLabelText('question-text-editor');
    expect(textAreaQuestion).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('is simply dummy text'))).toBeInTheDocument();

    // Click on Comments button to reveal comments drawer panel
    await act(async () => {
      fireEvent.click(viewCommentsBtn);
    });

    const allDrawerPanels2 = screen.getAllByTestId('drawer-panel');
    const visibleDrawerPanel2 = allDrawerPanels2.find(
      panel => panel.getAttribute('aria-hidden') !== 'false'
    )!; // Non-null assertion operator
    const sidebarPanel2 = screen.queryByTestId('sidebar-panel');

    // Check that the sidebar-panel is visible
    expect(sidebarPanel2).toHaveClass('state-closed');
    expect(visibleDrawerPanel2).toBeInTheDocument();

    // While the drawer is open, click the 'Close' button to clower the panel
    // Check that the close action exists within the visible drawer panel
    const closeAction = screen.queryAllByTestId('close-action');

    // Click the close button in the comments drawer
    await userEvent.click(closeAction[1]);

    // Get new info on sidebar and drawer panel - drawer should be closed and sidebar panel should be displayed
    const allDrawerPanels3 = screen.getAllByTestId('drawer-panel');
    const visibleDrawerPanel3 = allDrawerPanels3.find(
      panel => panel.getAttribute('aria-hidden') !== 'true'
    )!; // Non-null assertion operator
    const sidebarPanel3 = screen.queryByTestId('sidebar-panel');
    expect(sidebarPanel3).toBeInTheDocument();
    expect(visibleDrawerPanel3).toBeUndefined();
  })

  it('should close drawer panel when user clicks on the Comment button to submit a new comment', async () => {

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockAnswerDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <PlanOverviewQuestionPage />
      );
    });


    const viewCommentsBtn = screen.getByRole('button', { name: 'buttons.commentWithNumber' });
    // Click on Comments button to reveal comments drawer panel
    await userEvent.click(viewCommentsBtn);

    // While the drawer is open, click the 'Close' button to clower the panel
    // Check that the close action exists within the visible drawer panel
    const commentBtn = screen.getByRole('button', { name: 'buttons.comment' })

    // Click the close button in the comments drawer
    await userEvent.click(commentBtn);

    // Get new info on sidebar and drawer panel - drawer should be closed and sidebar panel should be displayed

    const sidebarPanel2 = screen.queryByTestId('sidebar-panel');
    expect(sidebarPanel2).toBeInTheDocument();
  })
});

describe('Prevent unload when user has unsaved changes', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
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

    (usePlanQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockPlanData),
      { loading: false, error: undefined },
    ]);

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });

    // Mock addEventListener
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  })

  afterEach(() => {
    // Cleanup
    removeEventListenerSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  })

  it('should prevent unload when there are unsaved changes and user tries to navigate away from page', async () => {
    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

    (addAnswerAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        errors: {
          general: null,
        },
        id: 27,
        json: "{\"type\":\"checkBoxes\",\"answer\":[\"Barbara\",\"Charlie\",\"Alex\"]}",
        modified: "1751929006000",
        versionedQuestion: {
          versionedSectionId: 20
        }
      },
    });

    render(
      <PlanOverviewQuestionPage />
    );

    // Make checkbox change
    const checkboxGroup = screen.getByTestId('checkbox-group');
    expect(checkboxGroup).toBeInTheDocument();
    const checkboxes = within(checkboxGroup).getAllByRole('checkbox');
    const alexCheckbox = checkboxes.find(
      (checkbox) => (checkbox as HTMLInputElement).value === 'Alex'
    );

    await userEvent.click(alexCheckbox!);

    // Wait for state update
    await waitFor(() => {
      // Get the last registered 'beforeunload' handler
      const handler = addEventListenerSpy.mock.calls
        .filter(([event]) => event === 'beforeunload')
        .map(([, fn]) => fn)
        .pop();

      // Simulate event of navigating way from page
      const event = new Event('beforeunload');
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: undefined,
      });

      if (handler) {
        handler(event as unknown as BeforeUnloadEvent);
        expect(event.returnValue).toBe('');
      }
    });
  });
});

describe('Auto save', () => {
  it('should show saved message after auto-saving changes', async () => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };

    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1, sid: 22, qid: 344 });
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    (useMeQuery as jest.Mock).mockReturnValue({
      data: mockMeData,
      loading: false,
      error: undefined
    });


    (usePlanQuery as jest.Mock).mockReturnValue({
      data: mockPlanData,
      loading: false,
      error: undefined,
    });

    (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxQuestion,
      loading: false,
      error: undefined,
    });

    (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
      data: mockCheckboxAnswer,
      loading: false,
      error: undefined,
    });

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
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

    fireEvent.click(alexCheckbox!);

    const lastSavedText = screen.getByText('messages.unsavedChanges');
    expect(lastSavedText).toBeInTheDocument();
    // Verify timeout scheduled
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);

    setTimeoutSpy.mockRestore();
  });

  describe('PlanOverviewQuestionPage - Research Output Table', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

      window.tinymce = {
        init: jest.fn(),
        remove: jest.fn(),
      };

      mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1, sid: 22, qid: 344 });
      mockUseRouter.mockReturnValue({
        push: jest.fn(),
      });

      (useMeQuery as jest.Mock).mockReturnValue({
        data: mockMeData,
        loading: false,
        error: undefined
      });

      mockUseComments.mockReturnValue(defaultMockReturn);

      (usePlanQuery as jest.Mock).mockReturnValue({
        data: mockPlanData,
        loading: false,
        error: undefined,
      });

      (useGuidanceGroupsQuery as jest.Mock).mockReturnValue({
        data: mockGuidanceGroupsData,
        loading: false,
        error: undefined,
      });
    });

    it('should load correct question content for research output table question', async () => {
      (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
        data: mockQuestionDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
      });

      await act(async () => {
        render(<PlanOverviewQuestionPage />);
      });

      expect(screen.getByRole('heading', { level: 2, name: 'Research Output Table question' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'page.viewSampleAnswer' })).not.toBeInTheDocument();

      const researchOutputTable = screen.getByTestId('research-output-table');
      expect(researchOutputTable).toBeInTheDocument();

      // Check that columns are rendered
      expect(screen.getByTestId('column-count')).toHaveTextContent('2');
    });

    it('should prefill research output table with existing answer data', async () => {
      (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
        data: mockQuestionDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
        data: mockAnswerDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      await act(async () => {
        render(<PlanOverviewQuestionPage />);
      });

      const researchOutputTable = screen.getByTestId('research-output-table');
      expect(researchOutputTable).toBeInTheDocument();

      // Check that existing rows are loaded
      expect(screen.getByTestId('row-count')).toHaveTextContent('1');

      // Check that column headings are loaded
      expect(screen.getByTestId('heading-count')).toHaveTextContent('4');
    });

    it('should call updateAnswerAction with correct data for research output table', async () => {
      (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
        data: mockQuestionDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
        data: mockAnswerDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (updateAnswerAction as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          errors: { general: null },
          id: 25,
          json: '{"type":"researchOutputTable","columnHeadings":["Title","Description","Anticipated Release Date","Anticipated file size"],"answer":[{"columns":[{"type":"text","answer":"My Dataset","meta":{"schemaVersion":"1.0"}},{"type":"textArea","answer":"Updated description","meta":{"schemaVersion":"1.0"}}]}]}',
          modified: "1735000000000",
          versionedQuestion: {
            versionedSectionId: 22
          }
        },
      });

      await act(async () => {
        render(<PlanOverviewQuestionPage />);
      });

      // Simulate adding a row
      const addButton = screen.getByText('Add Output');
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Click the main save button
      const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(updateAnswerAction).toHaveBeenCalled();
        const callArgs = (updateAnswerAction as jest.Mock).mock.calls[0][0];
        expect(callArgs.answerId).toBe(25);
        const parsedJson = JSON.parse(callArgs.json);
        expect(parsedJson.type).toBe('researchOutputTable');
        expect(parsedJson.columnHeadings).toBeDefined();
        expect(Array.isArray(parsedJson.answer)).toBe(true);
      });
    });

    it('should call addAnswerAction when creating new research output table answer', async () => {
      (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
        data: mockQuestionDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
      });

      (addAnswerAction as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          errors: { general: null },
          id: 26,
          json: '{"type":"researchOutputTable","columnHeadings":["Title","Description","Anticipated Release Date","Anticipated file size"],"answer":[]}',
          modified: "1735000000000",
          versionedQuestion: {
            versionedSectionId: 22
          }
        },
      });

      await act(async () => {
        render(<PlanOverviewQuestionPage />);
      });

      const saveBtn = screen.getByRole('button', { name: 'labels.saveAnswer' });
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(addAnswerAction).toHaveBeenCalledWith({
          planId: 1,
          versionedSectionId: 22,
          versionedQuestionId: 344,
          json: expect.stringContaining('"type":"researchOutputTable"')
        });
      });
    });

    it('should trigger onSave callback when research output table internal save is called', async () => {
      (usePublishedQuestionQuery as jest.Mock).mockReturnValue({
        data: mockQuestionDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (useAnswerByVersionedQuestionIdQuery as jest.Mock).mockReturnValue({
        data: mockAnswerDataForResearchOutput,
        loading: false,
        error: undefined,
      });

      (updateAnswerAction as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          errors: { general: null },
        },
      });

      await act(async () => {
        render(<PlanOverviewQuestionPage />);
      });

      // Click the internal save button in the research output component
      const internalSaveBtn = screen.getByText('Save Output');
      await act(async () => {
        fireEvent.click(internalSaveBtn);
      });

      await waitFor(() => {
        expect(updateAnswerAction).toHaveBeenCalled();
      });
    });
  });
});


