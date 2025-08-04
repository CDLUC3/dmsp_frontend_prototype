import React from 'react';
import type { MultiselectBoxQuestionType } from '@dmptool/types';
import { act, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MultiSelectQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);

describe('MultiSelectQuestionComponent', () => {
  const mockMultiSelectChange = jest.fn();
  const mockMultiSelectBoxQuestion: MultiselectBoxQuestionType = {
    type: 'multiselectBox',
    meta: {
      schemaVersion: '1.0',
    },
    options: [
      {
        label: 'Option A',
        value: 'Option A',
        selected: true,
      },
      {
        label: 'Option B',
        value: 'Option B',
        selected: true,
      },
      {
        label: 'Option C',
        value: 'Option C',
        selected: false
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
        parsedQuestion={mockMultiSelectBoxQuestion}
        selectedMultiSelectValues={new Set(['Option A'])}
        handleMultiSelectChange={mockMultiSelectChange}
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
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('should pass axe accessibility test', async () => {
    const selectedMultiSelectValues = new Set(['Option A', 'Option B']);

    const { container } = render(
      <MultiSelectQuestionComponent
        parsedQuestion={mockMultiSelectBoxQuestion}
        handleMultiSelectChange={mockMultiSelectChange}
        selectedMultiSelectValues={selectedMultiSelectValues}
        selectBoxLabel='Select all that apply'
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});