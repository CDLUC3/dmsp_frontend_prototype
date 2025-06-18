import React from 'react';
import { BooleanQuestionType } from '@dmptool/types';
import { CheckboxGroupComponent } from '@/components/Form';

interface BooleanQuestionProps {
  parsedQuestion: BooleanQuestionType;
  yesNoValue?: string[];
  handleBooleanChange?: (value: string[]) => void;
  checkboxGroupLabel?: string;
  checkboxGroupDescription?: string;
}

const BooleanQuestionComponent: React.FC<BooleanQuestionProps> = ({
  parsedQuestion,
  yesNoValue = [],
  handleBooleanChange = () => { },
  checkboxGroupLabel = '',
  checkboxGroupDescription = ''
}) => {
  // Prepare checkbox data for Yes/No
  const checkboxData = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
  ];

  // Set checked value based on parsedQuestion.attributes.checked
  const initialChecked = parsedQuestion.attributes?.checked ? ['yes'] : ['no'];

  // You may want to manage selectedCheckboxValues in state if you want to make it controlled
  const value = yesNoValue ?? initialChecked;
  console.log("Yes no value", yesNoValue);
  console.log("Initially checked", initialChecked);
  return (
    <CheckboxGroupComponent
      name="checkboxes"
      value={value}
      onChange={handleBooleanChange}
      checkboxGroupLabel={checkboxGroupLabel}
      checkboxGroupDescription={checkboxGroupDescription}
      checkboxData={checkboxData}
    />
  );
};

export default BooleanQuestionComponent;