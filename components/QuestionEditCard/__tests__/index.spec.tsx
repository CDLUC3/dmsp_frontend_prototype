import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import QuestionEditCard from '../index';

// Mock dependencies
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('QuestionEditCard', () => {
  const mockHandleDisplayOrderChange = jest.fn();
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
    handleDisplayOrderChange: mockHandleDisplayOrderChange
  };

  beforeEach(() => {
    jest.clearAllMocks();

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
      const props = {
        ...defaultProps,
        name: undefined,
      };


      render(<QuestionEditCard {...props} />);

      const buttonMoveDown = screen.getByRole('button', { name: /move down/i });
      expect(buttonMoveDown).toHaveAttribute('aria-label', 'Move down Sample question text');
      const buttonMoveUp = screen.getByRole('button', { name: /move up/i });
      expect(buttonMoveUp).toHaveAttribute('aria-label', 'Move up Sample question text');
    });
  });

  describe('Move Up Button', () => {
    it('should call handleDisplayOrderChange with decreased display order when move up button is clicked', async () => {

      render(<QuestionEditCard {...defaultProps} />);

      const moveUpButton = screen.getByLabelText('Move up Sample question text');

      fireEvent.click(moveUpButton);

      // Verify optimistic update was called
      expect(mockHandleDisplayOrderChange).toHaveBeenCalledWith(123, 4);
    });
  });

  describe('Move Down Button', () => {
    it('should call handleDisplayOrderChange with increased display order when move down button is clicked', async () => {

      render(<QuestionEditCard {...defaultProps} />);

      const moveDownButton = screen.getByLabelText('Move down Sample question text');

      fireEvent.click(moveDownButton);

      // Verify optimistic update was called
      expect(mockHandleDisplayOrderChange).toHaveBeenCalledWith(123, 6);
    });
  });
});