import React from 'react';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";
import styles from './formInput.module.scss';

interface InputProps {
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  ariaDescribedBy?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  helpMessage?: string;
}

const FormInput: React.FC<InputProps> = ({
  name,
  type,
  label,
  placeholder,
  ariaDescribedBy,
  value,
  onChange,
  className = '',
  isInvalid = false,
  errorMessage = '',
  helpMessage = ''
}) => {

  return (
    <>
      <TextField
        name={name}
        type={type}
        className={`${className} react-aria-TextField ${isInvalid ? 'field-error' : ''}`}
        isInvalid={isInvalid}
        data-testid="field-wrapper"
      >
        <Label>{label}</Label>
        <Input
          name={name}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          aria-describedby={ariaDescribedBy}
        />

        {isInvalid && <FieldError className='error-message'>{errorMessage}</FieldError>}

        {helpMessage && (
          <Text slot="description" className='help-text'>
            {helpMessage}
          </Text>
        )}

      </TextField>
    </>
  );
};

export default FormInput;
