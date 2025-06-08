import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useQuestionQuery,
  useQuestionTypesQuery,
  useUpdateQuestionMutation
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QuestionEdit from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockQuestionData from '../__mocks__/mockQuestionData.json';
import mockRadioQuestion from '@/__mocks__/common/mockRadioQuestion.json';
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
  useQuestionTypesQuery: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock QuestionOptionsComponent since it has it's own separate unit test
jest.mock('@/components/Form/QuestionOptionsComponent', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Question Options Component</div>,
  };
});


describe("QuestionEditPage", () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}`, q_slug: 67 });

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

    (useQuestionTypesQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockQuestionTypes }),
      { loading: false, error: undefined },
    ]);
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
    const sidebarHeading = screen.getByRole('heading', { level: 2 });
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

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    expect(screen.getByText('Mocked Question Options Component')).toBeInTheDocument();
  })

  it('should call the useUpdateQuestionMutation when user clicks \'save\' button', async () => {
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

    const saveButton = screen.getByText('buttons.saveAndUpdate');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useUpdateQuestionMutation).toHaveBeenCalled();
      // Should redirect to Edit Template page
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123');
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
          maxLength: 500,
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
          cols: 40,
          rows: 5,
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
          max: 1000,
          step: 5,
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
          step: 1
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

