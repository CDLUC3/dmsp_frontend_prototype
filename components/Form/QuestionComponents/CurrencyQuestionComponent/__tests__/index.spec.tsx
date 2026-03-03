import React from 'react';
import type { CurrencyQuestionType } from '@dmptool/types';
import { act, render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CurrencyQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);


describe('Currency Question Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  const mockHandleCurrencyChange = jest.fn();
  const mockParsedQuestion: CurrencyQuestionType = {
    type: "currency",
    meta: {
      schemaVersion: "1.0",
    },
    attributes: {
      min: 0,
      max: 10000,
      step: 0.01,
      denomination: "USD",
      labelTranslationKey: "questions.cost_estimate",
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render currency field with correct labels and increase/decrease buttons', () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={12.00}
        currencyLabel="Currency Amount"
        placeholder='Enter amount'
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );
    // Should see the label
    expect(screen.getByText('Currency Amount')).toBeInTheDocument();

    // Should see increment and decrement buttons
    const decreaseButton = screen.getAllByLabelText('Decrease');
    const increaseButton = screen.getAllByLabelText('Increase');
    expect(decreaseButton.length).toBe(1);
    expect(increaseButton.length).toBe(1);

    // Should see input fields with correct values
    const currencyInput = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
    expect(currencyInput.value).toBe('$12.00');
  });

  it('should fallback to default empty string for label and placeholder when none provided', () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={12.00}
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );

    // Assert no label is rendered
    const label = document.querySelector('label.react-aria-Label');
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe('');

    // Find the input (by role or class or placeholder)
    const input = screen.getByRole('textbox');
    // Assert placeholder is empty or not present
    expect(input).toHaveAttribute('placeholder', '');
  });

  it('should fallback to \'USD\' if no denomination is present in parsedQuestion', () => {
    const mockCurrencyQuestion: CurrencyQuestionType = {
      type: "currency",
      meta: {
        schemaVersion: "1.0",
      },
      attributes: {
        min: 0,
        max: 10000,
        step: 0.01,
        denomination: '',
        labelTranslationKey: "questions.cost_estimate",
      }
    };
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockCurrencyQuestion}
        inputCurrencyValue={12.00}
        placeholder={'Enter amount'}
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );

    // Should see correct currency symbol
    const currencyInput = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
    expect(currencyInput.value).toBe('$12.00');
  });

  it('should call setCurrencyInputValue when input values change', async () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={12.00}
        currencyLabel="Currency Amount"
        placeholder='Enter amount'
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );

    const currencyInput = screen.getByPlaceholderText('Enter amount') as HTMLInputElement

    await userEvent.clear(currencyInput);
    await userEvent.type(currencyInput, '15.00');
    await userEvent.tab(); // 👈 React Aria Component NumberField requires this to be able to register an input change

    expect(mockHandleCurrencyChange).toHaveBeenCalledWith(15.00);
  });

  it('should increment and decrement the currency input value when user clicks the associated buttons', async () => {
    render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={12.00}
        currencyLabel="Currency Amount"
        placeholder='Enter amount'
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );

    // Increment and decrement buttons
    const decreaseButton = screen.getByLabelText('Decrease');
    const increaseButton = screen.getByLabelText('Increase');

    const currencyInputIncreaseButton = increaseButton;
    const currencyInputDecreaseButton = decreaseButton;
    await user.click(currencyInputIncreaseButton);

    expect(mockHandleCurrencyChange).toHaveBeenCalledWith(13.00);
    await user.click(currencyInputDecreaseButton);

    expect(mockHandleCurrencyChange).toHaveBeenCalledWith(11.00);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <CurrencyQuestionComponent
        parsedQuestion={mockParsedQuestion}
        inputCurrencyValue={12.00}
        currencyLabel="Currency Amount"
        placeholder='Enter amount'
        handleCurrencyChange={mockHandleCurrencyChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});