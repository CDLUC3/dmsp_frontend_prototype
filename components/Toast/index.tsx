'use client';

import React, { useRef } from 'react';
import { useToast as useAriaToast } from '@react-aria/toast';
import type { ToastState } from '@react-stately/toast';
import { Button } from 'react-aria-components';

import './toast.scss';


interface ToastData {
  key: string,
  content: string;
  type?: 'info' | 'warn' | 'error' | 'success';
}

interface ToastProps {
  toast: ToastData;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  state: ToastState<any>;
}

const Toast: React.FC<ToastProps> = ({ toast, state }) => {
  const ref = useRef<HTMLDivElement>(null);


  // Only pass `toast` to `useAriaToast`
  const { closeButtonProps } = useAriaToast({ toast }, state, ref);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid="toast"
      ref={ref}
      className={`toast toast-${toast.type ? toast.type : 'info'}`}
    >
      <div>{toast.content}</div>
      <Button {...closeButtonProps} aria-label="Close toast">
        ×
      </Button>
    </div>
  );
};

export default Toast;
