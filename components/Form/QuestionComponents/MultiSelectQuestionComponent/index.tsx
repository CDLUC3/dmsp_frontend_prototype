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
    id: opt.value,
    name: opt.label,
    selected: opt.selected || false,
  }));

  // Extract selected values for MultiSelect
  const defaultSelected = parsedQuestion.options
    ?.filter((opt: SelectBoxQuestionType['options'][number]) => opt.selected)
    .map((opt: SelectBoxQuestionType['options'][number]) => opt.value);

  return (
    <MultiSelect
      options={items}
      selectedKeys={selectedMultiSelectValues ? selectedMultiSelectValues : new Set(defaultSelected)}
      onSelectionChange={handleMultiSelectChange}
      label={selectBoxLabel}
      aria-label={selectBoxLabel}
      defaultSelected={defaultSelected}
    />
  );
};

export default MultiSelectQuestionComponent;