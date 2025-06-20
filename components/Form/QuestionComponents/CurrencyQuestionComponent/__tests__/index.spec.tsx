import React from 'react';
import type { CurrencyQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import CurrencyQuestionComponent from '../index';

expect.extend(toHaveNoViolations);


describe('CurrencyQuestionComponent', () => {
  const mockHandleCurrencyChange = jest.fn();
  const mockParsedQuestion: CurrencyQuestionType = {
    type: "currency",
    meta: {
      schemaVersion: "1.0",
      labelTranslationKey: "questions.budget",
      denomination: "USD",
    },
    attributes: {
      max: 1000000,
      min: 0,
      step: 100,
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render currency with correct labels and values', () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={13.00}
        numberLabel='budget'
        setInputCurrencyValue={mockHandleCurrencyChange}
      />
    );
    expect(screen.getByText('budget')).toBeInTheDocument();
    // Increment and decement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');

    expect(decreaseButton.length).toBe(1);
    expect(increaseButton.length).toBe(1);
  });

  it('should correctly increment or decrement the currency field', () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={13.00}
        numberLabel='budget'
        setInputCurrencyValue={mockHandleCurrencyChange}
      />
    );
    // Increment and decement buttons
    const decreaseButton = screen.getByLabelText('Decrease');
    const increaseButton = screen.getByLabelText('Increase');

    act(() => {
      fireEvent.click(increaseButton);
    })
    expect(mockHandleCurrencyChange).toHaveBeenCalledWith(14.00);

    act(() => {
      fireEvent.click(decreaseButton);
    })
    expect(mockHandleCurrencyChange).toHaveBeenCalledWith(12.00);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={13.00}
        numberLabel='budget'
        setInputCurrencyValue={mockHandleCurrencyChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});