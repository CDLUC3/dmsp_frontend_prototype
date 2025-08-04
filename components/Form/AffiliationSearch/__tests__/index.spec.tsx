import { render, screen, fireEvent } from '@testing-library/react';
import TypeAheadSearch from '../index';

describe('TypeAheadSearch', () => {
  const mockLabelChange = jest.fn();
  const mockHelpTextChange = jest.fn();

  const defaultProps = {
    typeaheadSearchLabel: 'Initial Label',
    typeaheadHelpText: 'Initial Help',
    handleTypeAheadSearchLabelChange: mockLabelChange,
    handleTypeAheadHelpTextChange: mockHelpTextChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render both FormInput fields with correct labels and placeholders', () => {
    render(<TypeAheadSearch {...defaultProps} />);
    expect(screen.getByLabelText('Search label')).toBeInTheDocument();
    expect(screen.getByLabelText('Help text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter search label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter the help text you want to display')).toBeInTheDocument();
  });

  it('should call handleTypeAheadSearchLabelChange when search label input changes', () => {
    render(<TypeAheadSearch {...defaultProps} />);
    const searchLabelInput = screen.getByLabelText('Search label');
    fireEvent.change(searchLabelInput, { target: { value: 'New Label' } });
    expect(mockLabelChange).toHaveBeenCalledWith('New Label');
  });

  it('should call handleTypeAheadHelpTextChange when help text input changes', () => {
    render(<TypeAheadSearch {...defaultProps} />);
    const helpTextInput = screen.getByLabelText('Help text');
    fireEvent.change(helpTextInput, { target: { value: 'New Help' } });
    expect(mockHelpTextChange).toHaveBeenCalledWith('New Help');
  });

  it('should show the correct values in the input fields', () => {
    render(<TypeAheadSearch {...defaultProps} />);
    expect(screen.getByLabelText('Search label')).toHaveValue('Initial Label');
    expect(screen.getByLabelText('Help text')).toHaveValue('Initial Help');
  });
});