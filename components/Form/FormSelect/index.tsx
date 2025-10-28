import React, { forwardRef, Key } from 'react';
import { useTranslations } from "next-intl";
import type {
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
  extends Omit<SelectProps<T>, 'children' | 'onChange'> {
  label?: string;
  ariaLabel?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  helpMessage?: string;
  description?: React.ReactNode | string;
  selectClasses?: string;
  isRequired?: boolean;
  isRequiredVisualOnly?: boolean;
  onChange?: (value: string) => void;
  items?: T[];
  placeHolder?: string;
  // When true, render a selectable empty option at the top of the menu
  includeEmptyOption?: boolean;
  // Label for the empty option (e.g., "Select option")
  emptyOptionLabel?: string;
  // Key/id representing the empty option; defaults to empty string
  emptyOptionId?: string;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
}

export const FormSelect = forwardRef<HTMLButtonElement, MySelectProps<SelectItem>>((props, ref) => {
  const {
    label,
    ariaLabel,
    errorMessage,
    helpMessage,
    description,
    selectClasses,
    isRequired = false,
    isRequiredVisualOnly = false,
    onChange,
    items,
    // prefer placeholder over legacy placeHolder
    placeholder: placeholderProp,
    placeHolder,
    includeEmptyOption = false,
    emptyOptionLabel = 'Select option',
    emptyOptionId = '',
    ...rest
  } = props;
  const placeholder = placeholderProp ?? placeHolder;
  const showRequired = isRequired || isRequiredVisualOnly;
  const t = useTranslations('Global.labels');

  const handleSelectionChange = (key: Key | null) => {
    if (onChange) {
      // Map null or the empty option key to an empty string for callers
      const value = key == null ? '' : key.toString();
      onChange(value === emptyOptionId ? '' : value);
    }
  };

  // Build items list, optionally prepending a selectable empty option
  const listItems = ((): SelectItem[] | undefined => {
    if (!items) return items;
    if (!includeEmptyOption) return items;
    const hasEmpty = items.some((i) => i.id === emptyOptionId);
    const emptyItem: SelectItem = { id: emptyOptionId, name: emptyOptionLabel };
    return hasEmpty ? items : [emptyItem, ...items];
  })();

  return (
    <Select
      {...rest}
      selectedKey={rest.selectedKey}
      data-invalid={errorMessage}
      className={`${selectClasses} ${styles.mySelect} react-aria-Select`}
      aria-label={ariaLabel}
      aria-required={isRequired}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
    >
      {(state) => (
        <>
          <Label>
            {label}{showRequired && <span className="is-required" aria-hidden="true"> ({t('required')})</span>}
          </Label>
          {description && (
            <Text slot="description" className="help">
              {description}
            </Text>
          )}
          <Button className='react-aria-Button selectButton' ref={ref} data-testid="select-button">
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
            <ListBox items={listItems}
            >
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
