import React from 'react';
import { CurrencyQuestionType } from '@dmptool/types';
import { NumberComponent } from '@/components/Form';
interface CurrencyQuestionProps {
  parsedQuestion: CurrencyQuestionType;
  inputCurrencyValue: number | null;
  currencyLabel?: string;
  placeholder?: string;
  setInputCurrencyValue: (value: number | null) => void;
}

const CurrencyQuestionComponent: React.FC<CurrencyQuestionProps> = ({
  parsedQuestion,
  inputCurrencyValue,
  currencyLabel,
  placeholder,
  setInputCurrencyValue,
}) => {
  const minValue = (parsedQuestion?.attributes as { min?: number }).min;
  const maxValue = (parsedQuestion?.attributes as { max?: number }).max;
  return (
    <NumberComponent
      label={currencyLabel || ''}
      value={inputCurrencyValue}
      onChange={value => setInputCurrencyValue(value)}
      placeholder={placeholder || ''}
      minValue={minValue ?? undefined}
      maxValue={maxValue ?? undefined}
      formatOptions={{
        style: 'currency',
        currency: parsedQuestion?.meta?.denomination || 'USD', // TODO: Need to eventually get denomination from under attributes
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
    />
  );
};

export default CurrencyQuestionComponent;