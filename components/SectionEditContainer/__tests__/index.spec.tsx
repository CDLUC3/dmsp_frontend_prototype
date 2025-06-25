import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { axe, toHaveNoViolations } from 'jest-axe';
import SectionEditContainer from '../index';
import { useSectionQuery } from '@/generated/graphql';
expect.extend(toHaveNoViolations);

// Mock child components
jest.mock('@/components/SectionHeaderEdit', () => (props: any) => (
  <div data-testid="section-header-edit">{props.title}</div>
));
jest.mock('@/components/QuestionEditCard', () => (props: any) => (
  <div data-testid="question-edit-card">{props.text}</div>
));
jest.mock('@/components/AddQuestionButton', () => (props: any) => (
  <button data-testid="add-question-btn">{props.href}</button>
));

// Mock useSectionQuery
jest.mock('@/generated/graphql', () => ({
  ...jest.requireActual('@/generated/graphql'),
  useSectionQuery: jest.fn(),
}));

const mockSetErrorMessages = jest.fn();

const sectionData = {
  section: {
    id: 1,
    name: 'Section 1',
    displayOrder: 2,
    questions: [
      { id: 10, questionText: 'Q1', displayOrder: 2 },
      { id: 11, questionText: 'Q2', displayOrder: 1 },
    ],
  },
};

describe('SectionEditContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined,
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );
    expect(screen.getByText(/Loading section/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: undefined,
      error: new Error('Failed'),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );
    expect(screen.getByText(/Failed to load section/i)).toBeInTheDocument();
  });

  it('should render section and questions sorted by displayOrder', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: sectionData,
      error: undefined,
      refetch: jest.fn(),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    expect(screen.getByTestId('section-header-edit')).toHaveTextContent('Section 1');
    const questionCards = screen.getAllByTestId('question-edit-card');
    // Should be sorted by displayOrder: Q2 (1), Q1 (2)
    expect(questionCards[0]).toHaveTextContent('Q2');
    expect(questionCards[1]).toHaveTextContent('Q1');
    expect(screen.getByTestId('add-question-btn')).toHaveAttribute(
      'data-testid',
      'add-question-btn'
    );
  });

  it('should renders empty questions array gracefully', () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { section: { ...sectionData.section, questions: [] } },
      error: undefined,
      refetch: jest.fn(),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    expect(screen.queryByTestId('question-edit-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-question-btn')).toBeInTheDocument();
  });

  it('should handle section.questions as undefined and render gracefully', () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { section: { ...sectionData.section, questions: undefined } },
      error: undefined,
      refetch: jest.fn(),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    expect(screen.queryByTestId('question-edit-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-question-btn')).toBeInTheDocument();
  });

  it('should handle missing question.id and question.questionText gracefully', () => {
    const questions = [
      { id: null, questionText: null, displayOrder: 2 },
      { id: 11, questionText: 'Q2', displayOrder: 1 },
    ];


    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { section: { ...sectionData.section, questions } },
      error: undefined,
      refetch: jest.fn(),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    const questionEditCards = screen.queryAllByTestId('question-edit-card');
    expect(questionEditCards).toHaveLength(2);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});