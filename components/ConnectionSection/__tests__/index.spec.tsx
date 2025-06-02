import React, {ReactNode} from 'react';
import {render, screen, waitFor} from '@testing-library/react';
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
  orcidconnected: { tooltipText: 'Test Tooltip', content: 'Test Content' }
}));

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
  });

  it('should render TooltipWithDialog when type is of orcidconnected', () => {
    localStorage.setItem('connectionDataorcidconnected', JSON.stringify({ id: 'testId', token: 'testToken' }));
    render(<ConnectionSection {...mockProps} />);
    waitFor(() => {
      expect(screen.getByTestId('tooltip-with-dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Connect')).toBeInTheDocument();
    })
  });

  it('should not render TooltipWithDialog it is not the orcidconnected type', () => {
    render(<ConnectionSection {...mockProps} />);
    waitFor(() => {
      expect(screen.getByTestId('tooltip-with-dialog')).not.toBeInTheDocument();
    })
  });
});
