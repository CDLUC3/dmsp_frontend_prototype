'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
    Input,
    Label,
    TextField,
} from "react-aria-components";
import styles from './typeahead.module.scss'
import classNames from 'classnames';

const AutosuggestInput = () => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState("");
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const [currentListItemFocused, setCurrentListItemFocused] = useState(-1);
    const [activeDescendentId, setActiveDescendentId] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const inputRef = useRef(null);
    const listRef = useRef(null);

    const handleInputClick = () => {
        setOpen(true);
    }

    const handleSelection = (e) => {
        setOpen(false);
        const item = e.target.innerText || e.target.value;
        setSelected(item);
        setInputValue(item);
        setOpen(false);
        setCurrentListItemFocused(-1);

        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }

    const focusListItem = (index) => {
        setCurrentListItemFocused(index);
        if (listRef.current) {
            const listItems = listRef.current.querySelectorAll(`.${styles.autocompleteItem}`);
            const listItem = listItems[index];
            if (listItem) {
                listItem.focus();
                setActiveDescendentId(listItem.id);
            }
        }
    };

    const handleKeyboardEvents = (e) => {
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
                if (currentListItemFocused < listItems.length - 1) {
                    focusListItem(currentListItemFocused + 1);
                }
                break;
            case "ArrowUp":
                if (currentListItemFocused > 0) {
                    focusListItem(currentListItemFocused - 1);
                } else {
                    setCurrentListItemFocused(-1);
                    setActiveDescendentId("");
                    if (inputRef && inputRef.current) {
                        inputRef.current.focus();
                    }
                }
                break;
            case 'Enter':
                if (currentListItemFocused !== -1) {
                    setCurrentListItemFocused(-1);
                    setOpen(false);
                    setActiveDescendentId("");
                    if (inputRef && inputRef.current) {
                        inputRef.current.focus();
                    }
                    handleSelection(e)
                }
                break;
            // default:
            //     // setCurrentListItemFocused(-1);
            //     if (/([a-zA-Z0-9_]|ArrowLeft|ArrowRight)/.test(e.key)) {
            //         // If list item is focused and user presses an alphanumeric key, or left or right
            //         // Focus on the input instead
            //         if (inputRef && inputRef.current) {
            //             inputRef.current.focus();
            //         }

            //     }

            //     break;
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 1000); // Adjust the debounce delay as needed

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    useEffect(() => {
        if (debouncedValue) {
            fetchSuggestions(debouncedValue);
        } else {
            setSuggestions([]);
        }
    }, [debouncedValue]);

    const fetchSuggestions = async (query) => {
        try {
            const response = await fetch(`/api/search?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSuggestions(data);
            setIsExpanded(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    useEffect(() => {
        // Function to handle click outside the input and list
        const handleClickOutside = (event) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target)// Click is outside input
            ) {
                setOpen(false); // Hide the list
            }
        };

        // Attach the event listener when component mounts
        document.addEventListener('click', handleClickOutside);

        // Cleanup: remove event listener when component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const listItems = listRef?.current?.querySelectorAll(`.${styles.autocompleteItem}`);
        if (listItems.length > 1) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [suggestions])

    return (
        <div className={`${styles.autocompleteContainer} ${styles.expanded}`}>
            <TextField>
                <Label>Keyword search</Label>
                <Input
                    name="example_text"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyboardEvents}
                    className={classNames(`react-aria-Input react-aria-TextField ${styles.searchInput}`, isExpanded ? styles.expanded : '')}
                    aria-placeholder="Type to search..."
                    ref={inputRef}
                    autoComplete="off"
                />
                <div
                    className={`${styles.autocompleteDropdownArrow} ${open ? styles.expanded : ""}`}
                    onClick={e => e.preventDefault()}
                    tabIndex="-1"
                    aria-hidden="true"
                >
                    <svg width="10" height="5" viewBox="0 0 10 5" fillRule="evenodd">
                        <title>Open drop down</title>
                        <path d="M10 0L5 5 0 0z"></path>
                    </svg>
                </div>
                <p className={styles.helpText}>Search by research org, field station/lab, template description, etc</p>
            </TextField>



            <ul
                className={`${styles.autocompleteResults} ${open ? styles.visible : ''}`}
                ref={listRef}
                onKeyDown={handleKeyboardEvents}
                onClick={handleSelection}
                tabIndex="0"
            >
                {suggestions === null && (

                    <li
                        className={styles.autocompleteItem}
                        role="option"
                        aria-selected="false"
                        tabIndex="0"
                    >
                        No results found.
                    </li>

                )}
                {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        className={styles.autocompleteItem}
                        id={`autocompleteItem-${index}`}
                        tabIndex="0"
                    >{suggestion}</li>
                ))}
            </ul>

        </div>
    );
};

export default AutosuggestInput;