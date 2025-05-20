import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DmpEditor } from '../index';

describe('DmpEditor Component', () => {
  it('renders the editor with initial content', () => {
    const mockSetContent = jest.fn();
    render(
      <DmpEditor
        content="<p>Initial content</p>"
        setContent={mockSetContent}
        id="test-editor"
        labelId="test-label"
        helpText="Help text"
        error="Error message"
      />
    );

    act(() => {
      expect(screen.getByLabelText('test-editor')).toBeInTheDocument();
      expect(screen.getByText('Help text')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('calls setContent when content changes', () => {
    const mockSetContent = jest.fn();
    render(
      <DmpEditor
        content="<p>Initial content</p>"
        setContent={mockSetContent}
      />
    );

    // Simulate content change
    const editorArea = screen.getByLabelText('Editor Tools');
    act(() => {
      fireEvent.input(editorArea, { target: { innerHTML: '<p>Initial content</p>' } });
      expect(mockSetContent).toHaveBeenCalledWith('<p>Initial content</p>');
    });
  });

  it('renders the toolbar and allows toggling bold', () => {
    const mockSetContent = jest.fn();
    render(
      <DmpEditor
        content="<p>Initial content</p>"
        setContent={mockSetContent}
      />
    );

    const boldButton = screen.getByLabelText('Bold');
    expect(boldButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(boldButton);
    });
    // Assuming the bold command updates the content
    expect(mockSetContent).toHaveBeenCalled();
  });
});
