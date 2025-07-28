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

  // Convert selectedMultiSelectValues to Set regardless of input type.
  // This is because this component is called to render an answer that may be a Set or an array.
  const selectedSet = selectedMultiSelectValues
    ? (Array.isArray(selectedMultiSelectValues)
      ? new Set(selectedMultiSelectValues)
      : selectedMultiSelectValues)
    : new Set(defaultSelected);

  const hasSelectedValues = selectedSet.size > 0;

  return (
    <MultiSelect
      options={items}
      selectedKeys={hasSelectedValues ? selectedSet : new Set(defaultSelected)}
      onSelectionChange={handleMultiSelectChange}
      label={selectBoxLabel}
      aria-label={selectBoxLabel}
      defaultSelected={defaultSelected}
    />
  );
};

export default MultiSelectQuestionComponent;