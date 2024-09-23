'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logECS from '@/utils/clientLogger';

interface CsrfContextProps {
  csrfToken: string | null;
  fetchCsrfToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextProps | undefined>(undefined);


export function CsrfProvider({ children }: {
  children: React.ReactNode;
}) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  //Function to fetch CSRF token from the backend
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/apollo-csrf');
      const data = await response.json();

      setCsrfToken(data.csrfToken);
    } catch (err) {
      logECS('error', `Error getting csrf token from backend: ${err}`, {
        source: 'CsrfProvider'
      });
      setCsrfToken(null);
    }
  };

  useEffect(() => {
    // Fetch CSRF token when component mounts
    fetchCsrfToken();
  }, []);

  return (
    <CsrfContext.Provider value={{ csrfToken, fetchCsrfToken }}>
      {children}
    </CsrfContext.Provider>
  )
};

// Custom hook to use the CSRF context
export const useCsrf = () => {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
}