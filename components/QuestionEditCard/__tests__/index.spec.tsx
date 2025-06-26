import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import QuestionEditCard from '../index';
import { updateQuestionDisplayOrderAction } from '../actions';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('../actions', () => ({
  updateQuestionDisplayOrderAction: jest.fn(),
}));

jest.mock('@/utils/general', () => ({
  stripHtml: jest.fn((text) => text), // Simple mock that returns the input
}));

jest.mock('@/utils/clientLogger', () => jest.fn());

jest.mock('@/utils/routes', () => ({
  routePath: jest.fn(() => '/mock-path'),
}));

// Mock Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockUseRouter = useRouter as jest.Mock;

describe('QuestionEditCard', () => {
  const mockSetErrorMessages = jest.fn();
  const mockOnOptimisticUpdate = jest.fn();
  const mockPush = jest.fn();
  const mockTranslations = jest.fn((key: string, params?: any) => {
    if (key === 'buttons.moveUp') return `Move up ${params?.name || ''}`;
    if (key === 'buttons.moveDown') return `Move down ${params?.name || ''}`;
    if (key === 'messages.questionMoved') return `Question moved to position ${params?.displayOrder}`;
    if (key === 'label.question') return 'Question';
    if (key === 'links.editQuestion') return 'Edit Question';
    return key;
  });

  const defaultProps = {
    id: '123',
    text: 'Sample question text',
    link: '/edit/123',
    name: 'Sample Question',
    displayOrder: 5,
    setErrorMessages: mockSetErrorMessages,
    onOptimisticUpdate: mockOnOptimisticUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });


    (useParams as jest.Mock).mockReturnValue({
      templateId: 'template-123',
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useTranslations as jest.Mock).mockImplementation((namespace) => {
      if (namespace === 'Global') {
        return (key: string) => {
          if (key === 'messaging.somethingWentWrong') return 'Something went wrong';
          return key;
        };
      }
      return mockTranslations;
    });
  });

  describe('QuestionEditCard', () => {
    it('should render correct move up and down aria-labels when no name is passed', async () => {
      // Mock successful server action response
      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: true,
        errors: [],
        data: null,
      });

      const props = {
        ...defaultProps,
        name: undefined,
      };


      render(<QuestionEditCard {...props} />);

      const buttonMoveDown = screen.getByRole('button', { name: /move down/i });
      expect(buttonMoveDown).toHaveAttribute('aria-label', 'Move down ');
      const buttonMoveUp = screen.getByRole('button', { name: /move up/i });
      expect(buttonMoveUp).toHaveAttribute('aria-label', 'Move up ');
    });
  });

  describe('Move Up Button', () => {
    it('should call handleDisplayOrderChange with decreased display order when move up button is clicked', async () => {
      // Mock successful server action response
      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: true,
        errors: [],
        data: null,
      });

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

      // Verify optimistic update was called
      expect(mockOnOptimisticUpdate).toHaveBeenCalledWith(123, 4);

      await waitFor(() => {
        expect(updateQuestionDisplayOrderAction).toHaveBeenCalledWith({
          questionId: 123,
          newDisplayOrder: 4,
        });
      });
    });

    it('should not call server action when display order would be less than 1', async () => {
      const propsWithDisplayOrder1 = {
        ...defaultProps,
        displayOrder: 1,
      };

      render(<QuestionEditCard {...propsWithDisplayOrder1} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

      // Should not call optimistic update or server action
      expect(mockOnOptimisticUpdate).not.toHaveBeenCalled();
      expect(updateQuestionDisplayOrderAction).not.toHaveBeenCalled();

      // Should set error message
      expect(mockSetErrorMessages).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Move Down Button', () => {
    it('should call handleDisplayOrderChange with increased display order when move down button is clicked', async () => {
      // Mock successful server action response
      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: true,
        errors: [],
        data: null,
      });

      render(<QuestionEditCard {...defaultProps} />);

      const moveDownButton = screen.getByLabelText('Move down Sample Question');

      fireEvent.click(moveDownButton);

      // Verify optimistic update was called
      expect(mockOnOptimisticUpdate).toHaveBeenCalledWith(123, 6);

      await waitFor(() => {
        expect(updateQuestionDisplayOrderAction).toHaveBeenCalledWith({
          questionId: 123,
          newDisplayOrder: 6,
        });
      });
    });
  });

  describe('Error Handling', () => {

    it('should handle server action errors', async () => {
      // Mock failed server action response
      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: false,
        errors: ['Server error occurred'],
        data: null,
      });

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

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

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

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

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

      // Check that user is redirected to home page
      await waitFor(() => {
        expect(mockUseRouter().push).toHaveBeenCalledWith('/template');
      });
    });
  });

  describe('Success Announcement', () => {
    it('should announce successful move to screen readers', async () => {
      // Mock successful server action response
      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: true,
        errors: [],
        data: null,
      });

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      fireEvent.click(moveUpButton);

      await waitFor(() => {
        // Check that the announcement appears in the live region
        expect(screen.getByText('Question moved to position 4')).toBeInTheDocument();
      });
    });
  });

  describe('Component Behavior Without Optional Props', () => {
    it('should handle missing onOptimisticUpdate prop gracefully', async () => {
      const propsWithoutOptimisticUpdate = {
        ...defaultProps,
        onOptimisticUpdate: undefined,
      };

      (updateQuestionDisplayOrderAction as jest.Mock).mockResolvedValue({
        success: true,
        errors: [],
        data: null,
      });

      render(<QuestionEditCard {...propsWithoutOptimisticUpdate} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      // Should not throw error when onOptimisticUpdate is undefined
      expect(() => fireEvent.click(moveUpButton)).not.toThrow();

      await waitFor(() => {
        expect(updateQuestionDisplayOrderAction).toHaveBeenCalled();
      });
    });

    it('should handle missing setErrorMessages prop gracefully', async () => {
      const propsWithoutSetErrorMessages = {
        ...defaultProps,
        setErrorMessages: undefined,
        displayOrder: 1, // This will trigger error condition
      };

      render(<QuestionEditCard {...propsWithoutSetErrorMessages} />);

      const moveUpButton = screen.getByLabelText('Move up Sample Question');

      // Should not throw error when setErrorMessages is undefined
      expect(() => fireEvent.click(moveUpButton)).not.toThrow();
    });
  });
});