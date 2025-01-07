import React, {ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {AuthProvider} from '../context/AuthContext';
import {CsrfProvider} from '@/context/CsrfContext';
import {NextIntlClientProvider} from 'next-intl';
import defaultMessages from '@/messages/en-US/global.json'; // Example messages file

interface MessageGroup {
    [key: string]: string | MessageGroup; // Keys within each group map to strings (e.g., "title", "about").
}

interface Messages {
    [key: string]: MessageGroup; // Top-level keys map to MessageGroup objects (e.g., "HomePage", "Connections").
}

const AllTheProviders = ({
    children,
    locale = 'en',
    messages = defaultMessages,
}: {
    children: React.ReactNode;
    locale?: string;
    messages?: Messages;
}) => {
    return (
        <AuthProvider>
            <CsrfProvider>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </CsrfProvider>
        </AuthProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: RenderOptions,
    locale = 'en',
    messages = defaultMessages
) =>
    render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders locale={locale} messages={messages}>
                {children}
            </AllTheProviders>
        ),
        ...options,
    });

export * from '@testing-library/react';
export { customRender as renderWithProviders };
