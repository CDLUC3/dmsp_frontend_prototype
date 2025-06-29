import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NumberComponent from '../index';

expect.extend(toHaveNoViolations);

describe('NumberComponent', () => {
  it('should render label and input with initial value', () => {
    render(
      <NumberComponent
        label="Quantity"
        value={5}
      />
    );
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('5');
  });

  it('should call onChange with incremented value when + button is clicked', () => {
    const handleChange = jest.fn();
    render(
      <NumberComponent
        label="Qty"
        value={2}
        onChange={handleChange}
      />
    );
    const incrementButton = screen.getByRole('button', { name: /increase/i });
    fireEvent.click(incrementButton);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('should call onChange with decremented value when - button is clicked', () => {
    const handleChange = jest.fn();
    render(
      <NumberComponent
        label="Qty"
        value={2}
        onChange={handleChange}
      />
    );
    const decrementButton = screen.getByRole('button', { name: /decrease/i });
    fireEvent.click(decrementButton);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('should render placeholder in input', () => {
    render(
      <NumberComponent
        label="Qty"
        placeholder="Enter number"
      />
    );
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('should disable input and buttons when disabled prop is true', () => {
    render(
      <NumberComponent
        label="Qty"
        disabled={true}
      />
    );
    // Confirm input is disabled
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    // Confirmed decrement and increment buttons are disabled
    const decrementButton = screen.getByRole('button', { name: /decrease/i });
    expect(decrementButton).toBeDisabled();
    const incrementButton = screen.getByRole('button', { name: /increase/i });
    expect(incrementButton).toBeDisabled();
  });

  it('should not decrement below minValue', () => {
    const handleChange = jest.fn();
    render(
      <NumberComponent
        label="Qty"
        value={1}
        minValue={1}
        onChange={handleChange}
      />
    );
    const decrementButton = screen.getByRole('button', { name: /decrease/i });
    fireEvent.click(decrementButton);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should not increment above maxValue', () => {
    const handleChange = jest.fn();
    render(
      <NumberComponent
        label="Qty"
        value={10}
        maxValue={10}
        onChange={handleChange}
      />
    );
    const incrementButton = screen.getByRole('button', { name: /increase/i });
    fireEvent.click(incrementButton);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should use step prop when incrementing and decrementing', () => {
    const handleChange = jest.fn();
    render(
      <NumberComponent
        label="Qty"
        value={2}
        step={2}
        onChange={handleChange}
      />
    );
    const incrementButton = screen.getByRole('button', { name: /increase/i });
    const decrementButton = screen.getByRole('button', { name: /decrease/i });
    fireEvent.click(incrementButton);
    expect(handleChange).toHaveBeenCalledWith(4);
    fireEvent.click(decrementButton);
    expect(handleChange).toHaveBeenCalledWith(0);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <NumberComponent
        label="Qty"
        value={2}
        onChange={jest.fn()}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});