import React from 'react';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";

// --- Utility function to strip HTML tags ---
const stripHtml = (htmlString: string | null | undefined): string => {
  if (!htmlString) {
    return '';
  }
  // Ensure input is treated as a string for replace
  const stringToProcess = String(htmlString);
  try {
    // Remove common block and inline tags (opening and closing) and their attributes.
    // Uses non-greedy matching (.*?) for attributes. Handles self-closing tags like <br/>.
    const stripped = stringToProcess.replace(/<\/?(p|b|strong|i|em|u|div|span|br|a|img)(.*?)>/gi, '');
    // Decode common HTML entities that might remain after tag stripping
    const decoded = stripped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return decoded;
  } catch (e) {
    console.error("Error stripping HTML with regex:", e);
    // Fallback to original string if regex fails
    return stringToProcess;
  }
};

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
                     isInvalid = false,
                     errorMessage = '',
                     helpMessage = '',
                     ...rest
                   }) => {


  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.currentTarget.value;

    const strippedValue = stripHtml(rawValue);

    const modifiedEvent = {
      ...e,
      currentTarget: {
        ...e.currentTarget,
        value: strippedValue,
      },
      target: {
        ...e.target,
        value: strippedValue,
      }
    };

    // Call the parent's original onChange handler with the modified event object
    onChange?.(modifiedEvent as React.ChangeEvent<HTMLInputElement>);
  };


  const displayValue = stripHtml(value !== undefined && value !== null ? String(value) : value);


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
        <Text slot="description" className="help">
          {description}
        </Text>
        <Input
          id={id}
          name={name}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          onChange={handleInternalChange}
          value={displayValue}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          {...rest}
        />

        {isInvalid &&
          <FieldError className='error-message'>{errorMessage}</FieldError>}

        {helpMessage && (
          <Text slot="description" className='help-text'>
            {helpMessage}
          </Text>
        )}
        <FieldError/>
      </TextField>
    </>
  );
};

export default FormInput;
