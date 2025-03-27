import React from 'react';

import {act, render, screen} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';

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

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key) => {
    const translations = {
      "QuestionView.cardType": "Question",
    };
    return translations[key] || key;
  }),
  useLocale: jest.fn(() => 'en-US'),
}));


const mockQuestionTypes = {
  questionTypes: [
    {
      id: "1",
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
  questionTypeId: "1",
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
      />);

    expect(screen.getByTestId('question-card')).toBeInTheDocument();
  });

  it('should render the textarea questiontype', async () => {
    render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
      />);

    expect(
      screen.getByTestId('card-body').firstChild.classList.contains('dmpEditor')
    ).toBe(true);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <QuestionView
        question={mockQuestion}
        isPreview={true}
      />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
