import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { CsrfProvider } from '@/context/CsrfContext';
/* This will wrap the client components with the Auth Provider for the unit tests*/
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <CsrfProvider>
                {children}
            </CsrfProvider>
        </AuthProvider>
    )
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as renderWithAuth };