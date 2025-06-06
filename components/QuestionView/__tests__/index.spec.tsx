import React from 'react';

import { act, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';

import {
  useQuestionTypesQuery,
  useTemplateQuery,
} from '@/generated/graphql';
import QuestionView from '@/components/QuestionView';


expect.extend(toHaveNoViolations);


jest.mock('@/generated/graphql', () => ({
  useQuestionTypesQuery: jest.fn(),
  useTemplateQuery: jest.fn(),
}));


const mockQuestionTypes = {
  questionTypes: [
    {
      id: 1,
      name: "Text Area",
    },
  ]
};


const mockQuestion = {
  guidanceText: 'Question guidance...',
  questionText: 'Question text?',
  requirementText: 'Question requirements',
  sampleText: 'Lorem ipsum dolor sit...',
  useSampleTextAsDefault: false,
  questionTypeId: 1,
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
    const mockQuestionWithTextField = { ...mockQuestion, questionTypeId: 2 };
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: { questionTypes: [{ id: 2, name: "Text Field" }] },
      loading: false,
      error: null,
    });

    render(
      <QuestionView
        question={mockQuestionWithTextField}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Plain text field');
  });

  it('should render the Radio Buttons question type', () => {
    const mockQuestionWithRadioButtons = { ...mockQuestion, questionTypeId: 3 };
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: { questionTypes: [{ id: 3, name: "Radio Buttons" }] },
      loading: false,
      error: null,
    });

    render(
      <QuestionView
        question={mockQuestionWithRadioButtons}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Radios');
  });

  it('should render the Check Boxes question type', () => {
    const mockQuestionWithCheckBoxes = { ...mockQuestion, questionTypeId: 4 };
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: { questionTypes: [{ id: 4, name: "Check Boxes" }] },
      loading: false,
      error: null,
    });

    render(
      <QuestionView
        question={mockQuestionWithCheckBoxes}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Checkboxes');
  });

  it('should render the Select Box question type', () => {
    const mockQuestionWithSelectBox = { ...mockQuestion, questionTypeId: 5 };
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: { questionTypes: [{ id: 5, name: "Select Box" }] },
      loading: false,
      error: null,
    });

    render(
      <QuestionView
        question={mockQuestionWithSelectBox}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Select Box');
  });

  it('should render the Multi Select Box question type', () => {
    const mockQuestionWithMultiSelectBox = { ...mockQuestion, questionTypeId: 6 };
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: { questionTypes: [{ id: 6, name: "Multi Select Box" }] },
      loading: false,
      error: null,
    });

    render(
      <QuestionView
        question={mockQuestionWithMultiSelectBox}
        isPreview={true}
        templateId={1}
      />
    );
    expect(screen.getByTestId('card-body').textContent).toContain('Multi Select Box');
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
