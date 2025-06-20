import React from 'react';
import { CurrencyQuestionType } from '@dmptool/types';
import { NumberComponent } from '@/components/Form';
interface CurrencyQuestionProps {
  parsedQuestion: CurrencyQuestionType;
  inputCurrencyValue: number | null;
  numberLabel?: string;
  setInputCurrencyValue: (value: number | null) => void;
}

const CurrencyQuestionComponent: React.FC<CurrencyQuestionProps> = ({
  parsedQuestion,
  inputCurrencyValue,
  numberLabel,
  setInputCurrencyValue,
}) => {
  return (
    <NumberComponent
      label={numberLabel || ''}
      value={inputCurrencyValue === null ? undefined : inputCurrencyValue}
      onChange={value => setInputCurrencyValue(value)}
      placeholder="amount"
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