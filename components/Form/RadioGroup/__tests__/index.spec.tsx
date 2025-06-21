import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RadioGroupComponent from '@/components/Form/RadioGroup';
import { RadioButtonProps } from '@/app/types';

expect.extend(toHaveNoViolations);

const sampleRadioData = [
  { value: 'option1', label: 'Option 1', description: 'Description 1' },
  { value: 'option2', label: 'Option 2', description: 'Description 2' },
];

const defaultProps: RadioButtonProps = {
  name: 'test-radio',
  radioGroupLabel: 'Test Radio Group',
  radioButtonData: sampleRadioData,
  value: 'option1',
  onChange: jest.fn(),
};

describe('RadioGroupComponent', () => {
  it('should render the component correctly', () => {
    render(<RadioGroupComponent {...defaultProps} />);

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('should call onChange when a radio option is selected', () => {
    const onChange = jest.fn();
    render(<RadioGroupComponent {...defaultProps} onChange={onChange} />);

    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);

    expect(onChange).toHaveBeenCalledWith('option2');
  });

  it('should render the help text if provided', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        description="Please select your preference"
      />
    );

    expect(screen.getByText('Please select your preference')).toBeInTheDocument();
  });

  it('should handle invalid state correctly', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isInvalid={true}
        errorMessage="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isRequired={true}
      />
    );

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should not display "(required)" text when field is not required', () => {
    render(
      <RadioGroupComponent
        {...defaultProps}
        isRequired={false}
      />
    );

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <RadioGroupComponent
        {...defaultProps}
        description="Please select your preference"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 