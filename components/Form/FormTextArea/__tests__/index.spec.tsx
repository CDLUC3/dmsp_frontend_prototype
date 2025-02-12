import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  })
});