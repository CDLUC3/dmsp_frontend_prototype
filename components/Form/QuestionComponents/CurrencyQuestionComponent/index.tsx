import React from 'react';
import { CurrencyQuestionType } from '@dmptool/types';
import { NumberComponent } from '@/components/Form';
interface CurrencyQuestionProps {
  parsedQuestion: CurrencyQuestionType;
  inputCurrencyValue: number | null;
  currencyLabel?: string;
  placeholder?: string;
  isDisabled?: boolean;
  handleCurrencyChange: (value: number | null) => void;
}

const CurrencyQuestionComponent: React.FC<CurrencyQuestionProps> = ({
  parsedQuestion,
  inputCurrencyValue,
  currencyLabel,
  placeholder,
  isDisabled = false,
  handleCurrencyChange,
}) => {
  const minValue = (parsedQuestion?.attributes as { min?: number }).min;
  const maxValue = (parsedQuestion?.attributes as { max?: number }).max;
  return (
    <NumberComponent
      label={currencyLabel || ''}
      value={inputCurrencyValue}
      onChange={value => handleCurrencyChange(value)}
      placeholder={placeholder || ''}
      minValue={minValue ?? undefined}
      maxValue={maxValue ?? undefined}
      formatOptions={{
        style: 'currency',
        currency: parsedQuestion?.attributes?.denomination || 'USD',
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
      disabled={isDisabled}
    />
  );
};

export default CurrencyQuestionComponent;