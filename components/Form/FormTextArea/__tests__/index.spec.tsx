import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FormTextArea from '@/components/Form/FormTextArea';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('FormTextArea', () => {
  it('should render the component correctly', () => {
    render(
      <FormTextArea
        name="name"
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
      <FormTextArea
        name="email"
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
      <FormTextArea
        name="password"
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
      <FormTextArea
        name="phone"
        label="Phone"
        helpMessage="Please enter your phone number in the format xxx-xxx-xxxx"
      />
    );

    expect(screen.getByText('Please enter your phone number in the format xxx-xxx-xxxx')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <FormTextArea
        name="phone"
        label="Phone"
        helpMessage="Please enter your phone number in the format xxx-xxx-xxxx"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <FormTextArea
        name="email"
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
      <FormTextArea
        name="email"
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
      <FormTextArea
        name="email"
        label="Email"
        isRequiredVisualOnly={true}
      />
    );

    // Check for "(required)" text in label
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    // Check that aria-required is set on the textarea
    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('should not display "(required)" text or set aria-required when isRequiredVisualOnly is false', () => {
    render(
      <FormTextArea
        name="email"
        label="Email"
        isRequiredVisualOnly={false}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).not.toHaveAttribute('aria-required');
  });

  it('should display "(required)" text when aria-required attribute is passed', () => {
    render(
      <FormTextArea
        name="email"
        label="Email"
        aria-required="true"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('should display "(required)" text when multiple required props are set', () => {
    render(
      <FormTextArea
        name="email"
        label="Email"
        isRequired={true}
        isRequiredVisualOnly={true}
        aria-required="true"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');

    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('should handle aria-required as boolean true', () => {
    render(
      <FormTextArea
        name="email"
        label="Email"
        // @ts-ignore - testing runtime behavior
        aria-required={true}
      />
    );

    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('should not show required when neither isRequired, isRequiredVisualOnly, nor aria-required are set', () => {
    render(
      <FormTextArea
        name="email"
        label="Email"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: 'Email' });
    expect(textarea).not.toHaveAttribute('aria-required');
  });
});
