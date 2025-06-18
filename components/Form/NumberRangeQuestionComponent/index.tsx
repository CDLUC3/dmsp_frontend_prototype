import React from 'react';
import { NumberRangeQuestionType } from '@dmptool/types';
import { NumberComponent, } from '@/components/Form';

interface NumberRangeQuestionProps {
  parsedQuestion: NumberRangeQuestionType;
  numberRange: {
    startDate: string | number | null;
    endDate: string | number | null;
  };
  handleNumberChange: (
    key: string,
    value: string | number | null
  ) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

const NumberRangeQuestionComponent: React.FC<NumberRangeQuestionProps> = ({
  parsedQuestion,
  numberRange,
  handleNumberChange,
  startPlaceholder = "start",
  endPlaceholder = "end",
}) => {
  // Extract labels from JSON
  const startNumberLabel = parsedQuestion?.columns?.start?.attributes?.label;
  const endNumberLabel = parsedQuestion?.columns?.end?.attributes?.label;
  return (
    <div className='form-row two-item-row'>
      <NumberComponent
        label={startNumberLabel}
        value={numberRange.startDate ?? undefined}
        onChange={num => handleNumberChange('startDate', num)}
        placeholder={startPlaceholder}
      />

      <NumberComponent
        label={endNumberLabel}
        value={numberRange.endDate ?? undefined}
        onChange={num => handleNumberChange('endDate', num)}
        placeholder={endPlaceholder}
      />
    </div>
  )
};

export default NumberRangeQuestionComponent;