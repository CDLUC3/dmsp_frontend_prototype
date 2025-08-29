import React, { forwardRef, Key } from 'react';
import type {
  ListBoxItemProps,
  SelectProps,
  ValidationResult
} from 'react-aria-components';
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text
} from 'react-aria-components';
import styles from './formSelect.module.scss';

interface SelectItem {
  id: string;
  name: string;
}
interface MySelectProps<T extends SelectItem>
  extends Omit<SelectProps<T>, 'children'> {
  label?: string;
  ariaLabel?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  helpMessage?: string;
  description?: string;
  selectClasses?: string;
  onChange?: (value: string) => void;
  items?: T[];
  placeHolder?: string;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export const FormSelect = forwardRef<HTMLButtonElement, MySelectProps<SelectItem>>((props, ref) => {
  const {
    label,
    ariaLabel,
    errorMessage,
    helpMessage,
    description,
    selectClasses,
    onChange,
    items,
    placeholder,
    ...rest
  } = props;

  const handleSelectionChange = (key: Key | null) => {
    if (onChange) {
      // Convert `Key | null` to string or undefined as needed
      onChange(key?.toString() ?? '');
    }
  };

  return (
    <Select
      {...rest}
      selectedKey={rest.selectedKey}
      data-invalid={errorMessage}
      className={`${selectClasses} ${styles.mySelect} react-aria-Select`}
      aria-label={ariaLabel}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
    >
      {(state) => (
        <>
          <Label>{label}</Label>
          <Text slot="description" className="help">
            {description}</Text>
          <Button className='react-aria-Button' ref={ref} data-testid="select-button">
            <SelectValue />
            <span
              aria-hidden="true"
              style={{
                transform: state.isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <svg width="10" height="5" viewBox="0 0 10 5" fillRule="evenodd">
                <title>Open drop down</title>
                <path d="M10 0L5 5 0 0z"></path>
              </svg>
            </span>
          </Button>

          {errorMessage && <FieldError className='error-message'>{errorMessage}</FieldError>}
          {helpMessage && (
            <Text slot="description" className='help-text'>
              {helpMessage}
            </Text>
          )}
          <Popover>
            <ListBox items={items}>
              {(item) => (
                <ListBoxItem key={item.id as React.Key}>{item.name}</ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </>
      )}
    </Select >
  );
});

FormSelect.displayName = 'FormSelect';


export function MyItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
    />
  );
}

