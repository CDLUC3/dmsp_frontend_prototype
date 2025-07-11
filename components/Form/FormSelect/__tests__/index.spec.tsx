import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormSelect, MyItem } from '@/components/Form/FormSelect';

const sampleItems = [
  { id: '1', name: 'Option 1' },
  { id: '2', name: 'Option 2' },
  { id: '3', name: 'Option 3' },
];

describe('FormSelect', () => {

  it('should render the component correctly', () => {

    const { getByTestId } = render(<FormSelect
      label="Select an option"
      items={sampleItems}
      selectedKey="1"
    >
      {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
    </FormSelect>);
    const container = getByTestId('hidden-select-container');
    const select = container.querySelector('select')!;

    // Find the option with text "Option 1"
    const option = Array.from(select?.options ?? []).find(opt => opt.text === 'Option 1');

    expect(option).toBeTruthy();
    expect(option?.value).toBe('1');

  });

  it('should open the popover and selects an option', async () => {
    const onSelectionChange = jest.fn();

    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        onSelectionChange={onSelectionChange}
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    // Click the button to open the popover
    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Find and click Option 2 in the listbox
    const option2 = screen.getByRole('option', { name: 'Option 2' });
    await userEvent.click(option2);

    // Verify the selection change
    expect(onSelectionChange).toHaveBeenCalledWith('2');
  });

  it('should render the helpMessage', () => {
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

    const helpText = screen.getAllByText('Choose from the available options');
    expect(helpText).toHaveLength(2);
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        isRequired={true}
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should not display "(required)" text when field is not required', () => {
    render(
      <FormSelect
        label="Select an option"
        items={sampleItems}
        selectedKey="1"
        isRequired={false}
      >
        {(item) => <MyItem key={item.id}>{item.name}</MyItem>}
      </FormSelect>
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
  });
});