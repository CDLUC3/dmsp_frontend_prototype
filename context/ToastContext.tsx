'use client';

import React, { createContext, useContext } from 'react';
import { useToastState, ToastState } from '@react-stately/toast';
import ToastRegion from '@/components/ToastRegion';

interface ToastContextValue {
  /*eslint-disable @typescript-eslint/no-explicit-any*/
  state: ToastState<any>;
}
interface ToastOptions {
  type?: 'info' | 'warn' | 'error' | 'success'; // The type of the toast (used for styling or categorization).
  timeout?: number; // The duration (in milliseconds) before the toast is automatically dismissed.
  priority?: number; // The priority level of the toast (used for ordering toasts if applicable).
  key?: string; // Optional custom key for the toast (defaults to an auto-generated value).
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
      <ToastRegion />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProviderWrapper');
  }
  return {
    ...context.state,
    add: (content: string, options?: ToastOptions) => {
      context.state.add(content, {
        key: `toast-${Date.now()}`,
        type: options?.type,
        timeout: options?.timeout,
        priority: options?.priority,
      });
    },
  };
};
