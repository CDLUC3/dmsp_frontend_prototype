import React from 'react';
import { RadioButtonsQuestionType } from '@dmptool/types';
import { RadioGroupComponent } from '@/components/Form';

interface RadioButtonQuestionTypeProps {
  parsedQuestion: RadioButtonsQuestionType;
  selectedRadioValue: string | undefined;
  handleRadioChange: (value: string) => void;
}

const RadioButtonsQuestionComponent: React.FC<RadioButtonQuestionTypeProps> = ({
  parsedQuestion,
  selectedRadioValue,
  handleRadioChange
}) => {
  const radioButtonData = parsedQuestion.options?.map((opt: RadioButtonsQuestionType['options'][number]) => ({
    label: opt.attributes.label,
    value: opt.attributes.value,
  }));
  const selectedOption = parsedQuestion.options?.find((opt: RadioButtonsQuestionType['options'][number]) => opt.attributes.selected);
  const initialValue = selectedOption ? selectedOption.attributes.value : undefined;
  const value = selectedRadioValue !== undefined ? selectedRadioValue : initialValue;

  return (
    <RadioGroupComponent
      name="visibility"
      value={value ?? ''}
      radioGroupLabel=""
      radioButtonData={radioButtonData}
      onChange={handleRadioChange}
    />
  );
};

export default RadioButtonsQuestionComponent;