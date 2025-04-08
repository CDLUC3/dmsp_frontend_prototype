import React, { ReactNode } from 'react';
import {
  FieldError,
  Label,
  Radio,
  RadioGroup,
  Text,
} from "react-aria-components";
import classNames from 'classnames';

import { RadioButtonProps } from '@/app/types';
import styles from './radioGroup.module.scss';

const RadioGroupComponent: React.FC<RadioButtonProps> = ({
  name,
  value,
  description,
  radioGroupLabel,
  radioButtonData,
  isInvalid,
  errorMessage,
  onChange
}) => {

  const renderDescription = (desc: string | ReactNode) => {
    // If it's a string, just render it directly
    // If it's a ReactNode, it will be rendered as JSX
    return desc;
  };
  return (
    <>
      <RadioGroup
        name={name}
        value={value}
        onChange={onChange}
      >
        <Label>{radioGroupLabel}</Label>
        <Text slot="description" className="help">
          {description}
        </Text>
        {radioButtonData.map((radioButton, index) => (
          <div key={index}>
            <Radio value={radioButton.value} aria-label={radioButton.value}>{radioButton.label}</Radio>
            {radioButton.description && (
              <Text
                slot="description"
                className={classNames('help', styles.radioDescription)}
              >
                {renderDescription(radioButton.description)}
              </Text>
            )}
          </div>
        ))}
        {isInvalid && <FieldError className='error-message'>{errorMessage}</FieldError>}
      </RadioGroup>
    </>
  );
};

export default RadioGroupComponent;