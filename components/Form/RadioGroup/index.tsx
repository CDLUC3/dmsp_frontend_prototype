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

const RadioGroupComponent: React.FC<RadioButtonProps & { isRequired?: boolean; 'aria-required'?: string | boolean }> = ({
  name,
  value,
  classes,
  description,
  radioGroupLabel,
  radioButtonData,
  isInvalid,
  errorMessage,
  onChange,
  isRequired = false,
  isRequiredVisualOnly = false,
  'aria-required': ariaRequired,
}) => {
  // Check if aria-required is passed as a prop
  const ariaRequiredFromProps = ariaRequired === 'true' || ariaRequired === true;

  // Show "(required)" if isRequired OR aria-required attribute is present OR isRequiredVisualOnly is true
  const shouldShowRequired = isRequired || ariaRequiredFromProps || isRequiredVisualOnly;

  // Determine aria-required value for the RadioGroup
  const groupAriaRequired = ariaRequiredFromProps || isRequiredVisualOnly;

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
        className={classes}
        onChange={onChange}
        aria-label={radioGroupLabel || 'Radio Group'}
        isRequired={isRequired}
        isInvalid={isInvalid}
        {...(groupAriaRequired && { 'aria-required': true })}
      >
        <Label>
          {radioGroupLabel}{shouldShowRequired && <span className="is-required" aria-hidden="true"> (required)</span>}
        </Label>
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
        {isInvalid && errorMessage && <FieldError className='error-message'>{errorMessage}</FieldError>}
        <FieldError />
      </RadioGroup>
    </>
  );
};

export default RadioGroupComponent;