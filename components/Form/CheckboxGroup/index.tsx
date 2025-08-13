import React from 'react';
import {
  Checkbox,
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
  checkboxData,
  isInvalid,
  errorMessage,
  onChange,
  isRequired = false,
  ariaLabel
}) => {
  return (
    <>
      <CheckboxGroup
        name={name}
        value={value}
        className="checkbox-group"
        data-testid="checkbox-group"
        onChange={onChange}
        isRequired={isRequired}
      >
        <Label>{checkboxGroupLabel}</Label>
        {isInvalid && <FieldError className='error-message'>{errorMessage}</FieldError>}

        {checkboxGroupDescription && (
          <Text slot="description" className="help">
            {checkboxGroupDescription}
          </Text>
        )}
        {checkboxData.map((checkbox, index) => (
          <div key={index}>
            <Checkbox value={checkbox.value} aria-label={ariaLabel}>
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
      </CheckboxGroup>
    </>
  );
};

export default CheckboxGroupComponent;
