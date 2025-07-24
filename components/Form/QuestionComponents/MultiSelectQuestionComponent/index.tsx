import React from 'react';
import { MultiselectBoxQuestionType } from '@dmptool/types';
import { MultiSelect } from '@/components/Form';

interface MultiselectboxQuestionProps {
  parsedQuestion: MultiselectBoxQuestionType;
  selectedMultiSelectValues?: Set<string>;
  selectBoxLabel?: string;
  handleMultiSelectChange: (values: Set<string>) => void;
}

const MultiSelectQuestionComponent: React.FC<MultiselectboxQuestionProps> = ({
  parsedQuestion,
  selectedMultiSelectValues,
  selectBoxLabel,
  handleMultiSelectChange
}) => {
  // Transform options to items for FormSelect/MultiSelect
  const items = parsedQuestion.options?.map((opt: MultiselectBoxQuestionType['options'][number]) => ({
    id: opt.value,
    name: opt.label,
    selected: opt.selected || false,
  }));

  // Extract selected values for MultiSelect
  const defaultSelected = parsedQuestion.options
    ?.filter((opt: MultiselectBoxQuestionType['options'][number]) => opt.selected)
    .map((opt: MultiselectBoxQuestionType['options'][number]) => opt.value);

  return (
    <MultiSelect
      options={items}
      selectedKeys={(selectedMultiSelectValues && selectedMultiSelectValues.size > 0) ? selectedMultiSelectValues : new Set(defaultSelected)}
      onSelectionChange={handleMultiSelectChange}
      label={selectBoxLabel}
      aria-label={selectBoxLabel}
      defaultSelected={defaultSelected}
    />
  );
};

export default MultiSelectQuestionComponent;