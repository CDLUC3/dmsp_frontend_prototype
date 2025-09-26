import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '@/components/Form/FormInput';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('FormInput', () => {
  it('should render the component correctly', () => {
    render(
      <FormInput
        name="name"
        type="text"
        label="Name"
        placeholder="Enter your name"
        value="John Doe"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('John Doe');
  });

  it('should handle invalid state correctly', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isInvalid={true}
        errorMessage="Please enter a valid email address"
      />
    );

    const fieldWrapper = screen.getByTestId('field-wrapper');
    expect(fieldWrapper).toHaveClass('field-error');
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });


  it('should call the onChange handler when the input value changes', () => {
    const onChange = jest.fn();
    render(
      <FormInput
        name="password"
        type="password"
        label="Password"
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'password123' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should render the help message if provided', () => {
    render(
      <FormInput
        name="phone"
        type="tel"
        label="Phone"
        helpMessage="Please enter your phone number in the format xxx-xxx-xxxx"
      />
    );

    expect(screen.getByText('Please enter your phone number in the format xxx-xxx-xxxx')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <FormInput
        name="phone"
        type="tel"
        label="Phone"
        helpMessage="Please enter your phone number in the format xxx-xxx-xxxx"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isRequired={true}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should not display "(required)" text when field is not required', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isRequired={false}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });

  // New tests for isRequiredVisualOnly functionality
  it('should display "(required)" text and set aria-required when isRequiredVisualOnly is true', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isRequiredVisualOnly={true}
      />
    );

    // Check for "(required)" text in label
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    // Check that aria-required is set on the input
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-required', 'false');
  });

  it('should not display "(required)" text or set aria-required when isRequiredVisualOnly is false', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isRequiredVisualOnly={false}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-required', 'false');
  });

  it('should display "(required)" text when multiple required props are set', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
        isRequired={true}
        isRequiredVisualOnly={true}
        ariaRequired="true"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('should not show required when neither isRequired, isRequiredVisualOnly, nor aria-required are set', () => {
    render(
      <FormInput
        name="email"
        type="email"
        label="Email"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-required', 'false');
  });
});
