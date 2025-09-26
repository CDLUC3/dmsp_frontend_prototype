import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RadioGroupComponent from '@/components/Form/RadioGroup';
import { RadioGroupProps } from '@/app/types';
import { Radio } from "react-aria-components";

expect.extend(toHaveNoViolations);

const defaultProps: RadioGroupProps = {
  name: "test-radio",
  value: 'option1',
  radioGroupLabel: "Test Radio Group",
};

const options = (
  <>
    <Radio value="option1"> Option 1 </Radio>
    <Radio value="option2"> Option 2 </Radio>
  </>
);

describe('RadioGroupComponent', () => {
  it('should render the component correctly', () => {
    render(
      <RadioGroupComponent {...defaultProps}>
        {options}
      </RadioGroupComponent>
    );

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  it('should call onChange when a radio option is selected', () => {
    const onChange = jest.fn();

    render(
      <RadioGroupComponent {...defaultProps} onChange={onChange}>
        {options}
      </RadioGroupComponent>
    );

    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);
    expect(onChange).toHaveBeenCalledWith('option2');
  });

  it('should render the help text if provided', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        description="Please select your preference"
      >
        {options}
      </RadioGroupComponent>
    );

    expect(screen.getByText('Please select your preference')).toBeInTheDocument();
  });

  it('should handle invalid state correctly', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isInvalid={true}
        errorMessage="This field is required"
      >
        {options}
      </RadioGroupComponent>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isRequired={true}
      >
        {options}
      </RadioGroupComponent>
    );

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should isRequiredVisualOnly option', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isRequiredVisualOnly={true}
      >
        {options}
      </RadioGroupComponent>
    );

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <RadioGroupComponent
        {...defaultProps}
        description="Please select your preference"
      >
        {options}
      </RadioGroupComponent>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
