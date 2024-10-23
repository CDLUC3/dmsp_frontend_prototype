import React, { useState } from 'react';
import type { ListBoxItemProps, SelectProps, ValidationResult } from 'react-aria-components';
import { Button, FieldError, Label, ListBox, ListBoxItem, Popover, Select, SelectValue, Text } from 'react-aria-components';
import styles from './myselect.module.scss';

interface MySelectProps<T extends object>
  extends Omit<SelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function MySelect<T extends object>(
  { label, description, errorMessage, children, items, ...props }:
    MySelectProps<T>
) {
  return (
    <Select {...props} data-invalid={errorMessage} className={`${styles.mySelect} react-aria-Select`}>
      {(state) => (
        <>
          <Label>{label}</Label>
          <Button className='react-aria-Button'>
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
          {description && <Text slot="description">{description}</Text>}
          <FieldError className={styles['react-aria-FieldError']} />
          <Popover>
            <ListBox items={items}>{children}</ListBox>
          </Popover>
        </>
      )}
    </Select>
  );
}

export function MyItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
    />
  );
}

