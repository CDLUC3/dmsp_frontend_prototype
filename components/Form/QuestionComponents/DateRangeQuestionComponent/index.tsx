import React from 'react';
import { DateRangeQuestionType } from '@dmptool/types';
import { CalendarDate, DateValue } from "@internationalized/date";
import { DateComponent, } from '@/components/Form';
import { getCalendarDateValue } from "@/utils/dateUtils";

interface DateRangeQuestionProps {
  parsedQuestion: DateRangeQuestionType;
  dateRange: {
    startDate: string | DateValue | CalendarDate | null;
    endDate: string | DateValue | CalendarDate | null;
  };
  handleDateChange: (
    key: string,
    value: string | DateValue | CalendarDate | null
  ) => void;
}

const DateRangeQuestionComponent: React.FC<DateRangeQuestionProps> = ({
  parsedQuestion,
  dateRange,
  handleDateChange,
}) => {
  // Extract labels from JSON if available
  const startLabel = parsedQuestion?.columns?.start?.attributes?.label;
  const endLabel = parsedQuestion?.columns?.end?.attributes?.label;
  return (
    <div className='two-item-row'>
      <DateComponent
        name="startDate"
        value={getCalendarDateValue(dateRange.startDate)}
        onChange={newDate => handleDateChange('startDate', newDate)}
        label={startLabel}
      />
      <DateComponent
        name="endDate"
        value={getCalendarDateValue(dateRange.endDate)}
        onChange={newDate => handleDateChange('endDate', newDate)}
        label={endLabel}
      />
    </div >
  )
};

export default DateRangeQuestionComponent;