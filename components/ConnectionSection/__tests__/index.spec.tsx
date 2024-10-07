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
  return function DummyTooltipWithDialog({ children, text, onPressAction }: { children: ReactNode, text: string, onPressAction: () => {} }) {
    return (
      <div data-testid="tooltip-with-dialog" onClick={() => onPressAction()}>
        {text}
        {children}
      </div>
    );
  };
});

jest.mock('../connection-types.json', () => ({
  orcidtest: { tooltipText: 'Test Tooltip', content: 'Test Content' }
}));

describe('ConnectionSection', () => {
  const mockProps = {
    type: 'orcidtest',
    title: 'Test Title',
    content: 'Test Content',
    btnUrl: 'https://example.com',
    btnImageUrl: 'https://example.com/image.png',
    btnText: 'Connect'
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render ButtonWithImage when no auth data is present', () => {
    render(<ConnectionSection {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('button-with-image')).toBeInTheDocument();
  });

  it('should render TooltipWithDialog when auth data is present', () => {
    localStorage.setItem('connectionDataorcidtest', JSON.stringify({ id: 'testId', token: 'testToken' }));
    render(<ConnectionSection {...mockProps} />);
    waitFor(() => {
      expect(screen.getByTestId('tooltip-with-dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Connect')).toBeInTheDocument();
    })
  });

  it('should not render TooltipWithDialog when auth data is not present', () => {
    render(<ConnectionSection {...mockProps} />);
    waitFor(() => {
      expect(screen.getByTestId('tooltip-with-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('button-with-image')).toBeInTheDocument();
    })
  });
});