import React from 'react';
import { CheckboxesQuestionType } from '@dmptool/types';
import { CheckboxGroupComponent } from '@/components/Form';
import { Checkbox } from "react-aria-components";

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
    >
      {checkboxData.map((checkbox, index) => (
        <div key={index}>
          <Checkbox value={checkbox.value} aria-label="checkbox">
            <div className="checkbox">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </div>
            <div className="">
              <span>
                {checkbox.label}
              </span>
            </div>
          </Checkbox>
        </div>
      ))}
    </CheckboxGroupComponent>
  );
};

export default CheckboxesQuestionComponent;