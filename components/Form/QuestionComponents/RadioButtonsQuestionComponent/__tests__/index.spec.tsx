import React from 'react';
import type { RadioButtonsQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RadioButtonsQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleRadioChange = jest.fn();
  const mockParsedQuestion: RadioButtonsQuestionType = {
    meta: {
      schemaVersion: "1.0",
    },
    type: "radioButtons",
    options: [
      {
        type: "option",
        attributes: {
          label: "Option 1",
          value: "1",
          selected: false,
        },
      },
      {
        type: "option",
        attributes: {
          label: "Option 2",
          value: "2",
          selected: true,
        },
      },
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render radio buttons with correct labels and values', () => {
    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedRadioValue={undefined}
        name="radio-options"
        radioGroupLabel="My Radio Button Question"
        handleRadioChange={mockHandleRadioChange}
      />
    );
    screen.debug(undefined, Infinity);
    expect(getByLabelText('Option 1')).toBeInTheDocument();
    expect(getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('My Radio Button Question')).toBeInTheDocument();

    // Find the radio input by its accessible name (from aria-label)
    const radio = screen.getByRole('radio', { name: 'Option 2' });

    // Assert the name attribute
    expect(radio).toHaveAttribute('name', 'radio-options');
  });

  it('should select the radio button based on selectedRadioValue prop', () => {
    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedRadioValue={'1'}
        handleRadioChange={mockHandleRadioChange}
      />
    );
    expect(getByLabelText('Option 1')).toBeChecked();
    expect(getByLabelText('Option 2')).not.toBeChecked();
  });

  it('should select the radio button based on selected attribute if selectedRadioValue is undefined', () => {
    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedRadioValue={undefined}
        handleRadioChange={mockHandleRadioChange}
      />
    );
    expect(getByLabelText('Option 2')).toBeChecked();
    expect(getByLabelText('Option 1')).not.toBeChecked();
  });

  it('should call handleRadioChange when a radio button is clicked', () => {
    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedRadioValue={undefined}
        handleRadioChange={mockHandleRadioChange}
      />
    );
    fireEvent.click(getByLabelText('Option 1'));
    expect(mockHandleRadioChange).toHaveBeenCalledWith('1');
  });

  it('should handle single option with no selected attribute', () => {
    const singleOptionParsedQuestion: RadioButtonsQuestionType = {
      meta: {
        schemaVersion: "1.0",
      },
      type: "radioButtons",
      options: [
        {
          type: "option",
          attributes: {
            label: "Option 1",
            value: "option1",
            selected: false,
          },
        },

        {
          type: "option",
          attributes: {
            label: "Option 2",
            value: "option2",
            selected: false,
          },
        },
      ],
    };

    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={singleOptionParsedQuestion}
        selectedRadioValue={undefined}
        handleRadioChange={mockHandleRadioChange}
      />
    );

    expect(getByLabelText('Option 1')).not.toBeChecked();
    expect(getByLabelText('Option 2')).not.toBeChecked();

    fireEvent.click(getByLabelText('Option 1'));
    expect(mockHandleRadioChange).toHaveBeenCalledWith('option1');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedRadioValue={undefined}
        handleRadioChange={mockHandleRadioChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});
