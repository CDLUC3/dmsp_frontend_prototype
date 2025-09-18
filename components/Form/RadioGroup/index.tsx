import React, { ReactNode } from 'react';
import {
  FieldError,
  Label,
  RadioGroup,
  Text,
} from "react-aria-components";

import { RadioGroupProps } from '@/app/types';

const RadioGroupComponent: React.FC<RadioGroupProps> = ({
  name,
  value,
  classes,
  description,
  radioGroupLabel,
  isInvalid,
  errorMessage,
  onChange,
  isRequired = false,
  isRequiredVisualOnly = false,
  children,
}) => {
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
        {description && (
          <Text slot="description" className="help">
            {description}
          </Text>
        )}
        {children}
        {isInvalid && (
          <FieldError className="error-message">{errorMessage}</FieldError>
        )}
      </RadioGroup>
    </>
  );
};

export default RadioGroupComponent;
