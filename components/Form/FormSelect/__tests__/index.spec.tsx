import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormSelect, MyItem } from '@/components/Form/FormSelect';

const sampleItems = [
  { id: '1', name: 'Option 1' },
  { id: '2', name: 'Option 2' },
  { id: '3', name: 'Option 3' },
];

describe('FormSelect', () => {
  it.only('renders the component correctly', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        onChange={jest.fn()}
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    const mySelect = screen.getByTestId('hidden-select-container');

  });

  it('renders the component correctly', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    expect(screen.getByLabelText('Select an option')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens the popover and selects an option', () => {
    const onChange = jest.fn();
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Option 2')).toBeInTheDocument();

    const option2 = screen.getByText('Option 2');
    fireEvent.click(option2);
    expect(onChange).toHaveBeenCalledWith(sampleItems[1]);
  });

  it('displays an error message', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        errorMessage="Please select an option"
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    expect(screen.getByText('Please select an option')).toBeInTheDocument();
    expect(screen.getByTestId('field-wrapper')).toHaveClass('react-aria-FieldError');
  });

  it('renders the helpMessage', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        helpMessage="Choose from the available options"
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    expect(screen.getByText('Choose from the available options')).toBeInTheDocument();
  });
});