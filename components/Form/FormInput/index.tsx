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
  description?: string;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelClasses?: string;
  inputClasses?: string;
  disabled?: boolean;
  isRequired?: boolean;
  isRequiredVisualOnly?: boolean;
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
  description,
  ariaDescribedBy,
  ariaLabel,
  value,
  onChange,
  className = '',
  labelClasses = '',
  inputClasses = '',
  disabled = false,
  isRequired = false,
  isRequiredVisualOnly = false,
  isInvalid = false,
  errorMessage = '',
  helpMessage = '',
  ...rest
}) => {
  // Check if aria-required is passed as a regular HTML attribute
  const ariaRequiredFromProps = rest['aria-required'] === 'true' || rest['aria-required'] === true;

  // Show "(required)" if isRequired OR aria-required attribute is present OR isRequiredVisualOnly is true
  const shouldShowRequired = isRequired || ariaRequiredFromProps || isRequiredVisualOnly;

  // Determine aria-required value for the Input
  const inputAriaRequired = ariaRequiredFromProps || isRequiredVisualOnly;

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
        <Label htmlFor={id} className={labelClasses}>
          {label}{shouldShowRequired && <span className="is-required" aria-hidden="true"> (required)</span>}
        </Label>
        <Text slot="description" className="help">
          {description}
        </Text>
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
          {...(inputAriaRequired && { 'aria-required': true })}
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