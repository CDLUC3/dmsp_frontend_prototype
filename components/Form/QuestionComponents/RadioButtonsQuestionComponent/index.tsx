import React from 'react';
import { RadioButtonsQuestionType } from '@dmptool/types';
import { RadioGroupComponent } from '@/components/Form';
import { Radio } from 'react-aria-components';
interface RadioButtonQuestionTypeProps {
  parsedQuestion: RadioButtonsQuestionType;
  selectedRadioValue: string | undefined;
  name?: string;
  radioGroupLabel?: string;
  handleRadioChange: (value: string) => void;
}

const RadioButtonsQuestionComponent: React.FC<RadioButtonQuestionTypeProps> = ({
  parsedQuestion,
  selectedRadioValue,
  name = 'radio-buttons-question',
  radioGroupLabel = '',
  handleRadioChange
}) => {
  const radioButtonData = parsedQuestion.options?.map((opt: RadioButtonsQuestionType['options'][number]) => ({
    label: opt.label,
    value: opt.value,
  }));
  const selectedOption = parsedQuestion.options?.find((opt: RadioButtonsQuestionType['options'][number]) => opt.selected);
  const initialValue = selectedOption ? selectedOption.value : undefined;
  const value = (selectedRadioValue === undefined || selectedRadioValue === '') ? initialValue : selectedRadioValue;

  return (
    <>
      <RadioGroupComponent
        name={name}
        value={value ?? ''}
        radioGroupLabel={radioGroupLabel}
        onChange={handleRadioChange}
      >
        {radioButtonData.map((radioButton, index) => (
          <div key={index}>
            <Radio value={radioButton.value}>{radioButton.label}</Radio>
          </div>
        ))}
      </RadioGroupComponent>
    </>
  );
};

export default RadioButtonsQuestionComponent;