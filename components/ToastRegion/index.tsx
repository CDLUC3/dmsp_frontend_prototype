'use client';

import React from 'react';
import type { AriaToastRegionProps } from '@react-aria/toast';
import { useToastRegion } from '@react-aria/toast';
import Toast from '@/components/Toast';
import { useToast } from '@/context/ToastContext';

interface ToastRegionProps<T> extends AriaToastRegionProps { }

function ToastRegion<T extends React.ReactNode>(props: ToastRegionProps<T>) {
  let ref = React.useRef(null);
  const state = useToast(); // Use the context to get the state
  let { regionProps } = useToastRegion({}, state, ref);

  return (
    <div {...regionProps} ref={ref} className="toast-region">
      {state.visibleToasts.map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}

export default ToastRegion;