import React, { useState } from 'react';
import type { ListBoxItemProps, SelectProps, ValidationResult } from 'react-aria-components';
import { Button, FieldError, Label, ListBox, ListBoxItem, Popover, Select, SelectValue, Text } from 'react-aria-components';
import styles from './formSelect.module.scss';

interface SelectItem {
  id: string;
  name: string;
}
interface MySelectProps<T extends SelectItem>
  extends Omit<SelectProps<T>, 'children'> {
  label?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  helpMessage?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  items?: T[];
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function FormSelect<T extends object>(
  { label, errorMessage, helpMessage, onChange, children, items, ...props }:
    MySelectProps<T>
) {
  return (
    <Select {...props} selectedKey={props.selectedKey} data-invalid={errorMessage} className={`${styles.mySelect} react-aria-Select`}>
      {(state) => (
        <>
          <Label>{label}</Label>
          <Button className='react-aria-Button'>
            <SelectValue onChange={onChange} />
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

          <FieldError className='error-message' />
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
}

export function MyItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
    />
  );
}

