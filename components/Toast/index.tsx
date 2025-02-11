'use client';

import React, {useRef} from 'react';
import {useToast as useAriaToast} from '@react-aria/toast';
import type {ToastState} from '@react-stately/toast';
import {Button} from 'react-aria-components';

import './toast.scss';


interface ToastData {
  key: string,
  content: string;
  type?: 'info' | 'warn' | 'error' | 'success';
}

interface ToastProps {
  toast: ToastData;
  state: ToastState<any>;
}

const Toast: React.FC<ToastProps> = ({ toast, state }) => {
  const ref = useRef<HTMLDivElement>(null);


  // Only pass `toast` to `useAriaToast`
  const { toastProps, contentProps, titleProps, closeButtonProps } = useAriaToast(
    { toast },
    state,
    ref
  );

  return (
    <div
      {...toastProps}
      ref={ref}
      className={`toast toast-${toast.type}`}
    >
      <div {...contentProps}>
        <div {...titleProps}>{toast.content}</div>
      </div>
      <Button {...closeButtonProps} aria-label="Close toast">
        ×
      </Button>
    </div>
  );
};

export default Toast;
