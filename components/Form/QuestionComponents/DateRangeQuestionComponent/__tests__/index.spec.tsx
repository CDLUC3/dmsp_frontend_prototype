import React from 'react';
import type { DateRangeQuestionType } from '@dmptool/types';
import { act, render, screen, waitFor } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CalendarDate } from '@internationalized/date';

import { DateRangeQuestionComponent } from '@/components/Form/QuestionComponents';

expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleDateChange = jest.fn();
  const mockParsedQuestion: DateRangeQuestionType = {
    type: "dateRange",
    meta: {
      schemaVersion: "1.0",
    },
    attributes: {},
    columns: {
      start: {
        label: "Starting number",
        step: 1
      },
      end: {
        label: "Ending number",
        step: 1
      },
    },
  };

  const mockDateRange = {
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should render date range with correct labels and values', async () => {
    render(
      <DateRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        dateRange={mockDateRange}
        handleDateChange={mockHandleDateChange}
      />
    );

    await waitFor(async () => {
      const startLabel = screen.getByText('Starting number');
      expect(startLabel).toBeInTheDocument();

      const endLabel = screen.getByText('Ending number');
      expect(endLabel).toBeInTheDocument();

      const startDateSegments = screen.getAllByText('2023');
      expect(startDateSegments.length).toBeGreaterThan(0);
    })

    const hiddenStartInputs = screen.getAllByDisplayValue('2023-01-01');
    const textInput = hiddenStartInputs.find(
      el =>
        el.getAttribute('name') === 'startDate' &&
        el.getAttribute('type') === 'text' &&
        el.hasAttribute('hidden')
    );
    expect(textInput).toBeInTheDocument();

  });

  it('should call mockHandleDateChange when start input value change', async () => {
    render(
      <DateRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        dateRange={mockDateRange}
        handleDateChange={mockHandleDateChange}
      />
    );

    const buttons = screen.getAllByLabelText('Calendar');
    expect(buttons.length).toBe(2);

    // Open the date picker
    await userEvent.click(buttons[0]);

    // Find the day button for the date you want to select (e.g., 15th)
    const dayButton = await screen.findByRole('button', { name: /15/ });
    await userEvent.click(dayButton);

    // Now assert the handler was called with the correct arguments
    expect(mockHandleDateChange).toHaveBeenCalledWith(
      'startDate',
      new CalendarDate(2023, 1, 15)
    );
  });

  it('should call mockHandleDateChange when end input value change', async () => {
    render(
      <DateRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        dateRange={mockDateRange}
        handleDateChange={mockHandleDateChange}
      />
    );

    const buttons = screen.getAllByLabelText('Calendar');
    expect(buttons.length).toBe(2);

    await userEvent.click(buttons[1]);

    // Find the day button for the date you want to select (e.g., 10th)
    const dayButtonEnd = await screen.findByRole('button', { name: /10/ });
    await userEvent.click(dayButtonEnd);

    // Now assert the handler was called with the correct arguments
    expect(mockHandleDateChange).toHaveBeenCalledWith(
      'endDate',
      new CalendarDate(2023, 12, 10)
    );
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <DateRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        dateRange={mockDateRange}
        handleDateChange={mockHandleDateChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});