'use client'

import React, { useState, useEffect, useRef } from 'react';
import { DocumentNode } from '@apollo/client';
import {
    Input,
    Label,
    TextField,
} from "react-aria-components";
import { createApolloClient } from '@/lib/graphql/client/apollo-client';

import Spinner from '@/components/Spinner';
import classNames from 'classnames';
import styles from './typeaheadWithOther.module.scss';
import logECS from '@/utils/clientLogger';

type TypeAheadInputProps = {
    graphqlQuery: DocumentNode;
    label: string;
    helpText?: string;
    setOtherField: Function;
}

type SuggestionInterface = {
    id: string;
    name: string;
}

const TypeAheadWithOther = ({
    graphqlQuery,
    label,
    helpText,
    setOtherField
}: TypeAheadInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);
    const [showSuggestionSpinner, setShowSuggestionSpinner] = useState(false);
    const [selected, setSelected] = useState("");
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const [currentListItemFocused, setCurrentListItemFocused] = useState(-1);
    const [activeDescendentId, setActiveDescendentId] = useState<string>("");
    const [otherSelected, setOtherSelected] = useState(false);
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
    const handleInputClick = () => {
        setOpen(true);
        setOtherField(false);
    }

    const handleSelection = (e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLLIElement>) => {
        setOpen(false);
        const item = (e.target as HTMLLIElement | HTMLInputElement).innerText?.toString() ||
            (e.target as HTMLLIElement | HTMLInputElement).value?.toString();
        const activeDescendentId = (e.target as HTMLLIElement | HTMLInputElement).id;

        setSelected(item);
        setInputValue(item);
        setCurrentListItemFocused(-1);
        setActiveDescendentId(activeDescendentId);

        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }

        if (item.toLowerCase() === 'other') {
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
                //If user hits "Enter" on a list item, then set as current input value
                if (currentListItemFocused !== -1) {
                    handleSelection(e)
                    //setOtherSelected(false);
                }
                break;
            case "Tab":
                setCurrentListItemFocused(-1);
                // If the entered value is not in the response, then don't let user tab
                const hasSelectedValue = (suggestions ? suggestions.some(item => item.name === selected) : false) || otherSelected === true;

                if (!hasSelectedValue) {
                    e.preventDefault();
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
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 700);

        return () => {
            clearTimeout(handler);
        };
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
                    const affiliations = data.affiliations;
                    setSuggestions(affiliations);
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
        if (debouncedValue && debouncedValue !== '') {
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
        <>
            <div className={`${styles.autocompleteContainer} ${styles.expanded}`} aria-expanded={open} role="combobox">
                <TextField>
                    <Label>{label}</Label>
                    <Input
                        name="institutions"
                        type="text"
                        value={inputValue}
                        role="textbox"
                        aria-controls="results"
                        aria-activedescendant={activeDescendentId}
                        className={classNames('react-aria-Input', styles.searchInput)}
                        onChange={(e) => setInputValue(e.target.value)}
                        onClick={handleInputClick}
                        onKeyDown={handleKeyboardEvents}
                        placeholder="Type to search..."
                        ref={inputRef}
                        autoComplete="off"
                    />

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
                    <p className={styles.helpText}>{helpText}</p>
                </TextField>

                <ul
                    className={`${styles.autocompleteResults} ${open ? styles.visible : ''}`}
                    ref={listRef}
                    id="results"
                    role="listbox"
                    onKeyDown={handleKeyboardEvents}
                    tabIndex={-1}
                >
                    {suggestions.length === 0 && (

                        <li
                            className={styles.autocompleteItem}
                            role="option"
                            aria-selected="false"
                            tabIndex={-1}
                        >
                            No results found.
                        </li>

                    )}
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
                                Other
                            </li>

                            {suggestions?.map((suggestion, index) => {
                                if (suggestion.name !== '') {
                                    return (
                                        <li
                                            key={index}
                                            className={styles.autocompleteItem}
                                            id={`autocompleteItem-${index + 1}`}
                                            role='listitem'
                                            data-id={suggestion.id}
                                            onClick={handleSelection}
                                            tabIndex={-1}
                                            ref={(el) => {
                                                listItemRefs.current[index + 1] = el;
                                            }}
                                        >{suggestion.name}</li>
                                    )
                                }
                            })}
                        </>
                    )}
                </ul>
            </div>
        </>
    );
};

export default TypeAheadWithOther;