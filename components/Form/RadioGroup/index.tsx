import React from 'react';
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
  classes,
  description,
  radioGroupLabel,
  radioButtonData,
  isInvalid,
  errorMessage,
  onChange
}) => {

  return (
    <>
      <RadioGroup
        name={name}
        value={value}
        className={classes}
        onChange={onChange}
      >
        <Label>{radioGroupLabel}</Label>
        <Text slot="description" className="help">
          {description}
        </Text>
        {radioButtonData.map((radioButton, index) => (
          <div key={index}>
            <Radio value={radioButton.value}>{radioButton.label}</Radio>
            {radioButton.description && (
              <Text
                slot="description"
                className={classNames('help', styles.radioDescription)}
              >
                {radioButton.description}
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