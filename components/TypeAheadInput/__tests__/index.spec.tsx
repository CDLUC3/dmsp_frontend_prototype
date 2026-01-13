import React from 'react';
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import TypeAheadInput from '..';
import mocksAffiliations from '@/__mocks__/common/mockAffiliations.json';

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn(),
}));

expect.extend(toHaveNoViolations);

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

const mockOnSearch = jest.fn();

describe('TypeAheadInput', () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });


  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  })

  it('should render initial state correctly', () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
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
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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
      expect(screen.getByText('Test University')).toBeInTheDocument();
      expect(screen.getByText('Test Institution')).toBeInTheDocument();
    })
  });

  it('should not display suggestions when there are no matching results', async () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
        suggestions={[]}
        onSearch={mockOnSearch}
      />
    )

    const input = screen.getByLabelText('Institution');

    act(() => { //make sure all updates related to React are completed
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);// This is to take the debounce into consideration
    })

    await waitFor(() => {
      expect(screen.queryByText('Test University')).not.toBeInTheDocument();
    });
  });


  it('should handle keyboard navigation in suggestions list', async () => {

    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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
      expect(screen.getByText('Test University')).toHaveFocus();
    })

    // Test arrow up
    fireEvent.keyDown(screen.getByText('Test University'), { key: 'ArrowUp' });
    expect(input).toHaveFocus();
  });

  it('should correctly handle use of \'Enter\' key for selecting an item from the dropdown', async () => {

    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const listItem = await screen.findByText('Test University');

    expect(listItem).toHaveFocus();
    Object.defineProperty(listItem, 'innerText', { value: 'Test University' });

    listItem.focus();
    fireEvent.keyDown(listItem, { key: 'Enter', code: 'Enter' });

    expect(input).toHaveValue('Test University');
  });

  it('should clear out input value when user clicks into it', async () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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

    fireEvent.click(input);

    expect(input).toHaveValue('');
  });

  it('should reset search when user clicks outside of the input and dropdown', async () => {
    const mockOnSearch = jest.fn();
    const mockUpdateFormData = jest.fn();

    render(
      <div>
        <TypeAheadInput
          label="Institution"
          helpText="Search for an institution"
          fieldName="test"
          required={false}
          error=""
          updateFormData={mockUpdateFormData}
          value="text"
          suggestions={mocksAffiliations}
          onSearch={mockOnSearch}
        />
        <div data-testid="outside-element">Click me</div>
      </div>
    );

    const input = screen.getByLabelText('Institution');

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    // Click outside
    fireEvent.click(screen.getByTestId('outside-element'));

    // Verify dropdown is closed
    await waitFor(() => {
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');

    })
  })

  it('should focus input when typing alphanumeric key while list item is focused', async () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const listItem = await screen.findByText('Test University');

    expect(listItem).toHaveFocus();

    // Type an alphanumeric key while list item is focused
    fireEvent.keyDown(listItem, { key: 'a' });

    // Verify input is focused
    expect(input).toHaveFocus();
  });

  it('should stay focused on last item if ArrowDown button continues to be clicked', async () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const listItem = await screen.findByText('Test University');

    expect(listItem).toHaveFocus();

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const listItem2 = await screen.findByText('Test Institution');

    expect(listItem2).toHaveFocus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const listItem2StillInFocus = await screen.findByText('Test Institution');

    expect(listItem2StillInFocus).toHaveFocus();
  });

  it('should focus on correct item if user clicks ArrowDown twice and then ArrowUp', async () => {
    render(
      <TypeAheadInput
        label="Institution"
        helpText="Search for an institution"
        fieldName="test"
        required={false}
        error=""
        updateFormData={() => true}
        value="text"
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

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    fireEvent.keyDown(input, { key: 'ArrowUp' });

    const listItem = await screen.findByText('Test University');

    expect(listItem).toHaveFocus();
  });
});