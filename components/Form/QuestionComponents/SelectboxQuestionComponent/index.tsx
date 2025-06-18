import React from 'react';
import { SelectBoxQuestionType } from '@dmptool/types';
import {
  ListBoxItem,
} from "react-aria-components";
import { FormSelect } from '@/components/Form';

interface SelectboxQuestionProps {
  parsedQuestion: SelectBoxQuestionType;
  selectedSelectValue: string | undefined;
  setSelectedSelectValue: (value: string) => void;
}

const SelectboxQuestionComponent: React.FC<SelectboxQuestionProps> = ({
  parsedQuestion,
  selectedSelectValue,
  setSelectedSelectValue
}) => {
  // Transform options to items for FormSelect/MultiSelect
  const items = parsedQuestion.options?.map((opt: SelectBoxQuestionType['options'][number]) => ({
    id: opt.attributes.value,
    name: opt.attributes.label,
    selected: opt.attributes.selected || false,
  })) || [];
  // Find initial selected value(s)
  const selectedOption = parsedQuestion.options?.find((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.selected);
  const initialValue = selectedOption ? selectedOption.attributes.value : '';
  const value = selectedSelectValue !== undefined ? selectedSelectValue : initialValue;

  // Extract selected values for MultiSelect
  const defaultSelected = parsedQuestion.options
    ?.filter((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.selected)
    .map((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.value) || [];

  return (

    <FormSelect
      label=""
      name="select"
      items={items}
      selectedKey={value}
      onSelectionChange={selected => setSelectedSelectValue(selected as string)}
      errorMessage=""
      helpMessage=""
    >
      {items.map((item: { id: string; name: string }) => (
        <ListBoxItem key={item.id}>{item.name}</ListBoxItem>
      ))}
    </FormSelect>


  );
};

export default SelectboxQuestionComponent;