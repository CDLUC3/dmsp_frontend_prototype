import React from 'react';
import type { SelectBoxQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen, within } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import SelectboxQuestionComponent from '../index';

expect.extend(toHaveNoViolations);

describe('SelectboxQuestionComponent', () => {
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
        },
      },
      {
        type: 'option',
        attributes: {
          label: 'Option C',
          value: 'Option C',
        },
      },
    ],
    attributes: {
      multiple: false,
    },
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render radio buttons with correct labels and values', async () => {
    render(
      <SelectboxQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        selectedSelectValue='Option A'
        setSelectedSelectValue={mockSelectChange}
      />
    );

    const selectButton = screen.getByTestId('select-button');
    expect(within(selectButton).getByText('Option A')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Option B' })).not.toBeInTheDocument();
    act(() => {
      fireEvent.click(selectButton);
    })
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option C' })).toBeInTheDocument();
  });

  it('should call setSelectedSelectValue with correct option when user makes a different selection', async () => {
    render(
      <SelectboxQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        selectedSelectValue='Option A'
        setSelectedSelectValue={mockSelectChange}
      />
    );

    const selectButton = screen.getByTestId('select-button');
    expect(within(selectButton).getByText('Option A')).toBeInTheDocument();
    // expect(screen.queryByText('Option B')).not.toBeInTheDocument();
    act(() => {
      fireEvent.click(selectButton);
    })
    const optionB = screen.getByRole('option', { name: 'Option B' });
    act(() => {
      fireEvent.click(optionB);
    })
    expect(mockSelectChange).toHaveBeenCalledWith('Option B');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <SelectboxQuestionComponent
        parsedQuestion={mockSelectBoxQuestion}
        selectedSelectValue='a'
        setSelectedSelectValue={mockSelectChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});