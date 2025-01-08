'use client'

import React, { useEffect, useRef } from 'react';
import type { AriaToastProps } from '@react-aria/toast';
import { useToast } from '@react-aria/toast';
import type { ToastState } from '@react-stately/toast';

import {
  Button,
} from "react-aria-components";

import './toast.scss';

interface ToastProps<T> extends AriaToastProps<T> {
  state: ToastState<T>;
}

function Toast<T extends React.ReactNode>({ state, ...props }: ToastProps<T>) {
  let ref = useRef<HTMLDivElement>(null);
  let { toastProps, contentProps, titleProps, closeButtonProps } = useToast(
    props,
    state,
    ref
  );

  useEffect(() => {
    // Move focus to the toast message
    if (ref.current) {
      ref.current.focus();
    }
  })

  return (
    <div
      {...toastProps}
      ref={ref}
      className="toast"
    >
      <div {...contentProps}>
        <div {...titleProps}>{props.toast.content}</div>
      </div>
      <Button {...closeButtonProps}>x</Button>
    </div>
  );
}

export default Toast;