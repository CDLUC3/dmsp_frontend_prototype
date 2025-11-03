import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { routePath } from '@/utils/routes';
import {
  useQuestionQuery,
  useUpdateQuestionMutation,
  useRemoveQuestionMutation
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';
import QuestionEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockQuestionData from '../__mocks__/mockQuestionData.json';
import mockRadioQuestion from '@/__mocks__/common/mockRadioQuestion.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockDateRangeQuestion.json';
import mockQuestionDataForNumberRange from '@/__mocks__/common/mockNumberRangeQuestion.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockTypeaheadQuestion.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockTextQuestion.json';
import mockQuestionDataForTextArea from '@/__mocks__/common/mockTextAreaQuestion.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockURLQuestion.json';
import mockQuestionDataForNumber from '@/__mocks__/common/mockNumberQuestion.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockCurrencyQuestion.json';
import * as getParsedJSONModule from '@/components/hooks/getParsedQuestionJSON';
import { AffiliationSearchQuestionType } from "@dmptool/types";

beforeEach(() => {
  // Cannot get the escaping to work in the mock JSON file, so doing it programmatically here
  const affiliationQuery = 'query Affiliations($name: String!){ ' +
    'affiliations(name: $name) { ' +
    'totalCount ' +
    'nextCursor ' +
    'items { ' +
    'id ' +
    'displayName ' +
    'uri ' +
    '} ' +
    '} ' +
    '}';

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
  mockQuestionDataForTypeAheadSearch.question.json = JSON.stringify(json);
});

expect.extend(toHaveNoViolations);

jest.mock('@/components/hooks/getParsedQuestionJSON', () => {
  const actual = jest.requireActual('@/components/hooks/getParsedQuestionJSON');
  return {
    __esModule: true,
    ...actual,
    getParsedQuestionJSON: jest.fn(actual.getParsedQuestionJSON),
  };
});

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionQuery: jest.fn(),
  useUpdateQuestionMutation: jest.fn(),
  useRemoveQuestionMutation: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

const mockUseRouter = useRouter as jest.Mock;

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

describe("QuestionEditPage", () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}`, q_slug: 67 });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };


    // Mock the router
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionData,
      loading: false,
      error: undefined,
    });

    (useToast as jest.Mock).mockReturnValue({ add: jest.fn() });
    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it("should render correct fields and content", async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');
    const editQuestionTab = screen.getByRole('tab', { name: 'tabs.editQuestion' });
    expect(editQuestionTab).toBeInTheDocument();
    const editOptionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    expect(editOptionsTab).toBeInTheDocument();
    const editLogicTab = screen.getByRole('tab', { name: 'tabs.logic' });
    expect(editLogicTab).toBeInTheDocument();
    const questionTypeLabel = screen.getByText(/labels.type/i);
    expect(questionTypeLabel).toBeInTheDocument();
    const questionTextLabel = screen.getByText(/labels.questionText/i);
    expect(questionTextLabel).toBeInTheDocument();
    const questionRequirementTextLabel = screen.getByText(/labels.requirementText/i);
    expect(questionRequirementTextLabel).toBeInTheDocument();
    const questionGuidanceTextLabel = screen.getByText(/labels.guidanceText/i);
    expect(questionGuidanceTextLabel).toBeInTheDocument();
    const questionSampleTextLabel = screen.getByText(/labels.sampleText/i);
    expect(questionSampleTextLabel).toBeInTheDocument();
    const sidebarHeading = screen.getByRole('heading', { name: /headings.preview/i });
    expect(sidebarHeading).toBeInTheDocument();
    expect(sidebarHeading).toHaveTextContent('headings.preview');
    const bestPracticeHeading = screen.getByRole('heading', { level: 3 });
    expect(bestPracticeHeading).toHaveTextContent('headings.bestPractice');
    const sidebarPara1 = screen.getByText('descriptions.previewText', { selector: 'p' });
    expect(sidebarPara1).toBeInTheDocument();
    const bestPracticePara1 = screen.getByText('descriptions.bestPracticePara1', { selector: 'p' });
    expect(bestPracticePara1).toBeInTheDocument();
    const bestPracticePara2 = screen.getByText('descriptions.bestPracticePara2', { selector: 'p' });
    expect(bestPracticePara2).toBeInTheDocument();
    const bestPracticePara3 = screen.getByText('descriptions.bestPracticePara3', { selector: 'p' });
    expect(bestPracticePara3).toBeInTheDocument();

    // Marking question as required should include the 'yes' and 'no' radio buttons
    expect(screen.getByText('form.yesLabel')).toBeInTheDocument();
    expect(screen.getByText('form.noLabel')).toBeInTheDocument();
  });

  it("should set question.required to \'true\' when user selects the \'yes\' radio button", async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    const mockUpdateQuestion = jest.fn().mockResolvedValue({ data: { key: 'value' } });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      mockUpdateQuestion,
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'text' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    // Get the radio buttons by their role and value
    const yesRadio = screen.getByRole('radio', { name: 'form.yesLabel' });
    const noRadio = screen.getByRole('radio', { name: 'form.noLabel' });

    expect(yesRadio).toBeChecked();
    // Click the radio button
    fireEvent.click(noRadio);

    // Submit form
    const saveButton = screen.getByText('buttons.saveAndUpdate');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateQuestion).toHaveBeenCalledWith({
        variables: {
          input: {
            questionId: 67,
            displayOrder: 3,
            json: "{\"type\":\"textArea\",\"attributes\":{\"cols\":20,\"maxLength\":1000,\"minLength\":0,\"rows\":20,\"asRichText\":true},\"meta\":{\"schemaVersion\":\"1.0\"}}",
            questionText: "Text area question",
            requirementText: "<p><strong>Requirements - Lorem Ipsum</strong>&nbsp;is simply dummy requirements text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
            guidanceText: "<p><strong>Guidance text - Lorem Ipsum</strong>&nbsp;is simply dummy guidance text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
            sampleText: "<p>Sample text <strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>",
            useSampleTextAsDefault: true,
            required: false
          },
        }
      })
    });
  });

  it('should display error when no value is entered in question Text field', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'text' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    // Get the input
    const input = screen.getByLabelText(/labels.questionText/i);

    // Set value to empty
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    const errorMessage = screen.getByText('messages.errors.questionTextRequired');
    expect(errorMessage).toBeInTheDocument();
  })

  it('should redirect to Question Types page when user clicks the \'Change type\' button', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });
    // Get the 'Change type' button and simulate a click
    const changeTypeButton = screen.getByRole('button', { name: /buttons.changeType/i });
    fireEvent.click(changeTypeButton);

    // Verify that router redirects to question types page
    expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123/q/new?section_id=67&step=1&questionId=67');
  })

  it('should call the useUpdateQuestionMutation when user clicks \'save\' button', async () => {
    const mockUpdateFn = jest.fn().mockResolvedValue({
      data: { updateQuestion: { id: 67 } }
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      mockUpdateFn,
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'text' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const input = screen.getByLabelText(/labels.questionText/i);

    // Set required QuestionType value
    fireEvent.change(input, { target: { value: 'Testing' } });


    const saveButton = screen.getByText('buttons.saveAndUpdate');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalled();
      // Should redirect to Edit Template page
      expect(mockRouter.push).toHaveBeenCalledWith(routePath('template.show', { templateId: '123' }));
    });
  })

  it('should not display the useSampleTextAsDefault checkbox if the questionTypeId is Radio Button field', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockRadioQuestion,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'radioButtons' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'radioButtons' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const checkboxText = screen.queryByText('descriptions.sampleTextAsDefault');
    expect(checkboxText).not.toBeInTheDocument();
  })

  it('should display the useSampleTextAsDefault checkbox if the questionTypeId is for a textArea field', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const sampleTextField = screen.queryByText('descriptions.sampleTextAsDefault');
    expect(sampleTextField).toBeInTheDocument();
  })

  it('should not display the useSampleTextAsDefault checkbox if the questionTypeId is for a text field', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'text' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const questionSampleTextLabel = screen.queryByText(/labels.sampleText/i);
    expect(questionSampleTextLabel).not.toBeInTheDocument();
  })

  it("should call handleRangeLabelChange for dateRange question type", async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'dateRange' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'dateRange' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });
    // Find the input rendered by RangeComponent
    const rangeStartInput = screen.getByLabelText(/range start/i);

    // Simulate user typing
    fireEvent.change(rangeStartInput, { target: { value: 'New Range Label' } });

    expect(rangeStartInput).toHaveValue('New Range Label');

  });

  it("should call handleRangeLabelChange for number range question type", async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForNumberRange,
      loading: false,
      error: undefined,
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'numberRange' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'numberRange' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });
    // Find the input rendered by RangeComponent
    const rangeStartInput = screen.getByLabelText(/range start/i);

    // Simulate user typing
    fireEvent.change(rangeStartInput, { target: { value: '2' } });

    expect(rangeStartInput).toHaveValue('2');

  });

  it("should call handleTypeAheadSearchLabelChange for affiliationSearch question type", async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text affiliation search type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'affiliationSearch' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'affiliationSearch' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    // Find the label input rendered by AffiliationSearch
    const labelInput = screen.getByPlaceholderText('Enter search label');

    // Simulate user typing
    fireEvent.change(labelInput, { target: { value: 'New Institution Label' } });

    expect(labelInput).toHaveValue('New Institution Label');

  });

  it("should call handleTypeAheadHelpTextChange for affiliationSearch question type", async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'affiliationSearch' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'affiliationSearch' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });
    // Find the label input rendered by AffiliationSearch
    const helpTextInput = screen.getByPlaceholderText('Enter the help text you want to display');

    // Simulate user typing
    fireEvent.change(helpTextInput, { target: { value: 'Enter a search term' } });

    expect(helpTextInput).toHaveValue('Enter a search term');

  });

  it("should display error if useUpdateQuestionMutation rejects", async () => {

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    });
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error updating question")),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });
    // Get the input
    const input = screen.getByLabelText(/labels.questionText/i);

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    const alert = screen.queryByRole('alert');
    expect(alert).toHaveTextContent('messages.errors.questionUpdateError');
  });

  it('should call logECS if call to getParsedQuestionJSON returns error', async () => {
    const mockGetParsed = getParsedJSONModule.getParsedQuestionJSON as jest.Mock;

    // temporarily override return value
    mockGetParsed.mockReturnValueOnce({
      parsed: null,
      error: 'Mocked parse error',
    });

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForTextField,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    // Expect logECS to be called
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Parsing error',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/template/123/q/67' },
        })
      );
    });
  });

  it('should set question to filtered question when user passes in questionTypeIdQueryParam', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'dateRange' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'short_text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Starting Label')).toBeInTheDocument();
      expect(screen.getByText('Ending Label')).toBeInTheDocument();
    });
  });

  it('should set error when parsing fails for getMatchingQuestionType', async () => {
    const mockGetParsed = getParsedJSONModule.getParsedQuestionJSON as jest.Mock;

    // 1. First render sets parsedQuestionJSON
    mockGetParsed.mockReturnValueOnce({
      parsed: { type: 'dateRange' },
      error: null,
    });

    // 2. On second invocation (triggered by form submit), it fails
    mockGetParsed.mockReturnValueOnce({
      parsed: null,
      error: 'Failed to parse during submit',
    });

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'dateRange' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'short_text' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to parse during submit')).toBeInTheDocument();
    });
  });

  it('should call logECS if useQuestionQuery graphql query returns an error ', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'There was an error when calling useQuestionQuery' },
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'affiliationSearch' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'affiliationSearch' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    // Expect logECS to be called
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Parsing error',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/template/123/q/67' },
        })
      );
    });
  });

  it('should pass axe accessibility test', async () => {
    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'checkBoxes' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'checkBoxes' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const { container } = render(
      <QuestionEdit />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe.each([
    {
      questionType: "text",
      mockData: mockQuestionDataForTextField,
      expectedJson: {
        type: "text",
        attributes: {
          maxLength: 1000,
          minLength: 0,
          pattern: "^.+$",
        },
        meta: {
          schemaVersion: "1.0"
        },
      }
    },
    {
      questionType: "textArea",
      mockData: mockQuestionDataForTextArea,
      expectedJson: {
        type: "textArea",
        attributes: {
          asRichText: true,
          cols: 20,
          rows: 20,
          maxLength: 1000,
          minLength: 0,
        },
        meta: {
          schemaVersion: "1.0",
        },
      },
    },
    {
      questionType: "number",
      mockData: mockQuestionDataForNumber,
      expectedJson: {
        type: "number",
        attributes: {
          min: 0,
          max: 10000000,
          step: 1,
        },
        meta: {
          schemaVersion: "1.0",
        },
      },
    },
    {
      questionType: "currency",
      mockData: mockQuestionDataForCurrency,
      expectedJson: {
        type: "currency",
        attributes: {
          denomination: "USD",
          min: 0,
          max: 10000000,
          step: 0.01
        },
        meta: {
          schemaVersion: "1.0",
        }

      },
    },
    {
      questionType: "url",
      mockData: mockQuestionDataForURL,
      expectedJson: {
        type: "url",
        attributes: {
          maxLength: 2048,
          minLength: 2,
          pattern: "https?://.+",
        },
        meta: {
          schemaVersion: "1.0",
        },
      },
    },
  ])("QuestionEditPage - $questionType", ({ questionType, mockData, expectedJson }) => {

    it(`should call updateQuestionMutation with correct JSON for ${questionType}`, async () => {
      (useQuestionQuery as jest.Mock).mockReturnValue({
        data: mockData,
        loading: false,
        error: undefined,
      });
      const mockUpdateQuestion = jest.fn().mockResolvedValue({
        data: {
          key: "value"
        },
      });

      (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
        mockUpdateQuestion,
        { loading: false, error: undefined },
      ]);

      (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
        return {
          get: (key: string) => {
            const params: Record<string, string> = { questionType };
            return params[key] || null;
          },
          getAll: () => [],
          has: (key: string) => key in { questionType },
          keys() { },
          values() { },
          entries() { },
          forEach() { },
          toString() {
            return "";
          },
        } as unknown as ReturnType<typeof useSearchParams>;
      });

      await act(async () => {
        render(<QuestionEdit />);
      });

      const saveButton = screen.getByText("buttons.saveAndUpdate");
      expect(saveButton).toBeInTheDocument();

      fireEvent.click(saveButton);
      await waitFor(() => {
        const [[callArgs]] = mockUpdateQuestion.mock.calls;
        const actualJson = JSON.parse(callArgs.variables.input.json);
        expect(actualJson).toEqual(expectedJson);
      });

    });
  });
});

describe('QuestionEditPage Delete Functionality', () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}`, q_slug: 67 });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };


    // Mock the router
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionData,
      loading: false,
      error: undefined,
    });

    (useToast as jest.Mock).mockReturnValue({ add: jest.fn() });
    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('should render the delete button', () => {
    render(<QuestionEdit />);
    expect(screen.getByText('buttons.deleteQuestion')).toBeInTheDocument();
  });

  it('should open the confirmation dialog on delete button click', async () => {
    render(<QuestionEdit />);
    const deleteButton = screen.getByText('buttons.deleteQuestion');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('headings.confirmDelete')).toBeInTheDocument();
    });
    expect(screen.getByText('buttons.confirm')).toBeInTheDocument();
    expect(screen.getByText('buttons.cancel')).toBeInTheDocument();
  });

  it('should call the remove mutation and redirect when confirm is clicked', async () => {
    const mockRemoveQuestionMutation = jest.fn().mockResolvedValue({ data: { removeQuestion: { id: 67 } } });

    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([
      mockRemoveQuestionMutation,
      { loading: false, error: undefined },
    ]);


    render(<QuestionEdit />);
    fireEvent.click(screen.getByText('buttons.deleteQuestion'));

    await waitFor(() => {
      expect(screen.getByText('headings.confirmDelete')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('buttons.confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRemoveQuestionMutation).toHaveBeenCalledWith({
        variables: {
          questionId: 67,
        },
      });
      expect(mockRouter.push).toHaveBeenCalledWith(routePath('template.show', { templateId: '123' }));
    });
  });

  it('should display error message when removeQuestionMutation returns an error', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const mockRemoveQuestionMutation = jest.fn().mockRejectedValueOnce(new Error("Error"));

    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([
      mockRemoveQuestionMutation,
      { loading: false, error: undefined },
    ]);

    // Render with radio button question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'checkBoxes' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'checkBoxes' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });


    render(<QuestionEdit />);

    // Click the 'Delete question' button
    await act(async () => {
      fireEvent.click(screen.getByText('buttons.deleteQuestion'));
    })

    // Expect to get a confirmation screen
    expect(screen.getByText('headings.confirmDelete')).toBeInTheDocument();

    const confirmButton = screen.getByText('buttons.confirm');

    // Click to confirm deletion
    await act(async () => {
      fireEvent.click(confirmButton);
    })

    // Should see error message since useRemoveQuestionMutation returns an error
    expect(screen.getByText('messages.errors.questionRemoveError')).toBeInTheDocument();
  });

  it('should close the dialog when cancel is clicked', async () => {
    render(<QuestionEdit />);
    fireEvent.click(screen.getByText('buttons.deleteQuestion'));

    await waitFor(() => {
      expect(screen.getByText('headings.confirmDelete')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('buttons.cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('headings.confirmDelete')).not.toBeInTheDocument();
    });
  });
});


