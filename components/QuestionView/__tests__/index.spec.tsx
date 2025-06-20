import React from 'react';

import { act, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';

import {
  useQuestionTypesQuery,
  useTemplateQuery,
} from '@/generated/graphql';
import mockQuestionTypes from '@/__mocks__/mockQuestionTypes.json';
import QuestionView from '@/components/QuestionView';


expect.extend(toHaveNoViolations);


jest.mock('@/generated/graphql', () => ({
  useQuestionTypesQuery: jest.fn(),
  useTemplateQuery: jest.fn(),
}));


const mockQuestion = {
  guidanceText: 'Question guidance...',
  questionText: 'Question text?',
  requirementText: 'Question requirements',
  sampleText: 'Lorem ipsum dolor sit...',
  useSampleTextAsDefault: false,
  json: JSON.stringify({
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
  }),
};


const mockTemplate = {
  name: "DMP Template from Dataverse",
  description: "DMP Template from Dataverse",
  errors: null,
  latestPublishVersion: "v1",
  latestPublishDate: "1648835084000",
  created: "1412980160000",
  sections: [
    {
      id: 67,
      displayOrder: 1,
      name: "Data description",
      questions: [mockQuestion],
    },
  ]
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockHook = (hook: any) => hook as jest.Mock;


describe("QuestionView", () => {
  beforeEach(() => {
    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };

    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: mockQuestionTypes,
      loading: false,
      error: null,
    });

    mockHook(useTemplateQuery).mockReturnValue({
      data: { template: mockTemplate },
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it("should render the view", async () => {
    render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
        templateId={1}
      />);

    expect(screen.getByTestId('question-card')).toBeInTheDocument();
  });

  it('should render the textarea element with class "question-text-editor"', async () => {
    render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
        templateId={1}
      />
    );

    expect(screen.getByLabelText(/question-text-editor/i)).toBeInTheDocument();
  });

  it('should return null when question is null', () => {
    const { container } = render(
      <QuestionView
        isPreview={false}
        question={null}
        templateId={1}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render the requirements section when requirementText is null', () => {
    const mockQuestion = {
      questionText: 'Sample Question',
      requirementText: null,
      guidanceText: 'Sample Guidance',
      questionTypeId: 1,
      modified: '2023-01-01',
    };

    render(
      <QuestionView
        isPreview={false}
        question={mockQuestion}
        templateId={1}
      />
    );

    const requirementsSection = screen.queryByText(/requirements/i);
    expect(requirementsSection).toBeNull();
  });

  it('should render the textarea element with class "question-text-editor"', async () => {
    render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
        templateId={1}
      />
    );

    const cardBody = screen.getByTestId('card-body');
    const textarea = cardBody.querySelector('textarea.question-text-editor');
    expect(textarea).toBeInTheDocument();
  });

  it('should render the Text Field question type', () => {
    const mockQuestionWithTextField = {
      ...mockQuestion, json: JSON.stringify({
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
    };

    render(
      <QuestionView
        question={mockQuestionWithTextField}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('text');
  });

  it('should render the Radio Buttons question type', () => {
    const mockQuestionWithRadioButtons = {
      ...mockQuestion, json: JSON.stringify({
        meta: {
          schemaVersion: "1.0"
        },
        type: "radioButtons",
        options: [
          {
            attributes: {
              label: "Option 1",
              value: "option1",
              selected: false
            }
          }
        ]
      })
    };

    render(
      <QuestionView
        question={mockQuestionWithRadioButtons}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Option 1');
  });

  it('should render the Check Boxes question type', () => {
    const mockQuestionWithCheckBoxes = {
      ...mockQuestion, json: JSON.stringify({
        type: "checkBoxes",
        meta: {
          schemaVersion: "1.0",
          labelTranslationKey: "questions.research_methods"
        },
        options: [
          {
            type: "option",
            attributes: {
              label: "Interviews",
              value: "interviews",
              checked: true
            }
          },
          {
            type: "option",
            attributes: {
              label: "Surveys",
              value: "surveys",
              checked: false
            }
          },
          {
            type: "option",
            attributes: {
              label: "Observations",
              value: "observations",
              checked: true
            }
          },
          {
            type: "option",
            attributes: {
              label: "Focus Groups",
              value: "focus_groups",
              checked: true
            }
          }
        ]
      })
    };

    render(
      <QuestionView
        question={mockQuestionWithCheckBoxes}
        isPreview={true}
        templateId={1}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(checkboxes[0]).toHaveAttribute('value', 'interviews');
    expect(checkboxes[1]).toHaveAttribute('value', 'surveys');
    expect(checkboxes[2]).toHaveAttribute('value', 'observations');
    expect(checkboxes[3]).toHaveAttribute('value', 'focus_groups');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).toBeChecked();
  });

  it('should render the Select Box question type', () => {
    const mockQuestionWithSelectBox = {
      ...mockQuestion, json: JSON.stringify({
        type: 'selectBox',
        meta: {
          schemaVersion: '1.0',
        },
        options: [
          {
            type: 'option',
            attributes: {
              label: 'Option A',
              value: 'Option A',
              selected: true,
            },
          },
          {
            type: 'option',
            attributes: {
              label: 'Option B',
              value: 'Option B',
            },
          },
          {
            type: 'option',
            attributes: {
              label: 'Option C',
              value: 'Option C',
            },
          },
        ],
        attributes: {
          multiple: false,
        },
      })
    };

    render(
      <QuestionView
        question={mockQuestionWithSelectBox}
        isPreview={true}
        templateId={1}
      />
    );
    screen.debug();
    expect(screen.getByTestId('card-body').textContent).toContain('Option A');
  });


  it('should not execute logic when question is undefined', () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: { questionTypes: [] },
    });

    render(
      <QuestionView
        question={undefined}
        isPreview={true}
        templateId={1}
      />
    );

    // Assert that no elements are rendered
    expect(screen.queryByTestId('question-card')).toBeNull();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
        templateId={1}
      />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
