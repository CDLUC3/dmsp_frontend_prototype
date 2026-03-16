'use client';
import React from 'react';
import { ListBox, ListBoxItem } from 'react-aria-components';
import styles from './multiSelect.module.scss';
interface Option {
  id: string;
  name: string;
  icon?: string;
}

interface MultiSelectProps {
  options: Option[];
  defaultSelected?: string[];
  selectedKeys?: Set<string>;
  label?: string;
  isDisabled?: boolean;
  onSelectionChange?: (selected: Set<string>) => void;
}

function MultiSelect({
  options,
  defaultSelected = [],
  selectedKeys,
  label = "Select Items (Multiple)",
  isDisabled = false,
  onSelectionChange,
}: MultiSelectProps) {
  const isControlled = selectedKeys !== undefined;
  const [internalSelected, setInternalSelected] = React.useState<Set<string>>(new Set(defaultSelected));
  const selected = isControlled ? selectedKeys! : internalSelected;

  /*eslint-disable @typescript-eslint/no-explicit-any*/
  const handleSelectionChange = (newSelection: any) => {
    // react-aria-components passes a Set<Key> for multiple selection
    if (!isControlled) setInternalSelected(newSelection as Set<string>);
    onSelectionChange?.(newSelection as Set<string>);
  };


  return (
    <div className={styles.container}>
      <label htmlFor="multiSelectBox" className={styles.label}>
        {label}
      </label>

      <ListBox
        id="multiSelectBox"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={handleSelectionChange}
        className={`${styles.listBox}`}
        aria-label={label}
      >
        {options.map((option) => (
          <ListBoxItem
            key={option.id}
            id={option.name}
            textValue={option.name}
            className={styles.multiselectItem}
            isDisabled={isDisabled}
          >
            {({ isSelected }) => (
              <>
                <span>
                  {option.icon && `${option.icon} `}{option.name}
                </span>
                {isSelected && <span style={{ fontSize: '12px' }}>✓</span>}
              </>
            )}
          </ListBoxItem>
        ))}
      </ListBox>

      <div className={styles.selectedCount}>

        <span style={{ marginLeft: '8px', color: '#3b82f6' }}>
          ({[...selected].join(', ')})
        </span>

      </div>
    </div>
  );
}

export default MultiSelect;