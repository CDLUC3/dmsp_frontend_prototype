'use client'

import React, {useEffect, useRef, useState} from 'react';
import {DocumentNode} from '@apollo/client';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";
import {createApolloClient} from '@/lib/graphql/client/apollo-client';
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
    setOtherField: Function;
    fieldName: string;
    required: boolean;
    error?: string;
    updateFormData: Function; //Function to update the typeahead field value in the parent form data
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
    required,
    error,
    updateFormData,
    value,
    className,
    resultsKey,
    otherText = "Other",
}: TypeAheadInputProps) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);
    const [showSuggestionSpinner, setShowSuggestionSpinner] = useState(false);
    const [selected, setSelected] = useState("");
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const [currentListItemFocused, setCurrentListItemFocused] = useState(-1);
    const [activeDescendentId, setActiveDescendentId] = useState<string>("");
    const [otherSelected, setOtherSelected] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);


    const client = createApolloClient();
    if (!client) {
        logECS('error', 'Apollo client creation failed', {
            source: 'TypeAheadInput component'
        });
        return null;
    }
    const validateField = (value: string) => {
        if (!/^[A-Za-z.\?_\(\)\s-]+$/.test(value)) {
            setErrorMessage('Please enter a valid institution(only letters allowed).');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handleUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        //set previous error to empty string
        error = '';
        const value = e.target.value;
        const dataId = (e.target as HTMLElement).dataset.id;
        setInputValue(value);

        if (value) {
            validateField(value);
            await updateFormData(dataId, value);
        } else {
            setErrorMessage('');
            await updateFormData({});
        }
    }

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        setOpen(true);
        setOtherField(false);
        setInputValue('');
        updateFormData({});
    }

    const handleSelection = async (e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLLIElement>) => {
        setOpen(false);
        const item = (e.target as HTMLLIElement | HTMLInputElement).innerText?.toString() ||
            (e.target as HTMLLIElement | HTMLInputElement).value?.toString();
        const activeDescendentId = (e.target as HTMLLIElement | HTMLInputElement).id;

        const dataId = (e.target as HTMLElement).dataset.id;
        const dataValue = (e.target as HTMLElement).dataset.value;
        await updateFormData(dataId, item);

        setSelected(item);
        setInputValue(item);
        setCurrentListItemFocused(-1);
        setActiveDescendentId(activeDescendentId);

        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }

        if (dataValue === "other") {
            setOtherField(true);
            setOtherSelected(true);
        } else {
            setOtherField(false);
            setOtherSelected(false);
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
        let itemToFocus = null;
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
                    setOtherSelected(false);
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
                    // setOtherSelected(false);
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
            setInputValue(value);
        }
    }, [])

    useEffect(() => {
        if (!errorMessage) {
            const handler = setTimeout(() => {
                setDebouncedValue(inputValue);
            }, 700);
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

                if (!signal.aborted) {
                    if (!resultsKey) {
                      throw Error("'resultsKey' property is missing on typeahead field, please provide the key that contain the results data.");
                    }
                    setSuggestions(data[resultsKey]);
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

    return (
        <div className={`${styles.autocompleteContainer} ${styles.expanded} ${className}`} aria-expanded={open} role="combobox">
            <TextField
                type="text"
                className={(!!errorMessage || !!error) ? styles.fieldError : ''}
                isInvalid={!!errorMessage}
                isRequired={required}
            >
                <Label>{label}</Label>
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
                {/*<FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{errorMessage}</FieldError>*/}
                {error ? (<div className={styles.errorMessage}>{error}</div>) : <FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{errorMessage}</FieldError>}
                {helpText && (
                    <Text slot="description" className={styles.helpText}>
                        {helpText}
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
