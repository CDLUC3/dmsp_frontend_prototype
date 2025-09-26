import React from 'react';
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import { TypeAheadWithOther } from '@/components/Form/TypeAheadWithOther';
import mocksAffiliations from '@/__mocks__/common/mockAffiliations.json';

jest.mock('@/lib/graphql/client/apollo-client');
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn(),
}));

expect.extend(toHaveNoViolations);
const mockSetOtherField = jest.fn();
const mockOnSearch = jest.fn();

describe('TypeAheadWithOther', () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  })

  it('should render initial state correctly', () => {
    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    expect(screen.getByLabelText('Institution')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
    expect(screen.getByText('Search for an institution')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );
    jest.useRealTimers();
    const results = await axe(container);
    jest.useFakeTimers();
    expect(results).toHaveNoViolations();
  })

  it('should fetch and display suggestions', async () => {
    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    act(() => { //make sure all updates related to React are completed
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);// This is to take the debounce into consideration
    })

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
      expect(screen.getByText('Test Institution')).toBeInTheDocument();
    })
  });

  it('should display error message when passed in', async () => {
    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error="Institution field is required"
        updateFormData={() => true}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    act(() => { //make sure all updates related to React are completed
      fireEvent.change(input, { target: { value: '  ' } });
      jest.advanceTimersByTime(1000);// This is to take the debounce into consideration
    })

    await waitFor(() => {
      expect(screen.getByText('Institution field is required')).toBeInTheDocument();
    })
  });

  it('should clear input value and call updateFormData when user clicks input', async () => {
    const mockUpdateFormData = jest.fn();

    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={mockUpdateFormData}
        value="Initial Value" // Start with a value
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    // Verify initial value is set
    expect(input).toHaveValue('Initial Value');

    // Click the input
    fireEvent.click(input);

    // Verify the input is cleared
    expect(input).toHaveValue('');

    // Verify updateFormData was called with empty values
    expect(mockUpdateFormData).toHaveBeenCalledWith('', '');

    // Verify setOtherField was called with false
    expect(mockSetOtherField).toHaveBeenCalledWith(false);
  });


  it('should update input value and call updateFormData when user types', async () => {
    const mockUpdateFormData = jest.fn();

    render(
      <TypeAheadWithOther
        label="Institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        updateFormData={mockUpdateFormData}
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    // Type in the input
    fireEvent.change(input, { target: { value: 'Test University' } });

    // Verify input value is updated
    expect(input).toHaveValue('Test University');

    // Verify updateFormData was called with correct arguments
    expect(mockUpdateFormData).toHaveBeenCalledWith('', 'Test University');
  });

  it('should focus input when alphanumeric key is pressed', async () => {
    const mockUpdateFormData = jest.fn();

    render(
      <TypeAheadWithOther
        label="Institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        updateFormData={mockUpdateFormData}
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    // Type to show suggestions
    fireEvent.change(input, { target: { value: 'Test' } });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    const suggestionsList = screen.getByRole('listbox');

    // Create a spy on the input's focus method
    const focusSpy = jest.spyOn(input, 'focus');

    // Press an alphanumeric key on the suggestions list
    fireEvent.keyDown(suggestionsList, { key: 'a' });

    // Verify input was focused
    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });

  it('should setOtherField(true) when "Other" option is selected', async () => {
    const mockUpdateFormData = jest.fn();

    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={mockUpdateFormData}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
        otherText="Other (organization not listed)"
      />
    );

    const input = screen.getByLabelText('Institution');

    // Type to show suggestions (forces dropdown open)
    fireEvent.change(input, { target: { value: 'x' } });

    await waitFor(() => {
      expect(screen.getByText('Other (organization not listed)')).toBeInTheDocument();
    });

    // Click the "Other" option
    fireEvent.click(screen.getByText('Other (organization not listed)'));

    // Check last call to updateFormData
    const lastCall = mockUpdateFormData.mock.calls.at(-1);
    expect(lastCall).toEqual(['', 'Other (organization not listed)']);

    expect(mockSetOtherField).toHaveBeenCalledWith(true);
    expect(input).toHaveValue('Other (organization not listed)');
  });

  it('should handle keyboard navigation in suggestions list', async () => {

    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        otherText="Other(organization not listed)"
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByLabelText('Institution');

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    // Test arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other(organization not listed)')).toHaveFocus();
    })

    // Test arrow up
    fireEvent.keyDown(screen.getByText('Test University'), { key: 'ArrowUp' });
    expect(input).toHaveFocus();
  });

  it('should correctly handle use of \'Enter\' key for selecting an item from the dropdown', async () => {
    await act(async () => {
      render(
        <TypeAheadWithOther
          label="Institution"
          helpText="Search for an institution"
          setOtherField={mockSetOtherField}
          fieldName="test"
          required={false}
          error=""
          updateFormData={() => true}
          value="input value"
          suggestions={mocksAffiliations}
          onSearch={mockOnSearch}
        />
      );
    });


    const input = screen.getByLabelText('Institution');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test University' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    const listItem = await screen.findByText('Test University'); // Use findBy* to handle async rendering
    listItem.focus();

    expect(listItem).toHaveFocus();
    Object.defineProperty(listItem, 'innerText', { value: 'Test University' });

    await act(async () => {
      fireEvent.keyDown(listItem, { key: 'Enter', code: 'Enter' });
    });

    expect(input).toHaveValue('Test University');
  });

  it('should display "(required)" text when field is required', () => {
    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        error=""
        updateFormData={() => true}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
        required={true}
      />
    );

    expect(screen.getByText('Institution')).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });

  it('should allow for requiredVisualOnly', () => {
    render(
      <TypeAheadWithOther
        label="Institution"
        helpText="Search for an institution"
        setOtherField={mockSetOtherField}
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="input value"
        suggestions={mocksAffiliations}
        onSearch={mockOnSearch}
        requiredVisualOnly={true}
      />
    );

    expect(screen.getByText('Institution')).toBeInTheDocument();
    expect(screen.queryByText(/\(required\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(required\)/)).toHaveClass('is-required');
  });
});
