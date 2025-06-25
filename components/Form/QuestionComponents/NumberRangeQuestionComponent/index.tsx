import React from 'react';
import { NumberRangeQuestionType } from '@dmptool/types';
import { NumberComponent, } from '@/components/Form';

interface NumberRangeQuestionProps {
  parsedQuestion: NumberRangeQuestionType;
  numberRange: {
    startNumber: number | null;
    endNumber: number | null;
  };
  handleNumberChange: (
    key: string,
    value: number | null
  ) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

const NumberRangeQuestionComponent: React.FC<NumberRangeQuestionProps> = ({
  parsedQuestion,
  numberRange,
  handleNumberChange,
  startPlaceholder,
  endPlaceholder,
}) => {

  // Extract labels from JSON
  const startNumberLabel = parsedQuestion?.columns?.start?.attributes?.label;
  const endNumberLabel = parsedQuestion?.columns?.end?.attributes?.label;
  const startNumberMin = (parsedQuestion?.columns?.start?.attributes as { min?: number }).min;
  const startNumberMax = (parsedQuestion?.columns?.start?.attributes as { max?: number }).max;

  const endNumberMin = (parsedQuestion?.columns?.end.attributes as { min?: number }).min;
  const endNumberMax = (parsedQuestion?.columns?.end?.attributes as { max?: number }).max;
  return (
    <div className='form-row two-item-row'>
      <NumberComponent
        label={startNumberLabel}
        value={numberRange.startNumber}
        onChange={num => handleNumberChange('startNumber', num)}
        placeholder={startPlaceholder}
        minValue={startNumberMin}
        maxValue={startNumberMax ?? undefined}
      />

      <NumberComponent
        label={endNumberLabel}
        value={numberRange.endNumber}
        onChange={num => handleNumberChange('endNumber', num)}
        placeholder={endPlaceholder}
        minValue={endNumberMin}
        maxValue={endNumberMax ?? undefined}
      />
    </div>
  )
};

export default NumberRangeQuestionComponent;