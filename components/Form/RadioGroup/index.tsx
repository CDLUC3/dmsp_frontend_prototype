import React from 'react';
import { useTranslations } from "next-intl";
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
  const showRequired = isRequired || isRequiredVisualOnly;
  const t = useTranslations('Global.labels');

  return (
    <>
      <RadioGroup
        name={name}
        value={value}
        className={classes}
        onChange={onChange}
        aria-label={radioGroupLabel}
        isRequired={isRequired}
        isInvalid={isInvalid}
        aria-required={isRequired}
      >
        <Label>
          {radioGroupLabel}{showRequired && <span className="is-required" aria-hidden="true"> ({t('required')})</span>}
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
