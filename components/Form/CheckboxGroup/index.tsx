import React from 'react';
import {
  Checkbox,
  CheckboxGroup,
  FieldError,
  Label,
  Text,
} from "react-aria-components";

import { CheckboxGroupProps } from '@/app/types';

const CheckboxGroupComponent: React.FC<CheckboxGroupProps & { 'aria-required'?: string | boolean }> = ({
  name,
  value,
  checkboxGroupLabel,
  checkboxGroupDescription,
  checkboxData,
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

  // Determine aria-required value for the CheckboxGroup
  const groupAriaRequired = ariaRequiredFromProps || isRequiredVisualOnly;

  return (
    <>
      <CheckboxGroup
        name={name}
        value={value}
        className="checkbox-group"
        onChange={onChange}
        isRequired={isRequired}
        isInvalid={isInvalid}
        {...(groupAriaRequired && { 'aria-required': true })}
      >
        <Label>
          {checkboxGroupLabel}{shouldShowRequired && <span className="is-required" aria-hidden="true"> (required)</span>}
        </Label>

        {checkboxGroupDescription && (
          <Text slot="description" className="help">
            {checkboxGroupDescription}
          </Text>
        )}
        {checkboxData.map((checkbox, index) => (
          <div key={index}>
            <Checkbox value={checkbox.value}>
              <div className="checkbox">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              <div className="">
                <span>
                  {checkbox.label}
                </span>
                <br />
                <span className="help">
                  {checkbox.description}
                </span>
              </div>
            </Checkbox>
          </div>
        ))}
        {isInvalid && errorMessage && <FieldError className='error-message'>{errorMessage}</FieldError>}
        <FieldError />
      </CheckboxGroup>
    </>
  );
};

export default CheckboxGroupComponent;
