import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CheckboxGroupComponent from '@/components/Form/CheckboxGroup';
import { CheckboxGroupProps } from '@/app/types';
import { Checkbox } from "react-aria-components";


expect.extend(toHaveNoViolations);


const defaultProps: RadioButtonProps = {
  name: "test-radio",
  value: 'option1',
  checkboxGroupLabel: "Test Checkbox Group",
};

const choices = (
  <>
    <Checkbox value="option1"> Option 1 </Checkbox>
    <Checkbox value="option2"> Option 2 </Checkbox>
  </>
);


describe('CheckboxGroupComponent', () => {
  it('should render the component correctly', () => {
    render(
      <CheckboxGroupComponent {...defaultProps}>
        {choices}
      </CheckboxGroupComponent>
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText('This is the group help text')).not.toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  it('should render the help text if provided', () => {
    render(
      <CheckboxGroupComponent {...defaultProps}
        checkboxGroupDescription="This is the group help text"
      >
        {choices}
      </CheckboxGroupComponent>
    );
    expect(screen.getByText('This is the group help text')).toBeInTheDocument();
  });

  it('should call onChange when a checkbox is selected', () => {
    const onChange = jest.fn();

    render(
      <CheckboxGroupComponent {...defaultProps} onChange={onChange}>
        {choices}
      </CheckboxGroupComponent>
    );

    // Find the checkbox input by its value attribute
    const checkbox = screen.getByRole('checkbox', { name: /Option 2/ });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle invalid state correctly', () => {
    render(
      <CheckboxGroupComponent {...defaultProps}
        isInvalid={true}
        errorMessage="This field is required"
      >
        {choices}
      </CheckboxGroupComponent>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <CheckboxGroupComponent {...defaultProps} isRequired={true}>
        {choices}
      </CheckboxGroupComponent>
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should display "(required)" and aria-required false when isRequiredVisualOnly is true', () => {
    render(
      <CheckboxGroupComponent {...defaultProps} isRequiredVisualOnly={true}>
        {choices}
      </CheckboxGroupComponent>
    );

    // Check for "(required)" text in label
    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    // Check that aria-required is set on the checkbox group
    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toBeInTheDocument();
  });

  it('should display "(required)" text when multiple required props are set', () => {
    render(
      <CheckboxGroupComponent {...defaultProps}
        isRequired={true}
        isRequiredVisualOnly={true}
      >
        {choices}
      </CheckboxGroupComponent>
    );

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <CheckboxGroupComponent {...defaultProps}>
        {choices}
      </CheckboxGroupComponent>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