describe('Options questions', () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}`, q_slug: 67 });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };


    // Mock the router
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionData,
      loading: false,
      error: undefined,
    });

    (useToast as jest.Mock).mockReturnValue({ add: jest.fn() });
    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('should load Radio options', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockRadioQuestion,
      loading: false,
      error: undefined,
    });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with radio button question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'radioButtons' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'radioButtons' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(<QuestionEdit />);
    });

    // Verify that the expected radio buttons appear
    const yesRadio = screen.getByLabelText('form.yesLabel');
    const noRadio = screen.getByLabelText('form.noLabel');

    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();
    expect(noRadio).toBeChecked();

    // Click the yes option
    await act(async () => {
      fireEvent.click(yesRadio);
    })

    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  })

  it('should add a new row when the add button is clicked', async () => {
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockRadioQuestion,
      loading: false,
      error: undefined,
    });

    const mockUpdateQuestion = jest.fn().mockResolvedValue({ data: { key: 'value' } });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      mockUpdateQuestion,
      { loading: false, error: undefined },
    ]);

    // Render with radio button question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'checkBoxes' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'checkBoxes' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(<QuestionEdit />);
    });

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });

    await act(async () => {
      fireEvent.click(addButton);
    })


    const allRows = screen.queryAllByLabelText('Text');
    expect(allRows.length).toBe(3);

    // Enter the label text for new radio button
    fireEvent.change(allRows[2], { target: { value: 'Maybe' } });

    // Get the save button and save
    const saveButton = screen.getByText('buttons.saveAndUpdate');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateQuestion).toHaveBeenCalledWith({
        variables: {
          input: {
            questionId: 67,
            displayOrder: 17,
            json: '{"type":"radioButtons","attributes":{},"meta":{"schemaVersion":"1.0"},"options":[{"label":"Yes","value":"Yes","selected":true},{"label":"No","value":"No","selected":false},{"label":"Maybe","value":"Maybe","selected":false},{"label":"Maybe","value":"Maybe","selected":false}]}',
            questionText: 'Testing',
            requirementText: 'This is requirement text',
            guidanceText: 'This is the guidance text',
            sampleText: 'This is sample text',
            useSampleTextAsDefault: false,
            required: false
          },
        }
      })
    });
  });

  it('should prevent unload when there are unsaved changes and user tries to navigate away from page', async () => {
    // Mock addEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockRadioQuestion,
      loading: false,
      error: undefined,
    });

    const mockUpdateQuestion = jest.fn().mockResolvedValue({ data: { key: 'value' } });

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      mockUpdateQuestion,
      { loading: false, error: undefined },
    ]);

    // Render with radio button question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'checkBoxes' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'checkBoxes' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(<QuestionEdit />);
    });

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });

    await act(async () => {
      fireEvent.click(addButton);
    })

    const allRows = screen.queryAllByLabelText('Text');
    expect(allRows.length).toBe(3);

    // Enter the label text for new radio button
    fireEvent.change(allRows[2], { target: { value: 'Maybe' } });

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

      if (typeof handler === 'function') {
        handler(event as unknown as BeforeUnloadEvent);
      } else if (handler && typeof handler.handleEvent === 'function') {
        handler.handleEvent(event as unknown as BeforeUnloadEvent);
      } else {
        throw new Error('beforeunload handler is not callable');
      }
    });
    // Cleanup
    removeEventListenerSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  });
});
