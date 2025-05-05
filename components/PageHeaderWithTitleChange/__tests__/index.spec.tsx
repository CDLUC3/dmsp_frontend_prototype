import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PageHeaderWithTitleChange from '../index';

expect.extend(toHaveNoViolations);

describe('PageHeaderWithTitleChange', () => {

  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
  });
  const mockHandleTitleChange = jest.fn();
  const mockHandleInputChange = jest.fn();

  const defaultProps = {
    title: 'Test Title',
    description: 'This is a test description.',
    showBackButton: true,
    breadcrumbs: <div>Mock Breadcrumbs</div>,
    actions: <button>Mock Action</button>,
    className: 'test-class',
    handleTitleChange: mockHandleTitleChange,
    handleInputChange: mockHandleInputChange,
    newTitle: 'New Test Title',
  };

  it('should render the component with default props', () => {
    render(<PageHeaderWithTitleChange {...defaultProps} />);

    // Check if the title is rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Check if the description is rendered
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();

    // Check if the breadcrumbs are rendered
    expect(screen.getByText('Mock Breadcrumbs')).toBeInTheDocument();

    // Check if the actions are rendered
    expect(screen.getByText('Mock Action')).toBeInTheDocument();
  });

  it('should allow editing of the title', () => {
    render(<PageHeaderWithTitleChange {...defaultProps} />);

    // Click the "Edit template name" button
    fireEvent.click(screen.getByText('Edit template name'));

    // Check if the input field is rendered
    const input = screen.getByPlaceholderText('Enter new template title');
    expect(input).toBeInTheDocument();

    // Simulate typing in the input field
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    expect(mockHandleInputChange).toHaveBeenCalled();
  });

  it('should call handleTitleChange on form submission', () => {
    render(<PageHeaderWithTitleChange {...defaultProps} />);

    // Click the "Edit template name" button
    fireEvent.click(screen.getByText('Edit template name'));

    // Submit the form
    const saveButton = screen.getByText('buttons.save');
    fireEvent.click(saveButton);

    // Check if handleTitleChange was called
    expect(mockHandleTitleChange).toHaveBeenCalled();
  });

  it('should cancel editing when the cancel button is clicked', () => {
    render(<PageHeaderWithTitleChange {...defaultProps} />);

    // Click the "Edit template name" button
    fireEvent.click(screen.getByText('Edit template name'));

    // Click the cancel button
    const cancelButton = screen.getByText('buttons.cancel');
    fireEvent.click(cancelButton);

    // Check if the input field is no longer rendered
    expect(screen.queryByPlaceholderText('Enter new template title')).not.toBeInTheDocument();
  });

  it('should render without crashing', () => {
    render(<PageHeaderWithTitleChange title="Test Title" />);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <PageHeaderWithTitleChange {...defaultProps} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  })
});
