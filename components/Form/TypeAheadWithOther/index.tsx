'use client'

import React, { useEffect, useRef, useState } from 'react';
import { DocumentNode } from '@apollo/client';
import {
  Input,
  FieldError,
  Label,
  Text,
  TextField,
} from "react-aria-components";
import { createApolloClient } from '@/lib/graphql/client/apollo-client';
import Spinner from '@/components/Spinner';
import classNames from 'classnames';
import styles from './typeaheadWithOther.module.scss';


import logECS from '@/utils/clientLogger';

type TypeAheadInputProps = {
  graphqlQuery: DocumentNode;
  resultsKey: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  setOtherField: (value: boolean) => void;
  fieldName: string;
  required: boolean;
  error?: string;
  updateFormData: (id: string, value: string) => void; //Function to update the typeahead field value in the parent form data
  value?: string;
  className?: string;
  otherText?: string;
}

type SuggestionInterface = {
  id: string;
  displayName: string;
  uri: string;
}

const TypeAheadWithOther = ({
  graphqlQuery,
  label,
  placeholder,
  helpText,
  setOtherField,
  fieldName,
  error,
  updateFormData,
  value,
  className,
  resultsKey,
  otherText = "Other",
}: TypeAheadInputProps) => {
  const [initialInputValue, setInitialInputValue] = useState<string>(''); // Needed to set initial input value without triggering search
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);
  const [showSuggestionSpinner, setShowSuggestionSpinner] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [currentListItemFocused, setCurrentListItemFocused] = useState(-1);
  const [activeDescendentId, setActiveDescendentId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);


  const client = createApolloClient();

  useEffect(() => {
    if (!client) {
      logECS('error', 'Apollo client creation failed', {
        source: 'TypeAheadInput component',
      });
      return;
    }
  }, [client]);

  const handleUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //set previous error to empty string
    error = '';
    const value = e.target.value;
    const dataId = (e.target as HTMLElement).dataset.id || '';
    setInputValue(value);

    updateFormData(dataId, value);

  }

  const handleInputClick = () => {
    setOpen(true);
    setOtherField(false);
    setInputValue('');
    setInitialInputValue('');
    updateFormData('', ''); // Clear the form data when input is clicked
  }

  const handleSelection = async (e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLLIElement>) => {
    setOpen(false);
    const item = (e.target as HTMLLIElement | HTMLInputElement).innerText?.toString() ||
      (e.target as HTMLLIElement | HTMLInputElement).value?.toString();
    const activeDescendentId = (e.target as HTMLLIElement | HTMLInputElement).id;

    const dataId = (e.target as HTMLElement).dataset.id || '';
    const dataValue = (e.target as HTMLElement).dataset.value;
    updateFormData(dataId, item);

    setInputValue(item);
    setCurrentListItemFocused(-1);
    setActiveDescendentId(activeDescendentId);

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }

    if (dataValue === "other") {
      setOtherField(true);
    } else {
      setOtherField(false);
    }
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
    if (value) {
      setInitialInputValue(value);
    }
  }, [])

  useEffect(() => {
    if (!error) {
      const handler = setTimeout(() => {
        setDebouncedValue(inputValue);
      }, 300);
      return () => {
        clearTimeout(handler);
      };
    }

  }, [inputValue]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSuggestions = async (searchTerm: string) => {
      try {
        const { data } = await client.query({
          query: graphqlQuery,
          variables: { name: searchTerm },
          context: { fetchOptions: { signal } }
        });

        // split the resultsKey on dot and get each key in the path. This allows keys like:
        //   "afffiliations", "affiliations.items", etc.
        const keys = resultsKey.split('.');
        // reduce the data object to get the value of the resultsKey
        const results = keys.reduce((acc, key) => {
          if (acc && acc[key]) {
            return acc[key];
          }
          return null;
        }, data);

        if (!signal.aborted) {
          if (!resultsKey) {
            throw Error("'resultsKey' property is missing on typeahead field, please provide the key that contain the results data.");
          }
          setSuggestions(results || []);
          setOpen(true);
        }

      } catch (error) {
        if (!signal.aborted) {
          console.error('Error fetching suggestions:', error);
        }
      } finally {
        if (!signal.aborted) {
          setShowSuggestionSpinner(false);
        }
      }
    }
    if (debouncedValue !== '' && debouncedValue !== otherText) {
      setShowSuggestionSpinner(true);
      fetchSuggestions(debouncedValue);
    }

    return () => controller.abort();
  }, [debouncedValue]);

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

  // Ensure the component always renders
  if (!client) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: Unable to initialize Apollo client.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.autocompleteContainer} ${styles.expanded} ${className}`} aria-expanded={open} role="combobox" aria-controls="results">
      <TextField
        type="text"
        className={(!!error) ? styles.fieldError : ''}
        isInvalid={!!error}
      >
        <Label>{label}</Label>
        <Input
          name={fieldName}
          type="text"
          value={inputValue ? inputValue : initialInputValue}
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
              role="listitem"
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
                    role='listitem'
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
