import React from 'react';
import type { BooleanQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BooleanQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleBooleanChange = jest.fn();
  const mockParsedQuestion: BooleanQuestionType = {
    type: "boolean",
    meta: {
      schemaVersion: "1.0",
      labelTranslationKey: "questions.use_existing_data"
    },
    attributes: {
      checked: true
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render radio buttons with correct labels and values', () => {
    render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue='no'
        handleRadioChange={mockHandleBooleanChange}
      />
    );

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;

    // Check that the radios exist
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();

    // Check their values
    expect(yesRadio.value).toBe('yes');
    expect(noRadio.value).toBe('no');

    // Check which one is initially selected
    expect(noRadio.checked).toBe(true);
    expect(yesRadio.checked).toBe(false);
  });

  it('should call handleRadioChange when a radio button is clicked', () => {
    render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue='no'
        handleRadioChange={mockHandleBooleanChange}
      />
    );

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    fireEvent.click(yesRadio);
    expect(mockHandleBooleanChange).toHaveBeenCalledWith('yes');
  });

  it('should have no option selected if json says boolean is not checked', () => {
    const mockBooleanQuestion: BooleanQuestionType = {
      type: "boolean",
      meta: {
        schemaVersion: "1.0",
        labelTranslationKey: "questions.use_existing_data"
      },
      attributes: {
        checked: false
      }
    };

    render(
      <BooleanQuestionComponent
        parsedQuestion={mockBooleanQuestion}
        handleRadioChange={mockHandleBooleanChange}
      />
    );

    const noRadio = screen.getByLabelText('No') as HTMLInputElement;
    // no option should be selected by default when no selectedValue is provided
    expect(noRadio.checked).toBe(true);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <BooleanQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedValue='no'
        handleRadioChange={mockHandleBooleanChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});