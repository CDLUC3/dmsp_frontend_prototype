import React from 'react';
import { SelectBoxQuestionType } from '@dmptool/types';
import { MultiSelect } from '@/components/Form';

interface SelectboxQuestionProps {
  parsedQuestion: SelectBoxQuestionType;
  selectedMultiSelectValues?: Set<string>;
  selectBoxLabel?: string;
  handleMultiSelectChange: (values: Set<string>) => void;
}

const MultiSelectQuestionComponent: React.FC<SelectboxQuestionProps> = ({
  parsedQuestion,
  selectedMultiSelectValues,
  selectBoxLabel,
  handleMultiSelectChange
}) => {
  // Transform options to items for FormSelect/MultiSelect
  const items = parsedQuestion.options?.map((opt: SelectBoxQuestionType['options'][number]) => ({
    id: opt.attributes.value,
    name: opt.attributes.label,
    selected: opt.attributes.selected || false,
  }));

  // Extract selected values for MultiSelect
  const defaultSelected = parsedQuestion.options
    ?.filter((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.selected)
    .map((opt: SelectBoxQuestionType['options'][number]) => opt.attributes.value);

  // Convert selectedMultiSelectValues to Set regardless of input type. This is because this component is called to render
  // an answer that may be a Set or an array.
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