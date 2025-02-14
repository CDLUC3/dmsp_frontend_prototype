import React from 'react';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";

interface InputProps {
  name: string;
  id?: string;
  type?: string;
  label: string;
  placeholder?: string;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelClasses?: string;
  inputClasses?: string;
  disabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helpMessage?: string;
}

const FormInput: React.FC<InputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  name,
  id,
  type,
  label,
  placeholder,
  ariaDescribedBy,
  ariaLabel,
  value,
  onChange,
  className = '',
  labelClasses = '',
  inputClasses = '',
  disabled = false,
  isRequired = false,
  isInvalid = false,
  errorMessage = '',
  helpMessage = '',
  ...rest
}) => {

  return (
    <>
      <TextField
        name={name}
        type={type}
        className={`${className} react-aria-TextField ${isInvalid ? 'field-error' : ''}`}
        isRequired={isRequired}
        isInvalid={isInvalid}
        data-testid="field-wrapper"
      >
        <Label htmlFor={id} className={labelClasses}>{label}</Label>
        <Input
          id={id}
          name={name}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          {...rest}
        />

        {isInvalid && <FieldError className='error-message'>{errorMessage}</FieldError>}

        {helpMessage && (
          <Text slot="description" className='help-text'>
            {helpMessage}
          </Text>
        )}
        <FieldError />
      </TextField>
    </>
  );
};

export default FormInput;