import React from 'react';
import type { NumberRangeQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import NumberRangeQuestionComponent from '../index';

expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleNumberChange = jest.fn();
  const mockParsedQuestion: NumberRangeQuestionType = {
    type: "numberRange",
    meta: {
      schemaVersion: "1.0",
    },
    columns: {
      start: {
        type: "number",
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          label: "Starting number",
        },
      },
      end: {
        type: "number",
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          label: "Ending number",
        },
      },
    },
  };

  const mockNumberRange = {
    startNumber: 10,
    endNumber: 20,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should render number range with correct labels and values', () => {
    render(
      <NumberRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        numberRange={mockNumberRange}
        handleNumberChange={mockHandleNumberChange}
        startPlaceholder='Enter start value'
        endPlaceholder='Enter end value'
      />
    );

    expect(screen.getByText('Starting number')).toBeInTheDocument();
    expect(screen.getByText('Ending number')).toBeInTheDocument();
    // Should see increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');
    expect(decreaseButton.length).toBe(2);
    expect(increaseButton.length).toBe(2);
    // Should see input fields with correct values
    const startInput = screen.getByPlaceholderText('Enter start value');
    const endInput = screen.getByPlaceholderText('Enter end value');
    expect(startInput).toHaveValue(String(mockNumberRange.startNumber));
    expect(endInput).toHaveValue(String(mockNumberRange.endNumber));
  });

  it('should call handleNumberChange when input values change', async () => {
    render(
      <NumberRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        numberRange={mockNumberRange}
        handleNumberChange={mockHandleNumberChange}
        startPlaceholder='Start'
        endPlaceholder='End'
      />
    );

    const startInput = screen.getByPlaceholderText('Start');
    const endInput = screen.getByPlaceholderText('End');

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '15');
    await userEvent.tab(); // 👈 React Aria Component NumberField requires this to be able to register an input change

    expect(mockHandleNumberChange).toHaveBeenCalledWith('startNumber', 15);

    await userEvent.clear(endInput);
    await userEvent.type(endInput, '25');
    await userEvent.tab();

    expect(mockHandleNumberChange).toHaveBeenCalledWith('endNumber', 25);
  });

  it('should increment and decrement the start input value when user clicks the associated buttons', async () => {
    render(
      <NumberRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        numberRange={mockNumberRange}
        handleNumberChange={mockHandleNumberChange}
        startPlaceholder='Start'
        endPlaceholder='End'
      />
    );

    // Increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');

    const startInputIncreaseButton = increaseButton[0];
    const startInputDecreaseButton = decreaseButton[0];

    act(() => {
      fireEvent.click(startInputIncreaseButton);
    })
    expect(mockHandleNumberChange).toHaveBeenCalledWith('startNumber', 11);

    act(() => {
      fireEvent.click(startInputDecreaseButton);
    })
    expect(mockHandleNumberChange).toHaveBeenCalledWith('startNumber', 9);
  });

  it('should increment and decrement the end input value when user clicks the associated buttons', async () => {
    render(
      <NumberRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        numberRange={mockNumberRange}
        handleNumberChange={mockHandleNumberChange}
        startPlaceholder='Start'
        endPlaceholder='End'
      />
    );

    // Increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');

    const endInputIncreaseButton = increaseButton[1];
    const endInputDecreaseButton = decreaseButton[1];

    act(() => {
      fireEvent.click(endInputIncreaseButton);
    })
    expect(mockHandleNumberChange).toHaveBeenCalledWith('endNumber', 21);

    act(() => {
      fireEvent.click(endInputDecreaseButton);
    })
    expect(mockHandleNumberChange).toHaveBeenCalledWith('endNumber', 19);
  });


  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <NumberRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        numberRange={mockNumberRange}
        handleNumberChange={mockHandleNumberChange}
        startPlaceholder='Start'
        endPlaceholder='End'
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});