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

    const cardBody = screen.getByTestId('card-body');
    const textarea = cardBody.querySelector('textarea.question-text-editor');
    expect(textarea).toBeInTheDocument();
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
