import React from 'react';
import { render, screen } from '@testing-library/react';
import Toast from '../index';
import { useToast } from '@/context/ToastContext';

// Mock the context
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn()
}));

// Mock the useToast hook from react-aria
jest.mock('@react-aria/toast', () => ({
  useToast: () => ({
    toastProps: { 'data-testid': 'toast' },
    contentProps: { 'data-testid': 'toast-content' },
    titleProps: { 'data-testid': 'toast-title' },
    closeButtonProps: {
      'data-testid': 'toast-close-button',
      onPress: jest.fn()
    }
  })
}));

describe('Toast', () => {
  // Create a mock state object that mimics what would come from your context
  const mockToastState = {
    remove: jest.fn(),
    visibleToasts: [],
    add: jest.fn(),
    close: jest.fn(),
    pauseAll: jest.fn(),
    resumeAll: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders with the correct content', () => {
    const toast = {
      key: '1',
      content: 'Test toast message',
      type: 'info' as const
    };

    render(<Toast toast={toast} state={mockToastState} />);

    // Check if content is rendered
    expect(screen.getByText('Test toast message')).toBeInTheDocument();

    // Check if correct class is applied
    expect(screen.getByTestId('toast')).toHaveClass('toast toast-info');
  });

  it('applies the correct class based on type', () => {
    const toast = {
      key: '1',
      content: 'Error message',
      type: 'error' as const
    };

    render(<Toast toast={toast} state={mockToastState} />);

    // Check if correct class is applied
    expect(screen.getByTestId('toast')).toHaveClass('toast toast-error');
  });

  it('uses default type "info" if not specified', () => {
    const toast = {
      key: '1',
      content: 'Default toast'
    };

    render(<Toast toast={toast} state={mockToastState} />);

    // Check if default class is applied
    expect(screen.getByTestId('toast')).toHaveClass('toast toast-info');
  });

  it('renders close button with proper accessibility attribute', () => {
    const toast = {
      key: '1',
      content: 'Test toast',
      type: 'success' as const
    };

    render(<Toast toast={toast} state={mockToastState} />);

    // Check if close button exists
    const closeButton = screen.getByTestId('toast-close-button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close toast');
  });
});