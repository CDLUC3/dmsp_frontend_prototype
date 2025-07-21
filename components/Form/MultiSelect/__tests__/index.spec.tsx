import React from 'react';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MultiSelect from '../index';

expect.extend(toHaveNoViolations);

const getOptionByName = (name: string) =>
  screen.getAllByRole('option').find(option =>
    within(option).queryByText((content) => content.trim().endsWith(name))
  );

const options = [
  { id: '1', name: 'Apple', icon: '🍎' },
  { id: '2', name: 'Banana', icon: '🍌' },
  { id: '3', name: 'Cherry' },
];

describe('MultiSelect', () => {
  it('should render label and options', () => {
    render(
      <MultiSelect
        options={options}
      />);
    // Check for correct label
    expect(screen.getByText('Select Items (Multiple)')).toBeInTheDocument();
    options.forEach(opt => {
      expect(screen.getByText((content) => content.includes(opt.name))).toBeInTheDocument();
    });
  });

  it('should show defaultSelected options when selectedKeys are not provided', () => {
    render(
      <MultiSelect
        options={options}
        defaultSelected={['Apple', 'Banana']}
      />
    );

    // Find option by role and text content (ignoring icon)

    const appleOption = getOptionByName('Apple');
    const bananaOption = getOptionByName('Banana');
    const cherryOption = getOptionByName('Cherry');

    expect(appleOption).toHaveAttribute('aria-selected', 'true');
    expect(bananaOption).toHaveAttribute('aria-selected', 'true');
    expect(cherryOption).toHaveAttribute('aria-selected', 'false');
  });

  it('should update selection on click (uncontrolled)', () => {
    render(
      <MultiSelect
        options={options}
      />
    );
    const appleOption = screen.getByRole('option', { name: /Apple/ });
    fireEvent.click(appleOption);
    expect(screen.getByText('(Apple)')).toBeInTheDocument();
    // Select another option
    const bananaOption = screen.getByRole('option', { name: /Banana/ });
    fireEvent.click(bananaOption);
    expect(screen.getByText('(Apple, Banana)')).toBeInTheDocument();
    // Deselect
    fireEvent.click(appleOption);
    expect(screen.getByText('(Banana)')).toBeInTheDocument();
  });

  it('should call onSelectionChange in controlled mode', () => {
    const handleChange = jest.fn();
    const selectedKeys = new Set(['Apple']);
    render(
      <MultiSelect
        options={options}
        selectedKeys={selectedKeys}
        onSelectionChange={handleChange}
      />
    );
    const appleOption = screen.getByRole('option', { name: /Apple/ });
    fireEvent.click(appleOption);
    expect(handleChange).toHaveBeenCalled();
    // Controlled mode: selection count does not update unless prop changes
    expect(screen.getByText('(Apple)')).toBeInTheDocument();
  });

  it('should render custom label', () => {
    render(
      <MultiSelect
        options={options}
        label="Fruits"
      />
    );
    expect(screen.getByLabelText('Fruits')).toBeInTheDocument();
  });

  it('should show checkmark only for selected items', () => {
    render(
      <MultiSelect
        options={options}
        defaultSelected={['Cherry']}
      />
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('(Cherry)')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MultiSelect
        options={options}
        label="Fruits"
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});