import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import QuestionTypeCard from '../index';
import {QuestionFormatInterface} from "@/app/types";

expect.extend(toHaveNoViolations);

describe('QuestionTypeCard', () => {
  const mockQuestionType: QuestionFormatInterface = {
    type: 'radioButtons',
    title: 'Radio Button',
    usageDescription: 'Select one option from the list',
    defaultJSON: {
      type: 'radioButtons',
      attributes: {},
      options: [
        {
          label: 'Option 1',
          value: '1',
          selected: false
        }
      ],
      meta: {
        schemaVersion: '1.0'
      }
    }
  };

  const defaultProps = {
    questionType: mockQuestionType,
    handleSelect: jest.fn(),
    isSelected: false,
    disabled: false,
  };

  it('renders title, description, and icon', () => {
    render(<QuestionTypeCard {...defaultProps} />);
    expect(screen.getByText('Radio Button')).toBeInTheDocument();
    expect(screen.getByText('Select one option from the list')).toBeInTheDocument();
  });

  it('calls handleSelect when clicked', () => {
    render(<QuestionTypeCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.handleSelect).toHaveBeenCalled();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <QuestionTypeCard {...defaultProps} />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
