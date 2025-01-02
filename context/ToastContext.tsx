'use client';

import React, { createContext, useContext } from 'react';
import { useToastState, ToastState } from '@react-stately/toast';

interface ToastContextValue {
  /*eslint-disable @typescript-eslint/no-explicit-any*/
  state: ToastState<any>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProviderWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const state = useToastState({
    maxVisibleToasts: 2
  });

  return (
    <ToastContext.Provider value={{ state }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProviderWrapper');
  }
  return context.state;
};
