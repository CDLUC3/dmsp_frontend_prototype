import React from 'react';
import type { RadioButtonsQuestionType } from '@dmptool/types';
import { act, fireEvent, render } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import RadioButtonsQuestionComponent from '../index';

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
        handleRadioChange={mockHandleRadioChange}
      />
    );
    expect(getByLabelText('Option 1')).toBeInTheDocument();
    expect(getByLabelText('Option 2')).toBeInTheDocument();
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
      ],
    };
    const { getByLabelText } = render(
      <RadioButtonsQuestionComponent
        parsedQuestion={singleOptionParsedQuestion}
        selectedRadioValue={undefined}
        handleRadioChange={mockHandleRadioChange}
      />
    );
    expect(getByLabelText('option1')).not.toBeChecked();
    fireEvent.click(getByLabelText('option1'));
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