import React from 'react';
import {
  Label,
  Radio,
  RadioGroup,
  Text,
} from "react-aria-components";
import classNames from 'classnames';

import { RadioButtonProps } from '@/app/types';
import styles from './radioGroup.module.scss';

const RadioGroupComponent: React.FC<RadioButtonProps> = ({
  radioGroupLabel,
  radioButtonData
}) => {

  return (
    <>
      <RadioGroup>
        <Label>{radioGroupLabel}</Label>
        {radioButtonData.map((radioButton, index) => (
          <>
            <Radio value={radioButton.value}>{radioButton.label}</Radio>
            {radioButton.description && (
              <Text
                slot="description"
                className={classNames('help', styles.radioDescription)}
              >
                {radioButton.description}
              </Text>
            )}
          </>
        ))}
      </RadioGroup>
    </>
  );
};

export default RadioGroupComponent;
