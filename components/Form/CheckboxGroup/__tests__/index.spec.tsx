import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CheckboxGroupComponent from '@/components/Form/CheckboxGroup';
import { CheckboxGroupProps } from '@/app/types';
import { Checkbox } from "react-aria-components";


expect.extend(toHaveNoViolations);


describe('CheckboxGroupComponent', () => {
  const onChange = jest.fn();

  /**
    * A wrapper to simulate how the component is used, and so that we can
    * simulate some the events and state changes.
    */
  function TestWrapper({testType="basic"}) {
    const [val, setVal] = useState<String>("option1");

    const groupLabel = "Test Checkbox Group";
    const groupDescription = "This is the group help text";

    const children = (
      <>
        <Checkbox value="option1">
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </div>
          Option 1
        </Checkbox>
        <Checkbox value="option2">
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </div>
          Option 2
        </Checkbox>
      </>
    );

    switch (testType) {
      case "basic":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            value={val}
            onChange={onChange}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "with-description":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            checkboxGroupDescription={groupDescription}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "invalid":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            isInvalid={true}
            errorMessage="This field is required"
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "required":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            isRequired={true}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "kinda-required":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            isRequiredVisualOnly={true}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "aria-required":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            ariaRequired={true}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "multi-required":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            isRequired={true}
            isRequiredVisualOnly={true}
            ariaRequired={true}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;

      case "axe":
        return (
          <CheckboxGroupComponent
            name="test-checkbox"
            checkboxGroupLabel={groupLabel}
            checkboxGroupDescription={groupDescription}
            isRequired={true}
            isRequiredVisualOnly={true}
            ariaRequired={true}
          >
            {children}
          </CheckboxGroupComponent>
        )
        break;
    }
  }

  it('should render the component correctly', () => {
    render(<TestWrapper />);

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText('This is the group help text')).not.toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should render the help text if provided', () => {
    render(<TestWrapper testType="with-description" />);
    expect(screen.getByText('This is the group help text')).toBeInTheDocument();
  });

  it('should call onChange when a checkbox is selected', () => {
    render(<TestWrapper />);

    // Find the checkbox input by its value attribute
    const checkbox = screen.getByRole('checkbox', { name: /Option 2/ });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle invalid state correctly', () => {
    render(<TestWrapper testType="invalid" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display "(required)" text when field is required', () => {
    render(<TestWrapper testType="required" />);

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should not display "(required)" text when field is not required', () => {
    render(<TestWrapper />);
    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  // Test isRequiredVisualOnly functionality
  it('should display "(required)" without setting required true when isRequiredVisualOnly is true', () => {
    render(<TestWrapper testType="kinda-required" />);

    // Check for "(required)" text in label
    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    // Check that aria-required is set on the checkbox group
    const checkboxGroup = screen.getByRole('group');
    expect(checkboxGroup).toBeInTheDocument();
    expect(checkboxGroup).not.toHaveAttribute('aria-required', 'true');
  });

  it('should display "(required)" text when aria-required attribute is passed', () => {
    render(<TestWrapper testType="aria-required" />);

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should display "(required)" text when multiple required props are set', () => {
    render(<TestWrapper testType="multi-required" />);

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(<TestWrapper testType="axe" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
