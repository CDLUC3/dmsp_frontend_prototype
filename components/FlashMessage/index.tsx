'use client'

import React, { useEffect } from 'react';
import { useFlashMessage } from '@/context/FlashMessageContext';
import { usePathname } from 'next/navigation';

export const FlashMessage = () => {
    const { flashMessage, clearFlashMessage } = useFlashMessage();
    const pathname = usePathname();

    useEffect(() => {
        if (flashMessage) {
            // Clear the flash message when the pathname changes
            return () => {
                clearFlashMessage();
            };
        }
    }, [pathname, flashMessage, clearFlashMessage]);

    if (!flashMessage) return null;

    return (
        <div className={`flash-message ${flashMessage.type}`}>
            {flashMessage.message}
        </div>
    );
};

export default FlashMessage;