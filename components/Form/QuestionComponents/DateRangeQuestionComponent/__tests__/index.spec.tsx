import React from 'react';
import type { DateRangeQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CalendarDate } from '@internationalized/date';

import DateRangeQuestionComponent from '../index';

expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleDateChange = jest.fn();
  const mockParsedQuestion: DateRangeQuestionType = {
    type: "dateRange",
    meta: {
      schemaVersion: "1.0",
    },
    columns: {
      start: {
        type: "date",
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          label: "Starting number",
        },
      },
      end: {
        type: "date",
        meta: {
          schemaVersion: "1.0",
        },
        attributes: {
          label: "Ending number",
        },
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


  it('should render date range with correct labels and values', () => {
    render(
      <DateRangeQuestionComponent
        parsedQuestion={mockParsedQuestion}
        dateRange={mockDateRange}
        handleDateChange={mockHandleDateChange}
      />
    );

    expect(screen.getByText('Starting number')).toBeInTheDocument();
    expect(screen.getByText('Ending number')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-12-31')).toBeInTheDocument();
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