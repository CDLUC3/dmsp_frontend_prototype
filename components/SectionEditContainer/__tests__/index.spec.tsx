import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useToast } from '@/context/ToastContext';
import SectionEditContainer from '../index';
import { useSectionQuery } from '@/generated/graphql';
import { updateQuestionDisplayOrderAction } from '../actions';

expect.extend(toHaveNoViolations);

// Mock child components
jest.mock('@/components/SectionHeaderEdit', () => (props: any) => (
  <div data-testid="section-header-edit">{props.title}</div>
));

jest.mock('@/components/AddQuestionButton', () => (props: any) => (
  <button data-testid="add-question-btn">{props.href}</button>
));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('../actions', () => ({
  updateQuestionDisplayOrderAction: jest.fn(),
}));

// Mock useSectionQuery
jest.mock('@/generated/graphql', () => ({
  ...jest.requireActual('@/generated/graphql'),
  useSectionQuery: jest.fn(),
}));

const mockToast = {
  add: jest.fn(),
};


const mockSetErrorMessages = jest.fn();
const mockUseRouter = useRouter as jest.Mock;

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
const mockPush = jest.fn();
describe('SectionEditContainer', () => {
  beforeEach(() => {
    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: '123' });
    (useParams as jest.Mock).mockReturnValue({
      templateId: 'template-123',
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: null,
    });
    jest.clearAllMocks();
  });

  it('should render loading state', async () => {
    // Mock successful server action response
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: null,
    });

    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined,
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={1}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    expect(screen.getByText(/Loading section/i)).toBeInTheDocument();
  });

  it('should render error state', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: undefined,
      error: new Error('Failed'),
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={2}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    expect(screen.getByText('messages.errors.failedToLoadSection')).toBeInTheDocument();
  });

  it('should render section and questions sorted by displayOrder', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: sectionData,
      error: undefined,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={1}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

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

  it('should update order when user clicks move up/move down buttons', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: sectionData,
      error: undefined,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={1}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    // Get all question cards (in DOM/rendered order)
    let questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q1
    const q1Card = questionCards.find(card =>
      within(card).queryByText(/^Q1$/)
    );

    // Get the "Move Up" button inside Q1's card
    const moveUpButton = within(q1Card!).getByRole('button', { name: 'buttons.moveUp' });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    // Re-query the question cards (they should re-render in new order)
    questionCards = screen.getAllByTestId('question-edit-card');

    // Check that the first question card now contains Q1
    expect(questionCards[0]).toHaveTextContent('Q1');

  });

  it('should renders empty questions array gracefully', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { section: { ...sectionData.section, questions: [] } },
      error: undefined,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={2}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    expect(screen.queryByTestId('question-edit-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-question-btn')).toBeInTheDocument();
  });

  it('should handle section.questions as undefined and render gracefully', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { section: { ...sectionData.section, questions: undefined } },
      error: undefined,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={1}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    expect(screen.queryByTestId('question-edit-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-question-btn')).toBeInTheDocument();
  });

  it('should handle missing question.id and question.questionText gracefully', async () => {
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

    await act(async () => {
      render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={2}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
    });

    const questionEditCards = screen.queryAllByTestId('question-edit-card');
    expect(questionEditCards).toHaveLength(2);
  });

  it('should pass axe accessibility test', async () => {
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: sectionData,
      error: undefined,
      refetch: jest.fn(),
    });

    let container: HTMLElement;

    await act(async () => {
      const renderResult = render(
        <SectionEditContainer
          sectionId={1}
          templateId={123}
          displayOrder={1}
          setErrorMessages={mockSetErrorMessages}
          onMoveUp={jest.fn()}
          onMoveDown={jest.fn()}
        />
      );
      container = renderResult.container;
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Move Up Button for questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);

  })
  it('should call updateQuestionDisplayOrderAction with decreased display order when move up button is clicked', async () => {
    // Mock successful server action response
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: null,
    });

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
        displayOrder={2}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveDown',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    await waitFor(() => {
      expect(updateQuestionDisplayOrderAction).toHaveBeenCalledWith({
        questionId: 11,
        newDisplayOrder: 2,
      });
    });
  });

  it('should not call server action when display order would be less than 1', async () => {
    // Mock successful server action response
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: null,
    });

    const sectionData2 = {
      section: {
        id: 1,
        name: 'Section 1',
        displayOrder: 1,
        questions: [
          { id: 10, questionText: 'Q1', displayOrder: 2 },
          { id: 11, questionText: 'Q2', displayOrder: 1 },
        ],
      },
    };
    (useSectionQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: sectionData2,
      error: undefined,
      refetch: jest.fn(),
    });

    render(
      <SectionEditContainer
        sectionId={1}
        templateId={123}
        displayOrder={1}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveUp',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    expect(updateQuestionDisplayOrderAction).not.toHaveBeenCalled();

    expect(mockToast.add).toHaveBeenCalledWith('messages.errors.displayOrderAlreadyAtTop', { type: 'error' });

  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should handle server action errors', async () => {
    // Mock successful server action response
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ['Server error occurred'],
      data: null,
    });

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
        displayOrder={2}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveDown',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    await waitFor(() => {
      expect(mockSetErrorMessages).toHaveBeenCalledWith(['Server error occurred']);
    });
  });

  it('should handle general errors from server response data', async () => {
    // Mock server action response with general error in data
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: {
        errors: {
          general: 'Database error'
        }
      },
    });

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
        displayOrder={2}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveDown',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    await waitFor(() => {
      expect(mockSetErrorMessages).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  it('should handle redirect if returned from updateQuestionDisplayOrderAction mutation', async () => {
    // Mock server action response with general error in data
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: {
        errors: {
          general: 'Database error'
        }
      },
      redirect: '/template'
    });

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
        displayOrder={2}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveDown',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    // Check that user is redirected to home page
    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/template');
    });
  });
});

describe('Success Announcement', () => {
  beforeEach(() => {
    // Prevent errors in test from scrollIntoView not existing
    Element.prototype.scrollIntoView = jest.fn();
  })
  it('should announce successful move to screen readers', async () => {
    // Mock successful server action response
    (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: null,
    });

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
        displayOrder={2}
        setErrorMessages={mockSetErrorMessages}
        onMoveUp={jest.fn()}
        onMoveDown={jest.fn()}
      />
    );

    // Find all question cards
    const questionCards = screen.getAllByTestId('question-edit-card');

    // Find the card that contains Q2
    const q2Card = questionCards.find(card =>
      within(card).queryByText('Q2')
    );
    expect(q2Card).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(q2Card!).getByRole('button', {
      name: 'buttons.moveDown',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    await waitFor(() => {
      // Check that the announcement appears in the live region
      expect(screen.getByText('messages.questionMoved')).toBeInTheDocument();
    });
  });
});