import React from 'react';
import { render, screen } from '@testing-library/react';
import ToastRegion from '../index';
import { useToast } from '@/context/ToastContext';

// Mock the Toast component
jest.mock('@/components/Toast', () => ({ toast, state }: any) => (
  <div data-testid="mock-toast">{toast.content}</div>
));

// Mock the ToastContext
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

// Mock the useToastRegion hook from react-aria
jest.mock('@react-aria/toast', () => ({
  useToastRegion: () => ({
    regionProps: { 'data-testid': 'toast-region' },
  }),
}));

describe('ToastRegion Component', () => {
  const mockState = {
    visibleToasts: [
      { key: '1', content: 'Toast 1', type: 'info' },
      { key: '2', content: 'Toast 2', type: 'error' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockState);
  });

  it('should render the toast region container', () => {
    render(<ToastRegion />);
    const region = screen.getByTestId('toast-region');
    expect(region).toBeInTheDocument();
    expect(region).toHaveClass('toast-region');
  });

  it('should render all visible toasts', () => {
    render(<ToastRegion />);
    const toasts = screen.getAllByTestId('mock-toast');
    expect(toasts).toHaveLength(mockState.visibleToasts.length);
    expect(toasts[0]).toHaveTextContent('Toast 1');
    expect(toasts[1]).toHaveTextContent('Toast 2');
  });
});
