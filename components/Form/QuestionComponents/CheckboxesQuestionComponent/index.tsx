import React from 'react';
import { CheckboxesQuestionType } from '@dmptool/types';
import { CheckboxGroupComponent } from '@/components/Form';

interface CheckboxesQuestionProps {
  parsedQuestion: CheckboxesQuestionType;
  selectedCheckboxValues: string[];
  handleCheckboxGroupChange: (values: string[]) => void;
}

const CheckboxesQuestionComponent: React.FC<CheckboxesQuestionProps> = ({
  parsedQuestion,
  selectedCheckboxValues,
  handleCheckboxGroupChange
}) => {
  const checkboxData = parsedQuestion.options?.map((opt: CheckboxesQuestionType['options'][number]) => ({
    label: opt.label,
    value: opt.value,
  }));
  const initialChecked = parsedQuestion.options
    ?.filter((opt: CheckboxesQuestionType['options'][number]) => opt.checked)
    .map((opt: CheckboxesQuestionType['options'][number]) => opt.value);
  const value = selectedCheckboxValues.length > 0 ? selectedCheckboxValues : initialChecked;

  return (
    <CheckboxGroupComponent
      name="checkboxes"
      value={value}
      onChange={handleCheckboxGroupChange}
      checkboxGroupLabel=""
      checkboxGroupDescription={""}
      checkboxData={checkboxData}
    />
  );
};

export default CheckboxesQuestionComponent;