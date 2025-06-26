import React from 'react';
import type { SelectBoxQuestionType } from '@dmptool/types';
import { act, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MultiSelectQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);

describe('MultiSelectQuestionComponent', () => {
  const mockSelectChange = jest.fn();
  const mockSelectBoxQuestion: SelectBoxQuestionType = {
    type: 'selectBox',
    meta: {
      schemaVersion: '1.0',
    },
    options: [
      {
        type: 'option',
        attributes: {
          label: 'Option A',
          value: 'Option A',
          selected: true,
        },
      },
      {
        type: 'option',
        attributes: {
          label: 'Option B',
          value: 'Option B',
          selected: true,
        },
      },
      {
        type: 'option',
        attributes: {
          label: 'Option C',
          value: 'Option C',
          selected: false
        },
      },
    ],
    attributes: {
      multiple: true,
    },
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render multi select with correct labels and values', async () => {
    render(
      <MultiSelectQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        multiSelectTouched={false}
        selectedMultiSelectValues={new Set(['Option A'])}
        handleMultiSelectChange={mockSelectChange}
        selectBoxLabel='Select all that apply'
      />
    );

    expect(screen.getByText('Select all that apply')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();

    // Get all options
    const options = screen.getAllByRole('option');

    // Check selected state by aria-selected
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('should fall back to selectedMultiSelectValues when multiSelectTouched is true', async () => {
    render(
      <MultiSelectQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        multiSelectTouched={true}
        selectedMultiSelectValues={new Set(['Option B'])}
        handleMultiSelectChange={mockSelectChange}
        selectBoxLabel='Select all that apply'
      />
    );

    expect(screen.getByText('Select all that apply')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();

    // Find the checkbox for Option B by label text
    const optionB = screen.getByRole('option', { name: /Option B/i });
    expect(optionB).toHaveAttribute('aria-selected', 'true');
  });

  it('should pass axe accessibility test', async () => {
    const selectedMultiSelectValues = new Set(['Option A', 'Option B']);

    const { container } = render(
      <MultiSelectQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        handleMultiSelectChange={mockSelectChange}
        selectedMultiSelectValues={selectedMultiSelectValues}
        selectBoxLabel='Select all that apply'
        multiSelectTouched={false}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});