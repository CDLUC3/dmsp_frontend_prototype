/**
 * @jest-environment jsdom
 */
import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MetaDataStandardsSelector from '../MetaDataStandards';

expect.extend(toHaveNoViolations);

jest.mock('@/components/Form', () => ({
  FormInput: ({ label }: { label: string }) => <div>{label}</div>,
}));

jest.mock('@/components/Pagination', () => () => <div data-testid="pagination">Pagination</div>);

// ---- Test data ----
const mockField = {
  metaDataConfig: { hasCustomStandards: true },
} as any;

const mockHandleToggle = jest.fn();
const mockOnChange = jest.fn();

describe('MetaDataStandardsSelector', () => {
  it('renders the modal when "Add" button is clicked and closes it via aria-label button', () => {
    render(
      <MetaDataStandardsSelector
        field={mockField}
        handleToggleMetaDataStandards={mockHandleToggle}
        onMetaDataStandardsChange={mockOnChange}
      />
    );

    // Initially, modal is not visible
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Click "Add" button to open modal
    const addButton = screen.getAllByRole('button', { name: /researchOutput.metaDataStandards.buttons.add/i });
    fireEvent.click(addButton[0]);

    // Modal should appear
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Find the close button by its aria-label (translated key)
    const closeButton = screen.getByRole('button', {
      name: 'buttons.closeModal',
    });

    // Click the close button
    fireEvent.click(closeButton);

    // Modal should now be closed
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('shows the "Remove all" button after a user selects a metadata standard', () => {
    render(
      <MetaDataStandardsSelector
        field={mockField}
        handleToggleMetaDataStandards={mockHandleToggle}
        onMetaDataStandardsChange={mockOnChange}
      />
    );

    // Open the modal
    const addButton = screen.getAllByRole('button', {
      name: /researchOutput.metaDataStandards.buttons.add/i,
    })[0];
    fireEvent.click(addButton);

    // There should be a list of standards displayed with "Select" buttons
    const selectButtons = screen.getAllByRole('button', {
      name: 'buttons.select',
    });
    expect(selectButtons.length).toBeGreaterThan(0);

    // Click the first "Select" button to add one
    fireEvent.click(selectButtons[0]);

    // Close the modal using the close button
    const closeButton = screen.getByRole('button', {
      name: 'buttons.closeModal',
    });
    fireEvent.click(closeButton);

    // After closing, the "Remove all" button should now appear
    const removeAllBtn = screen.getByRole('button', {
      name: 'buttons.removeAll',
    });
    expect(removeAllBtn).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MetaDataStandardsSelector
        field={mockField}
        handleToggleMetaDataStandards={mockHandleToggle}
        onMetaDataStandardsChange={mockOnChange}
      />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }); render

  });
});
