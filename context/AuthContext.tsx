'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import logECS from '@/utils/clientLogger';

interface AuthContextType {
    isAuthenticated: boolean | null;
    setIsAuthenticated: (auth: boolean) => void;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);


/*Will wrap the content with this AuthProvider so that we can use context to check
the authentication state, and to update the state*/
export function AuthProvider({ children }: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    }, [isAuthenticated]);


    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
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