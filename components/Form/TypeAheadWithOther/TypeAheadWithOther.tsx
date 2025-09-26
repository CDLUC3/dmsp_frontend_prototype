'use client'

import React, { useEffect, useRef, useState } from 'react';
import {
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";
import Spinner from '@/components/Spinner';
import { SuggestionInterface } from '@/app/types';
import classNames from 'classnames';
import styles from './typeaheadWithOther.module.scss';


export type TypeAheadInputProps = {
  label: string;
  placeholder?: string;
  helpText?: string;
  setOtherField: (value: boolean) => void;
  fieldName: string;
  required: boolean;
  requiredVisualOnly?: boolean;
  error?: string;
  updateFormData: (id: string, value: string) => void; //Function to update the typeahead field value in the parent form data
  value?: string;
  className?: string;
  otherText?: string;
  suggestions: SuggestionInterface[];
  onSearch: (searchTerm: string) => void;
}

const TypeAheadWithOther = ({
  label,
  placeholder,
  helpText,
  setOtherField,
  fieldName,
  error,
  updateFormData,
  value,
  className,
  suggestions,
  onSearch,
  required=false,
  requiredVisualOnly=false,
  otherText = "Other",
}: TypeAheadInputProps) => {

  const showRequired = required || requiredVisualOnly;
  const [inputValue, setInputValue] = useState<string>(value ?? "");
  const [showSuggestionSpinner, setShowSuggestionSpinner] = useState(false);
  const [currentListItemFocused, setCurrentListItemFocused] = useState(-1);
  const [activeDescendentId, setActiveDescendentId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestionSpinner(true);
    setOpen(true);
    const value = e.target.value;
    const dataId = (e.target as HTMLElement).dataset.id || '';

    setInputValue(value);
    updateFormData(dataId, value);

    if (onSearch) {
      onSearch(value);
    }

    setShowSuggestionSpinner(false);
  };

  const handleInputClick = () => {
    setOpen(true);
    setOtherField(false);
    setInputValue('');
    updateFormData('', ''); // Clear the form data when input is clicked
  }

  const handleSelection = async (e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLLIElement>) => {
    const li = (e.target as HTMLElement).closest('li'); // always get the <li>
    if (!li) return;

    setOpen(false);
    const item = (li.textContent ?? '').trim();
    const activeDescendentId = li.id;

    const dataId = li.dataset.id || '';
    const dataValue = li.dataset.value;

    updateFormData(dataId, item);

    setInputValue(item);
    setCurrentListItemFocused(-1);
    setActiveDescendentId(activeDescendentId);

    inputRef.current?.focus();

    setOtherField(dataValue === 'other');
  }

  const focusListItem = (index: number) => {
    setCurrentListItemFocused(index);
    if (listRef.current) {
      const listItem = listItemRefs.current[index];
      if (listItem) {
        listItem.focus();
        setActiveDescendentId(listItem.id);
      }
    }
  };

  const handleKeyboardEvents = (e: React.KeyboardEvent<HTMLElement>) => {
    let listItems = [];
    if (listRef.current) {
      // Convert NodeListOf<ChildNode> to an array of HTMLElement
      listItems = Array.from(listRef.current.childNodes);
    }

    if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowDown":
        // Allow user to navigate through list items using down arrow key
        if (currentListItemFocused < listItems.length - 1) {
          focusListItem(currentListItemFocused + 1);
        }
        break;

      case "ArrowUp":
        // Allow user to navigate through list items using up arrow key
        if (currentListItemFocused > 0) {
          focusListItem(currentListItemFocused - 1);
        } else {
          setCurrentListItemFocused(-1);
          setActiveDescendentId("");
          setOtherField(false);
          if (inputRef && inputRef.current) {
            inputRef.current.focus();
          }
        }
        break;

      case 'Enter':
        // If user hits "Enter" on a list item, then set as current
        // input value
        if (currentListItemFocused !== -1) {
          handleSelection(e)
        }
        break;

      default:
        if (/([a-zA-Z0-9_]|ArrowLeft|ArrowRight)/.test(e.key)) {
          // If list item is focused and user presses an alphanumeric key, or left or right
          // Focus on the input instead
          if (inputRef && inputRef.current) {
            inputRef.current.focus();
          }
        }
        break;
    }
  }

  useEffect(() => {
    if (onSearch) {
      onSearch(inputValue);
    }
  }, [inputValue]);

  useEffect(() => {
    // Function to handle click outside the input and list
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false); // Hide the list
        setCurrentListItemFocused(-1); //Reset so that next search doesn't start with focus on the wrong option
      }
    };

    // Attach the event listener when component mounts
    document.addEventListener('click', handleClickOutside);

    // Cleanup: remove event listener when component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.autocompleteContainer} ${styles.expanded} ${className} form-row`} aria-expanded={open} role="combobox" aria-controls="results">
      <TextField
        type="text"
        data-testid="typeaheadWithOther"
        className={(!!error) ? styles.fieldError : ''}
        isInvalid={!!error}
      >
        <Label>
          {label}
          {showRequired && <span className="is-required" aria-hidden="true">(required)</span>}
        </Label>
        <Input
          name={fieldName}
          type="text"
          value={inputValue}
          role="textbox"
          aria-controls="results"
          aria-activedescendant={activeDescendentId}
          className={classNames('react-aria-Input', styles.searchInput)}
          onChange={handleUpdate}
          onClick={handleInputClick}
          onKeyDown={handleKeyboardEvents}
          placeholder={placeholder ? placeholder : 'Type to search...'}
          ref={inputRef}
          autoComplete="off"
        />
        {(helpText && !error) && (
          <Text slot="description" className={styles.helpText}>
            {helpText}
          </Text>
        )}
        {error && (
          <Text slot="description" className={styles.errorMessage}>
            {error}
          </Text>
        )}
        <Spinner className={`${styles.searchSpinner} ${showSuggestionSpinner ? styles.show : ''}`}
          isActive={showSuggestionSpinner} />

        {/*Visually hidden element for screen readers */}
        <div
          aria-live="polite"
          className="hidden-accessibly">
          {showSuggestionSpinner ? "Loading..." : ""}
        </div>

        <div
          className={`${styles.autocompleteDropdownArrow} ${open ? styles.expanded : ""}`}
          onClick={e => e.preventDefault()}
          tabIndex={-1}
          aria-hidden="true"
        >
          <svg width="10" height="5" viewBox="0 0 10 5" fillRule="evenodd">
            <title>Open drop down</title>
            <path d="M10 0L5 5 0 0z"></path>
          </svg>
        </div>
      </TextField>

      <ul
        className={`${styles.autocompleteResults} ${open ? styles.visible : ''}`}
        ref={listRef}
        id="results"
        role="listbox"
        onKeyDown={handleKeyboardEvents}
        tabIndex={-1}
      >
        {suggestions && suggestions.length > 0 && (
          <>
            <li
              key="other"
              ref={(el) => {
                listItemRefs.current[0] = el;
              }}
              onClick={handleSelection}
              className={`${styles.otherOption} ${styles.autocompleteItem}`}
              id="autocompleteItem-0"
              role="option"
              aria-selected={currentListItemFocused === 0}
              data-value="other"
              tabIndex={-1}>
              {otherText}
            </li>

            {suggestions?.map((suggestion, index) => {
              if (suggestion.displayName !== '') {
                return (
                  <li
                    key={index}
                    className={styles.autocompleteItem}
                    id={`autocompleteItem-${index + 1}`}
                    role='option'
                    aria-selected={currentListItemFocused === index + 1}
                    data-id={suggestion?.uri}
                    onClick={handleSelection}
                    tabIndex={-1}
                    ref={(el) => {
                      listItemRefs.current[index + 1] = el;
                    }}
                  >{suggestion.displayName}</li>
                )
              }
            })}
          </>
        )}
      </ul>
    </div>
  );
};

export default TypeAheadWithOther;
