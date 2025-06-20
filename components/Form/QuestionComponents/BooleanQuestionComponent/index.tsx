import React from 'react';
import { BooleanQuestionType } from '@dmptool/types';
import { RadioGroupComponent } from '@/components/Form';

interface BooleanQuestionProps {
  parsedQuestion: BooleanQuestionType;
  selectedValue?: string;
  handleRadioChange: (value: string) => void;
}

const BooleanQuestionComponent: React.FC<BooleanQuestionProps> = ({
  parsedQuestion,
  selectedValue,
  handleRadioChange
}) => {
  // Prepare radioButton data for Yes/No
  const radioButtonData = [
    {
      value: 'yes',
      label: 'Yes'
    },
    {
      value: 'no',
      label: 'No'
    },
  ];
  // Set checked value based on parsedQuestion.attributes.checked
  const initialChecked = parsedQuestion?.attributes?.checked ? 'yes' : 'no';

  // You may want to manage selectedCheckboxValues in state if you want to make it controlled
  const value = selectedValue ?? initialChecked;

  return (
    <RadioGroupComponent
      name="visibility"
      value={value}
      radioGroupLabel=""
      radioButtonData={radioButtonData}
      onChange={handleRadioChange}
    />
  );
};

export default BooleanQuestionComponent;