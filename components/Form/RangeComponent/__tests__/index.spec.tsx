import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RangeComponent from '../../RangeComponent';

expect.extend(toHaveNoViolations);


describe('RangeComponent', () => {
  it('should render both FormInput fields with correct labels and values', () => {
    render(
      <RangeComponent
        startLabel="Start"
        endLabel="End"
        handleRangeLabelChange={jest.fn()}
      />
    );
    const startInput = screen.getByDisplayValue('Start');
    expect(startInput).toHaveAttribute('id', 'rangeStart');
    const endInput = screen.getByDisplayValue('End');
    expect(endInput).toHaveAttribute('id', 'rangeEnd');

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
    expect(startInput).toHaveValue('Start');
    expect(endInput).toHaveValue('End');
  });

  it('should call handleRangeLabelChange with correct arguments on input change', () => {
    const handleRangeLabelChange = jest.fn();
    render(
      <RangeComponent
        startLabel="Starting Label"
        endLabel="Ending Label"
        handleRangeLabelChange={handleRangeLabelChange}
      />
    );

    const startInput = screen.getByDisplayValue('Starting Label');
    expect(startInput).toHaveAttribute('id', 'rangeStart');
    const endInput = screen.getByDisplayValue('Ending Label');
    expect(endInput).toHaveAttribute('id', 'rangeEnd');

    fireEvent.change(startInput, { target: { value: 'foo' } });
    expect(handleRangeLabelChange).toHaveBeenCalledWith('start', 'foo');
    fireEvent.change(endInput, { target: { value: 'bar' } });
    expect(handleRangeLabelChange).toHaveBeenCalledWith('end', 'bar');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <RangeComponent
        startLabel="Start"
        endLabel="End"
        handleRangeLabelChange={jest.fn()}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});