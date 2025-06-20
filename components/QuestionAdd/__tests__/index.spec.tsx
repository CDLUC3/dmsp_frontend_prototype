import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useAddQuestionMutation,
  useQuestionsDisplayOrderQuery,
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
import QuestionAdd from '@/components/QuestionAdd';

expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionsDisplayOrderQuery: jest.fn(),
  useAddQuestionMutation: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations = ((key: string, ..._args: string[]) => key) as any;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
    };

    return mockUseTranslations;
  }),
}));

// Mock QuestionOptionsComponent since it has it's own separate unit test
jest.mock('@/components/Form/QuestionOptionsComponent', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Question Options Component</div>,
  };
});

const mockQuestionDisplayData = {
  questions: [
    {
      displayOrder: 1
    },
    {
      displayOrder: 2
    },
    {
      displayOrder: 3
    },
    {
      displayOrder: 4
    },
  ]
}


describe("QuestionAdd", () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };



    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    // Mock the router
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useQuestionsDisplayOrderQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDisplayData,
      loading: false,
      error: undefined,
    });
  });

  it("should render correct fields and content", async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "text",
      attributes: {
        pattern: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="text"
          questionName="Text"
          questionJSON={json}
          sectionId="1"
        />);
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');
    const editQuestionTab = screen.getByRole('tab', { name: 'tabs.editQuestion' });
    expect(editQuestionTab).toBeInTheDocument();
    const editOptionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    expect(editOptionsTab).toBeInTheDocument();
    const editLogicTab = screen.getByRole('tab', { name: 'tabs.logic' });
    expect(editLogicTab).toBeInTheDocument();
    const questionTypeLabel = screen.getByLabelText(/labels.type/i);
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

  it("should return user to the template edit page if questionType is missing", async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "text",
      attributes: {
        pattern: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionName="Text"
          questionJSON={json}
          sectionId="1"
        />);
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
      expect(mockRouter.push).toHaveBeenNthCalledWith(1, '/template/123/q/new?section_id=1&step=1');
      expect(mockRouter.push).toHaveBeenNthCalledWith(2, '/template/123');
    });
  });

  it('should call router.push with correct url when user clicks on Change type button', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "text",
      attributes: {
        pattern: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="text"
          questionName="Text"
          questionJSON={json}
          sectionId="1"
        />);
    });
    const changeTypeButton = screen.getByRole('button', { name: 'buttons.changeType' });
    fireEvent.click(changeTypeButton);
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/template/123/q/new?section_id=1&step=1');
    });
  });

  it('should display error when no value is entered in question Text field', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
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

  it('should call addQuestionMutation when Save button is clicked after entering data', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"radioButtons\",\"meta\":{\"schemaVersion\":\"1.0\"},\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"\",\"value\":\"\",\"selected\":false}}]}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  it('should display error when addQuestionMutation returns an error', async () => {
    const mockAddQuestionMutation = jest.fn().mockRejectedValueOnce(new Error("Error"));

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByText('messages.errors.questionAddingError')).toBeInTheDocument();
  })

  it('should call addQuestionMutation with correct data for \'text\' question type ', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        asRichText: true,
        schemaVersion: "1.0"
      },
      type: "text",
      attributes: {
        pattern: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="text"
          questionName="Text Field"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"text\",\"meta\":{\"schemaVersion\":\"1.0\"},\"attributes\":{\"maxLength\":1000,\"minLength\":0,\"pattern\":\"^.+$\"}}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  it('should call addQuestionMutation with correct data for \'textArea\' question type ', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        asRichText: true,
        schemaVersion: "1.0"
      },
      type: "textArea",
      attributes: {
        pattern: null,
        rows: null,
        cols: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="textArea"
          questionName="Text Area"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"textArea\",\"meta\":{\"schemaVersion\":\"1.0\",\"asRichText\":true},\"attributes\":{\"cols\":40,\"maxLength\":1000,\"minLength\":0,\"rows\":20}}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  it('should call addQuestionMutation with correct data for \'number\' question type ', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "number",
      attributes: {
        max: null,
        min: 0,
        step: 1
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="number"
          questionName="Number Field"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"number\",\"meta\":{\"schemaVersion\":\"1.0\"},\"attributes\":{\"max\":10000000,\"min\":0,\"step\":1}}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  it('should call addQuestionMutation with correct data for \'currency\' question type ', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "currency",
      attributes: {
        max: null,
        min: 0,
        step: 1,
        denomination: "GBP"
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="currency"
          questionName="Currency Field"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"currency\",\"meta\":{\"schemaVersion\":\"1.0\"},\"attributes\":{\"max\":10000000,\"min\":0,\"step\":0.01}}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  it('should call addQuestionMutation with correct data for \'url\' question type ', async () => {
    const mockAddQuestionMutation = jest.fn().mockResolvedValueOnce({
      data: { addQuestion: { id: 1 } },
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      mockAddQuestionMutation,
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "url",
      attributes: {
        maxLength: null,
        minLength: 0,
        pattern: null
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="url"
          questionName="Url Field"
          questionJSON={json}
          sectionId="1"
        />);
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to 'New Question'
    fireEvent.change(input, { target: { value: 'New Question' } });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });
    fireEvent.click(saveButton);

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 5,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"url\",\"meta\":{\"schemaVersion\":\"1.0\"},\"attributes\":{\"maxLength\":2048,\"minLength\":2,\"pattern\":\"https?://.+\"}}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: false,
          },
        },
      });
    });
  })

  // QuestionOptionsComponent has it's own separate unit test, so we are just testing that it loads here
  it('should load QuestionOptionsComponent', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
    });

    expect(screen.getByText('Mocked Question Options Component')).toBeInTheDocument();
  })

  it('should call the useAddQuestionMutation when user clicks \'save\' button', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
    });

    const saveButton = screen.getByText('buttons.saveAndAdd');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useAddQuestionMutation).toHaveBeenCalled();
    });
  })

  it('should not display the useSampleTextAsDefault checkbox if the questionTypeId is Radio Button field', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={json}
          sectionId="1"
        />);
    });

    const checkboxText = screen.queryByText('descriptions.sampleTextAsDefault');
    expect(checkboxText).not.toBeInTheDocument();
  })

  it('should display the useSampleTextAsDefault checkbox if the questionTypeId is a Text field', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "text",
      attributes: {
        pattern: null,
        maxLength: null,
        minLength: 0
      }
    })
    await act(async () => {
      render(
        <QuestionAdd
          questionType="text"
          questionName="Text"
          questionJSON={json}
          sectionId="1"
        />);
    });

    const checkboxText = screen.queryByText('descriptions.sampleTextAsDefault');
    expect(checkboxText).toBeInTheDocument();
  })

  it('should call handleRangeLabelChange when RangeComponent input changes', () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const mockDateRangeJSON = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "dateRange",
      columns: {
        end: {
          meta: {
            schemaVersion: "1.0"
          },
          type: "date",
          attributes: {
            label: "Ending"
          }
        },
        start: {
          meta: {
            schemaVersion: "1.0"
          },
          type: "date",
          attributes: {
            label: "Beginning"
          }
        }
      }
    });
    render(
      <QuestionAdd
        questionType="dateRange"
        questionName="Range label"
        questionJSON={mockDateRangeJSON}
        sectionId="1"
      />);

    // Find the input rendered by RangeComponent
    const rangeStartInput = screen.getByLabelText('range start');

    // Simulate user typing
    fireEvent.change(rangeStartInput, { target: { value: 'New Range Label' } });

    expect(rangeStartInput).toHaveValue('New Range Label');
  });

  it('should call handleTypeAheadSearchLabelChange when typeaheadSearch label value changes', () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const mockTypeAheadJSON = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "typeaheadSearch",
      graphQL: {
        query: "query Affiliations($name: String!){affiliations(name: $name) { totalCount nextCursor items {id displayName uri}}}",
        queryId: "useAffiliationsQuery",
        variables: [
          {
            name: "term",
            type: "string",
            label: "Enter the search term to find your affiliation",
            minLength: 3,
            labelTranslationKey: "SignupPage.institutionHelp"
          }
        ],
        answerField: "uri",
        displayFields: [
          {
            label: "Affiliation",
            propertyName: "displayName",
            labelTranslationKey: "SignupPage.institution"
          }
        ],
        responseField: "affiliations.items"
      }
    });

    render(
      <QuestionAdd
        questionType="typeaheadSearch"
        questionName="Typeahead Search"
        questionJSON={mockTypeAheadJSON}
        sectionId="1"
      />);

    // Find the label input rendered by TypeAheadSearch
    const labelInput = screen.getByPlaceholderText('Enter search label');

    // Simulate user typing
    fireEvent.change(labelInput, { target: { value: 'New Institution Label' } });

    expect(labelInput).toHaveValue('New Institution Label');
  });

  it('should call handleTypeAheadHelpTextChange when typeaheadSearch help text value changes', () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const mockTypeAheadJSON = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "typeaheadSearch",
      graphQL: {
        query: "query Affiliations($name: String!){affiliations(name: $name) { totalCount nextCursor items {id displayName uri}}}",
        queryId: "useAffiliationsQuery",
        variables: [
          {
            name: "term",
            type: "string",
            label: "Enter the search term to find your affiliation",
            minLength: 3,
            labelTranslationKey: "SignupPage.institutionHelp"
          }
        ],
        answerField: "uri",
        displayFields: [
          {
            label: "Affiliation",
            propertyName: "displayName",
            labelTranslationKey: "SignupPage.institution"
          }
        ],
        responseField: "affiliations.items"
      }
    });

    render(
      <QuestionAdd
        questionType="typeaheadSearch"
        questionName="Typeahead Search"
        questionJSON={mockTypeAheadJSON}
        sectionId="1"
      />);

    // Find the label input rendered by TypeAheadSearch
    const helpTextInput = screen.getByPlaceholderText('Enter the help text you want to display');

    // Simulate user typing
    fireEvent.change(helpTextInput, { target: { value: 'Enter a search term' } });

    expect(helpTextInput).toHaveValue('Enter a search term');
  });

  it('should pass axe accessibility test', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          attributes: {
            label: null,
            value: null,
            selected: false
          }
        }
      ]
    })

    const { container } = render(
      <QuestionAdd
        questionType="radioButtons"
        questionName="Radio buttons"
        questionJSON={json}
        sectionId="1"
      />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
