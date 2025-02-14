import React from 'react';
import {
  FieldError,
  Label,
  Text,
  TextArea,
  TextField,
} from "react-aria-components";
import styles from './formInput.module.scss';

interface InputProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  ariaDescribedBy?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  labelClasses?: string;
  textAreaClasses?: string;
  disabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helpMessage?: string;
}

const FormTextArea: React.FC<InputProps> = ({
  name,
  label,
  description,
  placeholder,
  ariaDescribedBy,
  value,
  onChange,
  className = '',
  labelClasses = '',
  textAreaClasses = '',
  disabled = false,
  isRequired = false,
  isInvalid = false,
  errorMessage = '',
  helpMessage = '',
}) => {

  return (
    <>
      <TextField
        name={name}
        className={`${className} react-aria-TextField ${isInvalid ? 'field-error' : ''}`}
        isRequired={isRequired}
        isInvalid={isInvalid}
        data-testid="field-wrapper"
      >
        <Label className={labelClasses}>{label}</Label>
        <Text slot="description" className="help-text">
          {description}
        </Text>
        <TextArea
          name={name}
          className={textAreaClasses}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
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

export default FormTextArea;
