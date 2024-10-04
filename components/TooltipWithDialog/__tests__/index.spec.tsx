import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TooltipWithDialog from '..';
import { PressEvent } from "react-aria-components";

const handleDelete = async (e: PressEvent, close: any) => {
  try {
    console.log('Deleted');
    close();
  } catch (error) {
    console.error("An error occurred while deleting the item:", error);
  }
};

describe('TooltipWithDialog', () => {
  const defaultProps = {
    text: 'orcid id',
    tooltipText: 'Delete this item',
    dialogHeading: 'Confirm Deletion',
    dialogContent: 'Are you sure you want to delete this item?',
    onPressAction: handleDelete
  };

  it('should render button with tooltip', async () => {
    render(<TooltipWithDialog {...defaultProps} />);


    const button = screen.getByRole('button', { name: 'Delete Item' });
    expect(button).toBeInTheDocument();

    //Trigger hover event
    fireEvent.mouseEnter(button);

    waitFor(() => {
      const tooltip = screen.queryByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Delete this item");
    })
  });

  it('should open dialog on button click', async () => {
    render(<TooltipWithDialog {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Delete Item' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });
  });

  it('should close dialog', async () => {
    const mockOnPressAction = jest.fn((e, close) => close()); // Mock function for onPressAction

    render(<TooltipWithDialog
      text="Delete"
      tooltipText="Delete this item"
      dialogHeading="Confirm Deletion"
      dialogContent="Are you sure you want to delete this item?"
      onPressAction={mockOnPressAction}
    />)

    const button = screen.getByRole('button', { name: 'Delete Item' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton[0]);

    expect(mockOnPressAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should close dialog on cancel', async () => {
    render(<TooltipWithDialog {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Delete Item' });
    fireEvent.click(button);

    const cancelButton = await screen.findByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('should render custom icon when provided', () => {
    const customIcon = <span data-testid="custom-icon">🗑️</span>;
    render(<TooltipWithDialog {...defaultProps} icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render custom dialog content when children are provided', async () => {
    const customContent = <div data-testid="custom-content">Custom Dialog Content</div>;
    render(
      <TooltipWithDialog {...defaultProps}>
        {customContent}
      </TooltipWithDialog>
    );

    const button = screen.getByRole('button', { name: 'Delete Item' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});