'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button
} from 'react-aria-components';
import PageWrapper from '@/components/PageWrapper';


const EmailConfirmed: React.FC = () => {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };
  return (
    <PageWrapper title={'Email confirmed'}>
      <h1>Email confirmed</h1>
      <div className="container">
        <p>Thanks for confirming your alias email. Click below to log in and access your plans. Remember you still need to use your primary email to log in.</p>
        <Button data-primary onPress={handleGoToLogin}>Log in</Button>
      </div>
    </PageWrapper>
  )
}

export default EmailConfirmed;