import React from 'react';
import { SelectBoxQuestionType } from '@dmptool/types';
import {
  ListBoxItem,
} from "react-aria-components";
import { FormSelect } from '@/components/Form';

interface SelectboxQuestionProps {
  parsedQuestion: SelectBoxQuestionType;
  selectedSelectValue: string | undefined;
  selectLabel?: string;
  selectName?: string;
  errorMessage?: string;
  helpMessage?: string;
  setSelectedSelectValue: (value: string) => void;
  handleSelectChange?: (value: string) => void;
}

const SelectboxQuestionComponent: React.FC<SelectboxQuestionProps> = ({
  parsedQuestion,
  selectedSelectValue,
  selectLabel = '',
  selectName = 'select',
  errorMessage = '',
  helpMessage = '',
  setSelectedSelectValue,
  handleSelectChange
}) => {
  // Transform options to items for FormSelect
  const items = parsedQuestion.options?.map((opt: SelectBoxQuestionType['options'][number]) => ({
    id: opt.attributes.value,
    name: opt.attributes.label,
    selected: opt.attributes.selected || false,
  })) || [];

  // Find initial selected value
  const selectedOption = parsedQuestion.options?.find((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.selected);
  const initialValue = selectedOption ? selectedOption.attributes.value : '';
  const value = selectedSelectValue !== undefined ? selectedSelectValue : initialValue;

  return (

    <FormSelect
      label={selectLabel}
      name={selectName}
      items={items}
      selectedKey={value}
      onSelectionChange={selected => setSelectedSelectValue(selected as string)}
      errorMessage={errorMessage}
      helpMessage={helpMessage}
      onChange={handleSelectChange}
    >
      {items.map((item: { id: string; name: string }) => (
        <ListBoxItem key={item.id}>{item.name}</ListBoxItem>
      ))}
    </FormSelect>


  );
};

export default SelectboxQuestionComponent;