'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import {
  Button,
} from "react-aria-components";

import {
  LayoutContainer,
  ContentContainer,
} from '@/components/Container';

const ToastTestPage: React.FC = () => {
  const router = useRouter();
  const toastState = useToast(); // Access the toast state from context

  const handleRedirectWithToast = () => {
    toastState.add('Toast is done!'); // Add toast
    router.push('/'); // Redirect
  };

  return (
    <>
      <LayoutContainer>
        <ContentContainer>
          <div>
            <Button onPress={() => toastState.add('Testing types!', { type: 'info' })}>Show toast</Button>
            <Button onPress={handleRedirectWithToast}>Show toast and redirect</Button>

          </div>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default ToastTestPage;