import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnConfirm = jest.fn();
  const mockTitle = 'Confirm Action';
  const mockEmail = 'test@example.com';

  it('renders the modal trigger button', () => {
    render(
      <ConfirmModal
        title={mockTitle}
        email={mockEmail}
        isOpenProp={true}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('buttons.remove')).toBeInTheDocument();
  });

  it('opens the modal when the trigger button is clicked', () => {
    render(
      <ConfirmModal
        title={mockTitle}
        email={mockEmail}
        isOpenProp={true}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('buttons.remove'));
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText('paragraphs.modalPara1')).toBeInTheDocument();
  });

  it('closes the modal when the cancel button is clicked', () => {
    render(
      <ConfirmModal
        title={mockTitle}
        email={mockEmail}
        isOpenProp={true}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('buttons.remove'));
    fireEvent.click(screen.getByText('buttons.cancel'));
    expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
  });

  it('calls onConfirm with the correct email and closes the modal when confirm button is clicked', () => {
    render(
      <ConfirmModal
        title={mockTitle}
        email={mockEmail}
        isOpenProp={true}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('buttons.remove'));
    fireEvent.click(screen.getByText('buttons.confirm'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(mockEmail);
    expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
  });

  it.only('should render the modal open when isOpenProp is true', () => {
    render(
      <ConfirmModal
        title={mockTitle}
        email={mockEmail}
        isOpenProp={true}
        onConfirm={mockOnConfirm}
      />
    );

    // Modal should be open immediately, without clicking the trigger
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText('paragraphs.modalPara1')).toBeInTheDocument();
  });
});
