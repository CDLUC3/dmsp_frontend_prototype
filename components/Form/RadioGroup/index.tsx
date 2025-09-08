import React, { ReactNode } from 'react';
import {
  FieldError,
  Label,
  RadioGroup,
  Text,
} from "react-aria-components";

interface RadioGroupComponentProps {
  name: string;
  value: string;
  classes?: string;
  description?: ReactNode;
  radioGroupLabel: string;
  isInvalid?: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  children: ReactNode; // allow any Radio buttons or JSX
}

const RadioGroupComponent: React.FC<React.PropsWithChildren<RadioGroupComponentProps>> = ({
  name,
  value,
  classes,
  description,
  radioGroupLabel,
  isInvalid,
  errorMessage,
  onChange,
  children,
}) => {
  return (
    <RadioGroup
      name={name}
      value={value}
      className={classes}
      onChange={onChange}
      aria-label={radioGroupLabel || 'Radio Group'}
    >
      <Label>{radioGroupLabel}</Label>
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
  );
};

export default RadioGroupComponent;
