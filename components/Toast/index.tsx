'use client'

import React, { useRef } from 'react';
import type { AriaToastProps } from '@react-aria/toast';
import { useToast } from '@react-aria/toast';
import type { ToastState } from '@react-stately/toast';

import {
  Button,
} from "react-aria-components";

import './toast.css';

interface ToastProps<T> extends AriaToastProps<T> {
  state: ToastState<T>;
}

function Toast<T extends React.ReactNode>({ state, ...props }: ToastProps<T>) {
  let ref = useRef(null);
  let { toastProps, contentProps, titleProps, closeButtonProps } = useToast(
    props,
    state,
    ref
  );

  return (
    <div {...toastProps} ref={ref} className="toast">
      <div {...contentProps}>
        <div {...titleProps}>{props.toast.content}</div>
      </div>
      <Button {...closeButtonProps}>x</Button>
    </div>
  );
}

export default Toast;