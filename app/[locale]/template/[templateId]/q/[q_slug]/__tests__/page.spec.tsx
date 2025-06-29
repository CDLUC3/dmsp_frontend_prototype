import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import userEvent from "@testing-library/user-event";
import { routePath } from '@/utils/routes';
import {
  useQuestionQuery,
  useQuestionTypesLazyQuery,
  useUpdateQuestionMutation,
  useRemoveQuestionMutation
} from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QuestionEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockQuestionData from '../__mocks__/mockQuestionData.json';
import mockRadioQuestion from '@/__mocks__/common/mockRadioQuestion.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockQuestionDataForDateRange.json';
import mockQuestionDataForNumberRange from '@/__mocks__/common/mockQuestionDataForNumberRange.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockQuestionDataForTypeAheadSearch.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockQuestionDataForTextField.json';
import mockQuestionDataForTextArea from '@/__mocks__/common/mockQuestionDataForTextArea.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockQuestionDataForURL.json';
import mockQuestionDataForNumber from '@/__mocks__/common/mockQuestionDataForNumber.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockQuestionDataForCurrency.json';
import mockQuestionTypes from '@/__mocks__/mockQuestionTypes.json';

expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionQuery: jest.fn(),
  useUpdateQuestionMutation: jest.fn(),
  useQuestionTypesLazyQuery: jest.fn(),
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

// Mock QuestionOptionsComponent since it has it's own separate unit test
jest.mock('@/components/Form/QuestionOptionsComponent', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Question Options Component</div>,
  };
});


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

    (useQuestionTypesLazyQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockQuestionTypes }),
      { loading: false, error: undefined },
    ]);
    (useToast as jest.Mock).mockReturnValue({ add: jest.fn() });
    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it("should render correct fields and content", async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    const input = screen.getByLabelText('labels.questionText');

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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    expect(mockRouter.push).toHaveBeenCalledWith('/template/123/q/new?section_id=67&step=1&questionId=67');
  })

  // QuestionOptionsComponent has it's own separate unit test, so we are just testing that it loads here
  it('should load QuestionOptionsComponent', async () => {
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
          const params: Record<string, string> = { questionTypeId: '3' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '3' },
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

    // Verify that the mocked QuestionOptionsComponent is rendered
    expect(screen.getByText('Mocked Question Options Component')).toBeInTheDocument();

    // Verify that the options wrapper is present (indicating hasOptions is true)
    expect(screen.getByText('helpText.questionOptions')).toBeInTheDocument();
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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
          const params: Record<string, string> = { questionTypeId: '' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '' },
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

  it('should display the useSampleTextAsDefault checkbox if the questionTypeId is for a text field', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: '' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '' },
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

    const checkboxText = screen.queryByText('descriptions.sampleTextAsDefault');
    expect(checkboxText).toBeInTheDocument();
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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    const rangeStartInput = screen.getByLabelText('range start');

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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    const rangeStartInput = screen.getByLabelText('range start');

    // Simulate user typing
    fireEvent.change(rangeStartInput, { target: { value: '2' } });

    expect(rangeStartInput).toHaveValue('2');

  });

  it("should call handleTypeAheadSearchLabelChange for typeaheadsearch question type", async () => {

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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    // Find the label input rendered by TypeAheadSearch
    const labelInput = screen.getByPlaceholderText('Enter search label');

    // Simulate user typing
    fireEvent.change(labelInput, { target: { value: 'New Institution Label' } });

    expect(labelInput).toHaveValue('New Institution Label');

  });

  it("should call handleTypeAheadHelpTextChange for typeaheadsearch question type", async () => {

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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    // Find the label input rendered by TypeAheadSearch
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
          const params: Record<string, string> = { questionTypeId: '1' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
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
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    const alert = screen.queryByRole('alert');
    expect(alert).toHaveTextContent('messages.errors.questionUpdateError');
  });


  it('should pass axe accessibility test', async () => {
    // Render with text question type
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: '3' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '3' },
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
        meta: { schemaVersion: "1.0" },
        attributes: {
          maxLength: 1000,
          minLength: 0,
          pattern: "^.+$",
        }
      }
    },
    {
      questionType: "textArea",
      mockData: mockQuestionDataForTextArea,
      expectedJson: {
        type: "textArea",
        meta: {
          asRichText: true,
          schemaVersion: "1.0",
        },
        attributes: {
          cols: 20,
          rows: 20,
          maxLength: 1000,
          minLength: 0,
        },
      },
    },
    {
      questionType: "number",
      mockData: mockQuestionDataForNumber,
      expectedJson: {
        type: "number",
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          min: 0,
          max: 10000000,
          step: 1,
        },
      },
    },
    {
      questionType: "currency",
      mockData: mockQuestionDataForCurrency,
      expectedJson: {
        type: "currency",
        attributes: {
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
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          maxLength: 2048,
          minLength: 2,
          pattern: "https?://.+",
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
  const setupMocks = () => {
    const mockRemoveQuestionMutation = jest.fn();
    const mockUpdateQuestionMutation = jest.fn();
    const mockRouter = { push: jest.fn() };

    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      mockUpdateQuestionMutation,
      { loading: false },
    ]);

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: {
        question: {
          id: 67,
          questionText: 'Test Question for Deletion',
          json: JSON.stringify({ type: 'text' }),
          sectionId: 1,
        },
      },
      loading: false,
      error: null,
    });

    (useRemoveQuestionMutation as jest.Mock).mockReturnValue([
      mockRemoveQuestionMutation,
      { loading: false },
    ]);

    (useToast as jest.Mock).mockReturnValue({ add: jest.fn() });

    (useParams as jest.Mock).mockReturnValue({ templateId: '123', q_slug: '67' });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    return { mockRemoveQuestionMutation, mockRouter };
  };

  it('should render the delete button', () => {
    setupMocks();
    render(<QuestionEdit />);
    expect(screen.getByText('buttons.deleteQuestion')).toBeInTheDocument();
  });

  it('should open the confirmation dialog on delete button click', async () => {
    setupMocks();
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
    const { mockRemoveQuestionMutation, mockRouter } = setupMocks();
    mockRemoveQuestionMutation.mockResolvedValueOnce({ data: { removeQuestion: { id: 67 } } });

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

  it('should close the dialog when cancel is clicked', async () => {
    setupMocks();
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

