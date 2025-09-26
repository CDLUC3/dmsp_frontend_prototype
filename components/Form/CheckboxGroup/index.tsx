import React from 'react';
import {
  CheckboxGroup,
  FieldError,
  Label,
  Text,
} from "react-aria-components";

import { CheckboxGroupProps } from '@/app/types';

const CheckboxGroupComponent: React.FC<CheckboxGroupProps> = ({
  name,
  value,
  checkboxGroupLabel,
  checkboxGroupDescription,
  isInvalid,
  errorMessage,
  onChange,
  isRequired = false,
  isRequiredVisualOnly = false,
  children,
}) => {
  const showRequired = isRequired || isRequiredVisualOnly;

  return (
    <>
      <CheckboxGroup
        name={name}
        value={value}
        className="checkbox-group"
        data-testid="checkbox-group"
        onChange={onChange}
        isRequired={isRequired}
        isInvalid={isInvalid}
        aria-required={isRequired}
      >
        <Label>
          {checkboxGroupLabel}{showRequired && <span className="is-required" aria-hidden="true"> (required)</span>}
        </Label>
        {isInvalid && <FieldError className='error-message'>{errorMessage}</FieldError>}

        {checkboxGroupDescription && (
          <Text slot="description" className="help">
            {checkboxGroupDescription}
          </Text>
        )}
        {children}
      </CheckboxGroup>
    </>
  );
};

export default CheckboxGroupComponent;
