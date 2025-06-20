import React from 'react';
import { FormInput } from '@/components/Form';

interface TypeAheadSearchProps {
  typeaheadSearchLabel: string;
  typeaheadHelpText: string;
  labelText?: string;
  labelTextPlaceholder?: string;
  helpText?: string;
  helpTextPlaceholder?: string;
  handleTypeAheadSearchLabelChange: (value: string) => void;
  handleTypeAheadHelpTextChange: (value: string) => void;
}

const TypeAheadSearch: React.FC<TypeAheadSearchProps> = ({
  typeaheadSearchLabel,
  typeaheadHelpText,
  labelText,
  labelTextPlaceholder,
  helpText,
  helpTextPlaceholder,
  handleTypeAheadSearchLabelChange,
  handleTypeAheadHelpTextChange
}) => {
  return (
    <div>
      <div className='form-row'>
        <FormInput
          name="typeahead-search-label"
          id="search-label"
          type="text"
          isRequired={true}
          label={labelText || "Search label"}
          value={typeaheadSearchLabel}
          onChange={(e) => handleTypeAheadSearchLabelChange(e.currentTarget.value)}
          placeholder={labelTextPlaceholder || "Enter search label"}
        />
      </div>
      <div className='form-row'>
        <FormInput
          name="typeahead-help-text"
          id="search-help-text"
          type="text"
          isRequired={true}
          label={helpText || "Help text"}
          value={typeaheadHelpText}
          onChange={e => handleTypeAheadHelpTextChange(e.currentTarget.value)}
          placeholder={helpTextPlaceholder || "Enter the help text you want to display"}
        />
      </div>
    </div>
  );
};

export default TypeAheadSearch;