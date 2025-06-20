import React from 'react';
import type { BooleanQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import BooleanQuestionComponent from '../index';

expect.extend(toHaveNoViolations);


describe('CurrencyQuestionComponent', () => {
  const mockHandleBooleanChange = jest.fn();
  const mockParsedQuestion: BooleanQuestionType = {
    meta: {
      schemaVersion: "1.0"
    },
    type: "boolean",
    attributes: {
      checked: false
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should check the correct radio button based on selectedValue', () => {
    render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue="no"
        handleRadioChange={mockHandleBooleanChange}
      />
    );
    expect(screen.getByLabelText('no')).toBeChecked();
    expect(screen.getByLabelText('yes')).not.toBeChecked();
  });

  it('should check the correct radio button based on parsedQuestion.attributes.checked if selectedValue is not provided', () => {
    render(
      <BooleanQuestionComponent
        parsedQuestion={{
          ...mockParsedQuestion,
          attributes: { checked: true }
        }}
        handleRadioChange={mockHandleBooleanChange}
      />
    );
    expect(screen.getByLabelText('yes')).toBeChecked();
    expect(screen.getByLabelText('no')).not.toBeChecked();
  });

  it('should call handleRadioChange with correct value when a checkbox is clicked', async () => {
    render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue="no"
        handleRadioChange={mockHandleBooleanChange}
      />
    );
    act(() => {
      fireEvent.click(screen.getByLabelText('yes'));
    })
    expect(mockHandleBooleanChange).toHaveBeenCalledWith('yes');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue="no"
        handleRadioChange={mockHandleBooleanChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});