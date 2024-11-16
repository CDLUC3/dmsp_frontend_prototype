import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { CsrfProvider } from '@/context/CsrfContext';
import { NextIntlClientProvider } from 'next-intl';
import defaultMessages from '@/messages/en-US/en-US.json'; // Example messages file

const AllTheProviders = ({
    children,
    locale = 'en',
    messages = defaultMessages,
}: {
    children: React.ReactNode;
    locale?: string;
    messages?: Record<string, string>;
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