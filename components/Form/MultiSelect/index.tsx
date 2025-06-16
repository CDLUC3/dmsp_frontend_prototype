'use client';
import React from 'react';
import { ListBox, ListBoxItem } from 'react-aria-components';
import type { Selection } from '@react-types/shared';

interface Option {
  id: string;
  name: string;
  icon?: string;
}

interface MultiSelectProps {
  options: Option[];
  defaultSelected?: string[];
  onSelectionChange?: (selected: Selection) => void;
  label?: string;
  maxWidth?: string;
  maxHeight?: string;
  minHeight?: string;
}

function MultiSelect({
  options,
  defaultSelected = [],
  onSelectionChange,
  label = "Select Items (Multiple)",
  maxWidth = "300px",
  maxHeight = "200px",
  minHeight = "120px"
}: MultiSelectProps) {
  const [selected, setSelected] = React.useState<Selection>(new Set(defaultSelected));

  const handleSelectionChange = (newSelection: Selection) => {
    setSelected(newSelection);
    onSelectionChange?.(newSelection);
  };

  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth,
    margin: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151'
  };

  const listBoxStyle = {
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    padding: '0',
    maxHeight,
    minHeight,
    overflow: 'auto',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    outline: 'none'
  };

  const selectedCountStyle = {
    marginTop: '8px',
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  };

  const getItemStyle = (isSelected: boolean, isHovered: boolean, isFocused: boolean) => ({
    padding: '12px 16px',
    backgroundColor: isSelected
      ? '#3b82f6'
      : isHovered
        ? '#f3f4f6'
        : 'transparent',
    color: isSelected ? '#ffffff' : '#374151',
    cursor: 'pointer',
    borderRadius: '0',
    transition: 'all 0.15s ease',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: isSelected ? '500' : '400',
    ...(isFocused && !isSelected && {
      backgroundColor: '#e5e7eb',
      outline: '2px solid #3b82f6',
      outlineOffset: '-2px'
    })
  });

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>
        {label}
      </label>

      <ListBox
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={handleSelectionChange}
        style={listBoxStyle}
        className="multiselect-listbox"
      >
        {options.map((option) => (
          <ListBoxItem
            key={option.id}
            className="multiselect-item"
            textValue={option.name}
          >
            {({ isSelected, isHovered, isFocused }) => (
              <div style={getItemStyle(isSelected, isHovered, isFocused)}>
                <span>
                  {option.icon && `${option.icon} `}{option.name}
                </span>
                {isSelected && <span style={{ fontSize: '12px' }}>✓</span>}
              </div>
            )}
          </ListBoxItem>
        ))}
      </ListBox>

      <div style={selectedCountStyle}>
        Selected: {selected === 'all' ? 'All items' : `${[...selected].length} item(s)`}
        {selected !== 'all' && [...selected].length > 0 && (
          <span style={{ marginLeft: '8px', color: '#3b82f6' }}>
            ({[...selected].join(', ')})
          </span>
        )}
      </div>
    </div>
  );
}

export default MultiSelect;