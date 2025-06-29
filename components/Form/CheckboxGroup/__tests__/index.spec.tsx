import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CheckboxGroupComponent from '@/components/Form/CheckboxGroup';
import { CheckboxGroupProps } from '@/app/types';

expect.extend(toHaveNoViolations);

const sampleCheckboxData = [
  { value: 'option1', label: 'Option 1', description: 'Description 1' },
  { value: 'option2', label: 'Option 2', description: 'Description 2' },
];

const defaultProps: CheckboxGroupProps = {
  name: 'test-checkbox',
  checkboxGroupLabel: 'Test Checkbox Group',
  checkboxData: sampleCheckboxData,
  value: ['option1'],
  onChange: jest.fn(),
};

describe('CheckboxGroupComponent', () => {
  it('should render the component correctly', () => {
    render(<CheckboxGroupComponent {...defaultProps} />);

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('should call onChange when a checkbox is selected', () => {
    const onChange = jest.fn();
    render(<CheckboxGroupComponent {...defaultProps} onChange={onChange} />);

    // Find the checkbox input by its value attribute
    const checkbox = screen.getByRole('checkbox', { name: /Option 2/ });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalled();
  });

  it('should render the help text if provided', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        checkboxGroupDescription="Please select your preferences"
      />
    );

    expect(screen.getByText('Please select your preferences')).toBeInTheDocument();
  });

  it('should handle invalid state correctly', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isInvalid={true}
        errorMessage="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isRequired={true}
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should not display "(required)" text when field is not required', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isRequired={false}
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  // New tests for isRequiredVisualOnly functionality
  it('should display "(required)" text and set aria-required when isRequiredVisualOnly is true', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isRequiredVisualOnly={true}
      />
    );

    // Check for "(required)" text in label
    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    // Check that aria-required is set on the checkbox group
    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toHaveAttribute('aria-required', 'true');
  });

  it('should not display "(required)" text or set aria-required when isRequiredVisualOnly is false', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isRequiredVisualOnly={false}
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).not.toHaveAttribute('aria-required');
  });

  it('should display "(required)" text when aria-required attribute is passed', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        aria-required="true"
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toHaveAttribute('aria-required', 'true');
  });

  it('should display "(required)" text when multiple required props are set', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        isRequired={true}
        isRequiredVisualOnly={true}
        aria-required="true"
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toHaveAttribute('aria-required', 'true');
  });

  it('should handle aria-required as boolean true', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
        // @ts-ignore - testing runtime behavior
        aria-required={true}
      />
    );

    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();

    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toHaveAttribute('aria-required', 'true');
  });

  it('should not show required when neither isRequired, isRequiredVisualOnly, nor aria-required are set', () => {
    render(
      <CheckboxGroupComponent
        {...defaultProps}
      />
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).not.toHaveAttribute('aria-required');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <CheckboxGroupComponent
        {...defaultProps}
        checkboxGroupDescription="Please select your preferences"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 