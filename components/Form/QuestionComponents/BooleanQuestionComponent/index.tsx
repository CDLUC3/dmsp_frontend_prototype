import React from 'react';
import { BooleanQuestionType } from '@dmptool/types';
import { useTranslations } from 'next-intl';
import { RadioGroupComponent } from '@/components/Form';
import { Radio } from 'react-aria-components';

interface BooleanQuestionProps {
  parsedQuestion: BooleanQuestionType;
  selectedValue?: string;
  handleRadioChange: (value: string) => void;
}

const BooleanQuestionComponent: React.FC<BooleanQuestionProps> = ({
  parsedQuestion,
  selectedValue,
  handleRadioChange
}) => {
  // Localization keys
  const Global = useTranslations('Global');

  // Set checked value based on parsedQuestion.attributes.checked
  const initialChecked = parsedQuestion?.attributes?.checked ? 'yes' : 'no';

  const value = selectedValue ?? initialChecked;

  return (

    <RadioGroupComponent
      name="visibility"
      value={value}
      radioGroupLabel=""
      onChange={handleRadioChange}
    >
      <div>
        <Radio value="yes">{Global('form.yesLabel')}</Radio>
      </div>

      <div>
        <Radio value="no">{Global('form.noLabel')}</Radio>
      </div>

    </RadioGroupComponent>
  );
};

export default BooleanQuestionComponent;