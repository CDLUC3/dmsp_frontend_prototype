'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type FlashMessageType = 'success' | 'error' | 'info';

interface FlashMessage {
    type: FlashMessageType;
    message: string;
}

interface FlashMessageContextType {
    flashMessage: FlashMessage | null;
    setFlashMessage: (message: FlashMessage) => void;
    clearFlashMessage: () => void;
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(undefined);

export const FlashMessageProvider = ({ children }: { children: ReactNode }) => {
    const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

    useEffect(() => {
        // Load flash message from localStorage on initial render
        const storedMessage = localStorage.getItem('flashMessage');
        if (storedMessage) {
            setFlashMessage(JSON.parse(storedMessage));
        }
    }, []);

    const setFlashMessageWithStorage = (message: FlashMessage) => {
        setFlashMessage(message);
        localStorage.setItem('flashMessage', JSON.stringify(message));
    };

    const clearFlashMessage = () => {
        setFlashMessage(null);
        localStorage.removeItem('flashMessage');
    };

    return (
        <FlashMessageContext.Provider value={{ flashMessage, setFlashMessage: setFlashMessageWithStorage, clearFlashMessage }}>
            {children}
        </FlashMessageContext.Provider>
    );
};

export const useFlashMessage = () => {
    const context = useContext(FlashMessageContext);
    if (!context) {
        throw new Error('useFlashMessage must be used within a FlashMessageProvider');
    }
    return context;
};