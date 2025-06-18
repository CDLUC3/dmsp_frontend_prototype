import React from 'react';
import { FormInput } from '@/components/Form';

interface RangeComponentProps {
  typeaheadSearchLabel: string;
  typeaheadHelpText: string;
  handleTypeAheadSearchLabelChange: (value: string) => void;
  handleTypeAheadHelpTextChange: (value: string) => void;
}

const RangeComponent: React.FC<RangeComponentProps> = ({
  typeaheadSearchLabel,
  typeaheadHelpText,
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
          label="Search label"
          value={typeaheadSearchLabel}
          onChange={(e) => handleTypeAheadSearchLabelChange(e.currentTarget.value)}
          placeholder="Enter search label"
        />
      </div>
      <div className='form-row'>
        <FormInput
          name="typeahead-help-text"
          id="search-help-text"
          type="text"
          isRequired={true}
          label="Help text"
          value={typeaheadHelpText}
          onChange={e => handleTypeAheadHelpTextChange(e.currentTarget.value)}
          placeholder="Enter the help text you want to display"
        />
      </div>
    </div>
  );
};

export default RangeComponent;