import React from 'react';

import {act, render, screen} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';

import {useQuestionTypesQuery} from '@/generated/graphql';
import QuestionView from '@/components/QuestionView';


expect.extend(toHaveNoViolations);


jest.mock('@/generated/graphql', () => ({
  useQuestionTypesQuery: jest.fn(),
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


const mockHook = (hook: any) => hook as jest.Mock;


describe("QuestionView", () => {
  beforeEach(() => {
    mockHook(useQuestionTypesQuery).mockReturnValue({
      data: mockQuestionTypes,
      error: undefined,
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
