'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import logECS from '@/utils/clientLogger';
import { refreshAuthTokens } from '@/utils/authHelper';

interface AuthContextType {
    isAuthenticated: boolean | null;
    setIsAuthenticated: (auth: boolean) => void;
    refreshTokens: () => Promise<void>;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);


/*Will wrap the content with this AuthProvider so that we can use context to check
the authentication state, and to update the state*/
export function AuthProvider({ children }: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const refreshTokens = async () => {
        try {
            const { message } = await refreshAuthTokens();
            if (message && message === 'ok') {
                setIsAuthenticated(true);
            } else {
                logECS('error', message, {
                    source: 'AuthContext'
                });
                setIsAuthenticated(false);
            }
        } catch (err) {
            logECS('error', `Error refreshing auth tokens: ${err}`, {
                source: 'AuthContext'
            });
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/check-auth', {
                    credentials: 'include', // This ensures cookies are sent with the request
                });
                const data = await response.json();
                setIsAuthenticated(data.authenticated);
            } catch (err) {
                logECS('error', `Error checking authentication status: ${err}`, {
                    source: 'CsrfProvider'
                });
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);


    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, refreshTokens }}>
            {children}
        </AuthContext.Provider>
    )
};

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context;
}