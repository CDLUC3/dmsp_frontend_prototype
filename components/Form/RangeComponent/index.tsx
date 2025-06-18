import React from 'react';
import { FormInput } from '@/components/Form';

interface RangeComponentProps {
  startLabel: string;
  endLabel: string;
  handleRangeLabelChange: (field: 'start' | 'end', value: string) => void;
}

const RangeComponent: React.FC<RangeComponentProps> = ({
  startLabel,
  endLabel,
  handleRangeLabelChange,
}) => {
  return (
    <div className='form-row two-item-row'>
      <div>
        <FormInput
          name="range-start"
          type="text"
          id="rangeStart"
          isRequired={true}
          label="Starting Label"
          value={startLabel}
          onChange={e => handleRangeLabelChange('start', e.currentTarget.value)}
        />
      </div>
      <div>
        <FormInput
          name="range-end"
          type="text"
          id="rangeEnd"
          isRequired={true}
          label="Ending Label"
          value={endLabel}
          onChange={e => handleRangeLabelChange('end', e.currentTarget.value)}
        />
      </div>
    </div>
  );
};

export default RangeComponent;