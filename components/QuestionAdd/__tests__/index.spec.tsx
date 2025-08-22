import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useAddQuestionMutation,
  useQuestionsDisplayOrderQuery,
  useTemplateQuery, // Added for when we test contents of Question Preview
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import QuestionAdd from '@/components/QuestionAdd';
import * as getParsedJSONModule from '@/components/hooks/getParsedQuestionJSON';
import { AffiliationSearchQuestionType } from "@dmptool/types";


expect.extend(toHaveNoViolations);


// Mock the Apollo client creation since TypeAheadWithOther creates its own client. This is for when the Question Preview component opens
jest.mock('@/lib/graphql/client/apollo-client', () => ({
  createApolloClient: jest.fn(() => ({
    query: jest.fn().mockResolvedValue({
      data: {
        affiliations: {
          items: [
            {
              id: '1',
              displayName: 'University of California',
              uri: 'https://example.com/uc'
            }
          ]
        }
      }
    })
  }))
}));

jest.mock('@/components/hooks/getParsedQuestionJSON', () => {
  const actual = jest.requireActual('@/components/hooks/getParsedQuestionJSON');
  return {
    __esModule: true,
    ...actual,
    getParsedQuestionJSON: jest.fn(actual.getParsedQuestionJSON),
  };
});

// Mock the hooks
jest.mock("@/generated/graphql", () => ({
  useQuestionsDisplayOrderQuery: jest.fn(),
  useAddQuestionMutation: jest.fn(),
  useTemplateQuery: jest.fn()
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

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();
const mockToast = {
  add: jest.fn(),
};

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    /*eslint-disable @typescript-eslint/no-explicit-any */
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

const mockTemplateData = {

  template: {
    __typename: "Template",
    id: 15,
    name: "National Center for Sustainable Transportation - Project Data Management Plan",
    description: "<p>This template is for projects funded by the National Center for Sustainable Transportation. Use of this template is <em>not</em> limited to researchers at the University of California, Davis.</p>",
    errors: {
      __typename: "TemplateErrors",
      general: null,
      name: null,
      ownerId: null
    },
    latestPublishVersion: "v15",
    latestPublishDate: "1755815345000",
    created: "2023-09-13 17:47:34",
    sections: [],
    owner: {
      displayName: "University of Example"
    },
    visibility: "ORGANIZATION",
    bestPractice: false,
    isDirty: true
  }
}

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

    (useTemplateQuery as jest.Mock).mockReturnValue({ // Added for when we test contents of Question preview
      data: mockTemplateData,
      loading: false,
      error: undefined,
    });
  });

  afterEach(() => {
    // Clean up any modals or DOM pollution
    document.body.innerHTML = '';

    // Clear all mocks to prevent state bleeding
    jest.clearAllMocks();

    // Reset any global state that might have been modified
    window.location.hash = '';
  });


  it("should render correct fields and content", async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
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
    // Setting question as required
    expect(screen.getByText('form.yesLabel')).toBeInTheDocument();
    expect(screen.getByText('form.noLabel')).toBeInTheDocument();
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
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123/q/new?section_id=1&step=1');
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
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123/q/new?section_id=1&step=1');
    });
  });


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

    // Get the question text input
    const input = screen.getByLabelText('labels.questionText');

    // add text to question text field
    fireEvent.change(input, { target: { value: 'New Question' } });

    // Add a new radio row
    const radioInput = screen.getByPlaceholderText('placeholder.text');

    await act(async () => {
      fireEvent.change(radioInput, { target: { value: 'Yes' } });
    })

    // Select that the question should be required
    const isRequiredRadio = screen.getByLabelText('form.yesLabel');

    await act(async () => {
      fireEvent.click(isRequiredRadio);
    })

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });

    await act(async () => {
      fireEvent.click(saveButton);
    })

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
            json: "{\"type\":\"radioButtons\",\"attributes\":{},\"meta\":{\"schemaVersion\":\"1.0\"},\"options\":[{\"label\":\"Yes\",\"value\":\"Yes\",\"selected\":false}]}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: true,
          },
        },
      });
    });
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
            json: "{\"type\":\"text\",\"attributes\":{\"maxLength\":1000,\"minLength\":0,\"pattern\":\"^.+$\"},\"meta\":{\"schemaVersion\":\"1.0\"}}",
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
            json: "{\"type\":\"textArea\",\"attributes\":{\"cols\":40,\"maxLength\":1000,\"minLength\":0,\"rows\":20,\"asRichText\":true},\"meta\":{\"schemaVersion\":\"1.0\"}}",
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
            json: "{\"type\":\"number\",\"attributes\":{\"max\":10000000,\"min\":0,\"step\":1},\"meta\":{\"schemaVersion\":\"1.0\"}}",
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
            json: "{\"type\":\"currency\",\"attributes\":{\"max\":10000000,\"min\":0,\"step\":0.01,\"denomination\":\"GBP\"},\"meta\":{\"schemaVersion\":\"1.0\"}}",
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
            json: "{\"type\":\"url\",\"attributes\":{\"maxLength\":2048,\"minLength\":2,\"pattern\":\"https?://.+\"},\"meta\":{\"schemaVersion\":\"1.0\"}}",
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

    // Radio button info with order, text and checkbox should be in document
    expect(screen.getByLabelText('labels.order')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.text')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.default')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buttons.addRow' })).toBeInTheDocument();
  })

  it('should add a new row when the add button is clicked', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const mockQuestionJSON = "{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"radioButtons\",\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"Option 1\",\"value\":\"1\",\"selected\":false}},{\"type\":\"option\",\"attributes\":{\"label\":\"Option 2\",\"value\":\"2\",\"selected\":true}}]}"

    await act(async () => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON={mockQuestionJSON}
          sectionId="1"
        />);
    });

    // Enter Question text
    const input = screen.getByLabelText('labels.questionText');

    // Set value to empty
    fireEvent.change(input, { target: { value: 'Testing adding new row' } });

    const radioInput = screen.getByLabelText('labels.text');
    fireEvent.change(radioInput, { target: { value: 'Yes' } });

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });
    fireEvent.click(addButton);

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useAddQuestionMutation).toHaveBeenCalled();
    });
  });


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

  it('should display the useSampleTextAsDefault checkbox if the questionTypeId is a Text area field', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json = JSON.stringify({
      meta: {
        asRichText: true,
        schemaVersion: "1.0"
      },
      type: "textArea",
      attributes: {
        cols: 20,
        rows: 4,
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

  it('should call handleRangeLabelChange for numberRange changes', () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const mockDateRangeJSON = JSON.stringify({
      meta: {
        schemaVersion: "1.0"
      },
      type: "numberRange",
      columns: {
        end: {
          meta: {
            schemaVersion: "1.0"
          },
          type: "number",
          attributes: {
            max: null,
            min: 0,
            step: 1,
            label: "To"
          }
        },
        start: {
          meta: {
            schemaVersion: "1.0"
          },
          type: "number",
          attributes: {
            max: null,
            min: 0,
            step: 1,
            label: "From"
          }
        }
      }
    });
    render(
      <QuestionAdd
        questionType="numberRange"
        questionName="Number Range Label"
        questionJSON={mockDateRangeJSON}
        sectionId="1"
      />);

    // Find the input rendered by RangeComponent
    const rangeStartInput = screen.getByLabelText('range start');

    // Simulate user typing
    fireEvent.change(rangeStartInput, { target: { value: 'New Range Label' } });

    expect(rangeStartInput).toHaveValue('New Range Label');
  });

  it('should set displayOrder to 1 for the new question, if there are no existing questions', async () => {

    (useQuestionsDisplayOrderQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

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

    // Get the question text input
    const input = screen.getByLabelText('labels.questionText');

    // add text to question text field
    fireEvent.change(input, { target: { value: 'New Question' } });

    // Add a new radio row
    const radioInput = screen.getByPlaceholderText('placeholder.text');

    await act(async () => {
      fireEvent.change(radioInput, { target: { value: 'Yes' } });
    })

    // Select that the question should be required
    const isRequiredRadio = screen.getByLabelText('form.yesLabel');

    await act(async () => {
      fireEvent.click(isRequiredRadio);
    })

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });

    await act(async () => {
      fireEvent.click(saveButton);
    })

    // Check if the addQuestionMutation was called
    await waitFor(() => {
      expect(mockAddQuestionMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            sectionId: 1,
            displayOrder: 1,
            isDirty: true,
            questionText: 'New Question',
            json: "{\"type\":\"radioButtons\",\"attributes\":{},\"meta\":{\"schemaVersion\":\"1.0\"},\"options\":[{\"label\":\"Yes\",\"value\":\"Yes\",\"selected\":false}]}",
            requirementText: '',
            guidanceText: '',
            sampleText: '',
            useSampleTextAsDefault: false,
            required: true,
          },
        },
      });
    });
  })

  it('should call handleTypeAheadSearchLabelChange when typeaheadSearch label value changes and pass correct value to Question Preview', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const json: AffiliationSearchQuestionType = {
      meta: {
        schemaVersion: "1.0"
      },
      type: "affiliationSearch",
      attributes: {
        label: "Affiliation search label",
      },
      graphQL: {
        query: "\nquery Affiliations($name: String!){\n  affiliations(name: $name) {\n    totalCount\n    nextCursor\n    items {\n      id\n      displayName\n      uri\n    }\n  }\n}",
        queryId: "useAffiliationsQuery",
        variables: [
          {
            name: "name",
            label: "Search",
            labelTranslationKey: "SignupPage.institutionHelp",
            type: "string",
            minLength: 3,
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
    };
    const mockTypeAheadJSON = JSON.stringify(json);

    await act(async () => {
      render(
        <QuestionAdd
          questionType="affiliationSearch"
          questionName="Affiliation Search"
          questionJSON={mockTypeAheadJSON}
          sectionId="1"
        />
      );
    });

    // Find the label input rendered by AffiliationSearch
    const labelInput = screen.getByPlaceholderText('Enter search label');

    // Simulate user typing
    await act(async () => {
      fireEvent.change(labelInput, { target: { value: 'New Institution Label' } });
    });

    expect(labelInput).toHaveValue('New Institution Label');

    // Click the preview button
    const previewButton = screen.getByRole('button', { name: /buttons.previewQuestion/i });

    await act(async () => {
      fireEvent.click(previewButton);
    });

    // Wait for the modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });

    // Check if the new label appears in the preview
    await waitFor(() => {
      expect(screen.getByText('New Institution Label')).toBeInTheDocument();
    });
  });

  it('should call handleTypeAheadHelpTextChange when typeaheadSearch help text value changes and pass correct value to Question Preview', async () => {
    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    const json: AffiliationSearchQuestionType = {
      meta: {
        schemaVersion: "1.0"
      },
      type: "affiliationSearch",
      attributes: {
        help: "Enter the search term to find your affiliation",
      },
      graphQL: {
        query: "\nquery Affiliations($name: String!){\n  affiliations(name: $name) {\n    totalCount\n    nextCursor\n    items {\n      id\n      displayName\n      uri\n    }\n  }\n}",
        queryId: "useAffiliationsQuery",
        variables: [
          {
            name: "name",
            label: "Search",
            labelTranslationKey: "SignupPage.institutionHelp",
            type: "string",
            minLength: 3,
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
    };
    const mockTypeAheadJSON = JSON.stringify(json);

    render(
      <QuestionAdd
        questionType="affiliationSearch"
        questionName="Affiliation Search"
        questionJSON={mockTypeAheadJSON}
        sectionId="1"
      />);

    // Find the label input rendered by AffiliationSearch
    const helpTextInput = screen.getByPlaceholderText('Enter the help text you want to display');

    // Simulate user typing
    fireEvent.change(helpTextInput, { target: { value: 'Enter a search term' } });

    expect(helpTextInput).toHaveValue('Enter a search term');

    // Click the preview button
    const previewButton = screen.getByRole('button', { name: /buttons.previewQuestion/i });

    await act(async () => {
      fireEvent.click(previewButton);
    });

    // Wait for the modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });

    // Check if the new label appears in the preview
    await waitFor(() => {
      expect(screen.getByText('Enter a search term')).toBeInTheDocument();
    });
  });

});

describe("Accessibility", () => {
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

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: mockTemplateData,
      loading: false,
      error: undefined,
    });
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';

    // Reset all mocks
    jest.clearAllMocks();
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

})

describe("Error handling", () => {
  let mockRouter;
  beforeEach(() => {

    // Clean up DOM
    document.body.innerHTML = '';

    // Reset all mocks
    jest.clearAllMocks();


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

    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);

    (useQuestionsDisplayOrderQuery as jest.Mock).mockReturnValue({
      data: mockQuestionDisplayData,
      loading: false,
      error: undefined,
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
            label: 'Yes',
            value: 'yes',
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

    // Add a new radio row
    const radioInput = screen.getByPlaceholderText('placeholder.text');

    await act(async () => {
      fireEvent.change(radioInput, { target: { value: 'Yes' } });
    })

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });

    await act(async () => {
      fireEvent.click(saveButton);
    })

    expect(screen.getByText('messages.errors.questionAddingError')).toBeInTheDocument();
  })

  it('should display toast error and call router.push when no sectionId', async () => {
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
            label: 'Yes',
            value: 'yes',
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
        />);
    });

    expect(mockToast.add).toHaveBeenCalledWith('messaging.somethingWentWrong', { type: 'error' });
    expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123');
  })

  it('should display error when getParsedQuestionJSON returns null for parsed', async () => {
    const mockGetParsed = getParsedJSONModule.getParsedQuestionJSON as jest.Mock;

    // temporarily override return value
    mockGetParsed.mockReturnValueOnce({
      parsed: null,
      error: 'Mocked parse error',
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    act(() => {
      render(
        <QuestionAdd
          questionType="radioButtons"
          questionName="Radio buttons"
          questionJSON=""
          sectionId="1"
        />
      );
    });

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });
    act(() => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByText('Mocked parse error')).toBeInTheDocument();

  });

  it('should trigger an error when trying to add the question due to getParsedQuestionJSON returning null for parsed', async () => {
    const mockGetParsed = getParsedJSONModule.getParsedQuestionJSON as jest.Mock;

    // 1. First render sets parsedQuestionJSON
    mockGetParsed.mockReturnValueOnce({
      parsed: { type: 'radioButtons' },
      error: null,
    });

    // 2. On second invocation (triggered by form submit), it fails
    mockGetParsed.mockReturnValueOnce({
      parsed: null,
      error: 'Failed to parse during submit',
    });

    (useAddQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    const json = JSON.stringify({
      meta: {
        asRichText: true,
        schemaVersion: "1.0"
      },
      type: "textArea",
      attributes: {
        cols: 20,
        rows: 4,
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

    //Wait for component to mount and parsedQuestionJSON to be set
    await waitFor(() => {
      expect(screen.queryByText('Failed to parse during submit')).not.toBeInTheDocument();
    });

    // Get the input
    const input = screen.getByLabelText('labels.questionText');

    // Set value to empty
    fireEvent.change(input, { target: { value: 'Test' } });

    const saveButton = screen.getByRole('button', { name: /buttons.saveAndAdd/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByText('Failed to parse during submit')).toBeInTheDocument();

  });
});