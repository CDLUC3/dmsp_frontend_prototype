'use client';

import React from 'react';
import { useToastRegion } from '@react-aria/toast';
import Toast from '@/components/Toast';
import { useToast } from '@/context/ToastContext';

function ToastRegion() {
  const ref = React.useRef(null);
  const state = useToast(); // Use the context to get the state
  const { regionProps } = useToastRegion({}, state, ref);

  return (
    <div {...regionProps} ref={ref} className="toast-region">
      {state.visibleToasts.map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}

export default ToastRegion;
