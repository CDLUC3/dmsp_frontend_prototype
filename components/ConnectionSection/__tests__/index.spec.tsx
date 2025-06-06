import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectionSection from '..';

// Mock the external components and modules
jest.mock('../../ButtonWithImage', () => {
  return function DummyButtonWithImage({ buttonText }: { buttonText: string }) {
    return <button data-testid="button-with-image">{buttonText}</button>;
  };
});

jest.mock('../../TooltipWithDialog', () => {
  return function DummyTooltipWithDialog({
    children,
    text,
    onPressAction
  }: {
    children: ReactNode;
    text: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onPressAction: (e: any, close: () => void) => void;
  }) {
    const mockClose = jest.fn();
    return (
      <div
        data-testid="tooltip-with-dialog"
        onClick={(e) => onPressAction(e, mockClose)}
      >
        {text}
        {children}
      </div>
    );
  };
});

jest.mock('../../ModalOverlayComponent', () => ({
  ModalOverlayComponent: function DummyModalOverlay({
    heading,
    content,
    onPressAction
  }: {
    heading: string;
    content: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onPressAction: (e: any, close: () => void) => void;
  }) {
    const mockClose = jest.fn();
    return (
      <div data-testid="modal-overlay">
        <h3>{heading}</h3>
        <p>{content}</p>
        <button
          data-testid="modal-delete-button"
          onClick={(e) => onPressAction(e, mockClose)}
        >
          Delete
        </button>
      </div>
    );
  }
}));

jest.mock('@/components/Icons', () => ({
  DmpIcon: function DummyDmpIcon({ icon }: { icon: string }) {
    return <span data-testid="dmp-icon">{icon}</span>;
  }
}));

jest.mock('../connection-types.json', () => ({
  orcidconnected: {
    tooltipText: 'Test Tooltip Text',
    content: 'Test Modal Content for deletion confirmation'
  }
}));

// Mock console.error to avoid noise in test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('ConnectionSection', () => {
  const mockProps = {
    type: 'orcidconnected',
    title: 'Test Title',
    content: 'Test Content',
    btnUrl: 'https://example.com',
    btnImageUrl: 'https://example.com/image.png',
    btnText: 'Connect'
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should render TooltipWithDialog when type is orcidconnected', () => {
    render(<ConnectionSection {...mockProps} />);

    expect(screen.getByTestId('tooltip-with-dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('0000-0001-2345-6789')).toBeInTheDocument();
  });

  it('should render ButtonWithImage when type is not orcidconnected', () => {
    const nonOrcidProps = { ...mockProps, type: 'other' };
    render(<ConnectionSection {...nonOrcidProps} />);

    expect(screen.queryByTestId('tooltip-with-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('button-with-image')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('should call handleDelete when tooltip is clicked', async () => {
    render(<ConnectionSection {...mockProps} />);

    const tooltip = screen.getByTestId('tooltip-with-dialog');
    fireEvent.click(tooltip);

    // Since handleDelete is async, we should wait for any async operations
    await waitFor(() => {
      // The function should complete without throwing errors
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  it('should render modal overlay with correct content when orcidconnected', () => {
    render(<ConnectionSection {...mockProps} />);

    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Content for deletion confirmation')).toBeInTheDocument();
  });

  it('should call handleDelete when modal delete button is clicked', async () => {
    render(<ConnectionSection {...mockProps} />);

    const deleteButton = screen.getByTestId('modal-delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  it('should load tooltip text and content from connection data', () => {
    render(<ConnectionSection {...mockProps} />);

    // The tooltip text and content should be loaded from the mocked JSON
    expect(screen.getByTestId('tooltip-with-dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Content for deletion confirmation')).toBeInTheDocument();
  });

  it('should handle missing connection data gracefully', () => {
    const propsWithMissingType = { ...mockProps, type: 'nonexistent' };
    render(<ConnectionSection {...propsWithMissingType} />);

    // Should render ButtonWithImage since it's not orcidconnected
    expect(screen.getByTestId('button-with-image')).toBeInTheDocument();
    expect(screen.queryByTestId('tooltip-with-dialog')).not.toBeInTheDocument();
  });

  it('should handle missing connection data gracefully', () => {
    const propsWithMissingType = { ...mockProps, type: 'nonexistent' };
    render(<ConnectionSection {...propsWithMissingType} />);

    // Should render ButtonWithImage since it's not orcidconnected
    expect(screen.getByTestId('button-with-image')).toBeInTheDocument();
    expect(screen.queryByTestId('tooltip-with-dialog')).not.toBeInTheDocument();
  });
});