import React from 'react';
import { useTranslations } from "next-intl";
import {
  Button,
  FieldError,
  Input,
  Label,
  Popover,
  Dialog,
  DialogTrigger,
  OverlayArrow,
  Text,
  TextField,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import { DmpIcon } from "@/components/Icons";
import styles from "./formInput.module.scss";

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
  isRecommended?: boolean;
  isRequiredVisualOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helpMessage?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  tooltip?: string | React.ReactNode
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
}

const FormInput = React.forwardRef<HTMLInputElement, InputProps & React.InputHTMLAttributes<HTMLInputElement>>(({
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
  isRecommended = false,
  isInvalid = false,
  errorMessage = '',
  helpMessage = '',
  minLength = undefined,
  maxLength = undefined,
  pattern,
  tooltip,
  tooltipPlacement = 'bottom',
  ...rest
}, ref) => {
  const showRequired = isRequired || isRequiredVisualOnly;
  const t = useTranslations('Global.labels');

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
        <div className={styles.tooltipWrapper}>
          <Label htmlFor={id} className={labelClasses}>
            {label}
            {showRequired && <span className="is-required" aria-hidden="true"> ({t('required')})</span>}
            {isRecommended && <span className="is-recommended" aria-hidden="true"> ({t('recommended')})</span>}
          </Label>
          {tooltip && (
            <DialogTrigger>
              <TooltipTrigger delay={0}>
                <Button className={`${styles.popOverButton} react-aria-Button`} aria-label="More information">
                  <div className={styles.infoIcon}><DmpIcon icon="info" /></div>
                </Button>
                <Tooltip placement={tooltipPlacement} className={styles.tooltip}>
                  {tooltip}
                </Tooltip>
              </TooltipTrigger>
              <Popover className={styles.popover}>
                <OverlayArrow>
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M0 0 L6 6 L12 0" />
                  </svg>
                </OverlayArrow>
                <Dialog>
                  {tooltip}
                </Dialog>
              </Popover>
            </DialogTrigger>
          )}
        </div>
        {description && (
          <Text slot="description" className="help">
            {description}
          </Text>
        )}

        <Input
          ref={ref}
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
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          aria-required={isRequired}
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
});

FormInput.displayName = 'FormInput';
export default FormInput;
