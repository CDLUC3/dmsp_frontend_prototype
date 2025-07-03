import React from 'react';
import { SelectBoxQuestionType } from '@dmptool/types';
import { MultiSelect } from '@/components/Form';

interface SelectboxQuestionProps {
  parsedQuestion: SelectBoxQuestionType;
  multiSelectTouched?: boolean;
  selectedMultiSelectValues?: Set<string>;
  selectBoxLabel?: string;
  handleMultiSelectChange: (values: Set<string>) => void;
}

const MultiSelectQuestionComponent: React.FC<SelectboxQuestionProps> = ({
  parsedQuestion,
  multiSelectTouched,
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