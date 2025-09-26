import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormSelect } from '@/components/Form/FormSelect';


describe('FormSelect', () => {
  const onSelectionChange = jest.fn();
  const defaultProps = {
    label: "Select an option",
    items: [
      { id: '1', name: 'Option 1' },
      { id: '2', name: 'Option 2' },
      { id: '3', name: 'Option 3' },
    ],
    selectedKey: "1",
  };

  it('should render the component correctly', () => {
    const { getByTestId } = render(<FormSelect {...defaultProps} />);
    const container = getByTestId('hidden-select-container');
    const select = container.querySelector('select')!;

    // Find the option with text "Option 1"
    const option = Array.from(select?.options ?? []).find(opt => opt.text === 'Option 1');

    expect(option).toBeTruthy();
    expect(option?.value).toBe('1');
  });

  it('should open the popover and selects an option', async () => {
    render(
      <FormSelect {...defaultProps} onChange={onSelectionChange} />
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
        {...defaultProps}
        helpMessage="Choose from the available options"
      />
    );
    const helpText = screen.getAllByText('Choose from the available options');
    expect(helpText).toHaveLength(2);
  });

  it('should display "(required)" text when field is required', () => {
    render(<FormSelect {...defaultProps} isRequired={true} />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should allow for requiredVisualOnly', () => {
    render(<FormSelect {...defaultProps} isRequiredVisualOnly={true} />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).toBeInTheDocument();
  });
});
