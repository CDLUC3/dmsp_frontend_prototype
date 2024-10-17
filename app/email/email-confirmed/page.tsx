'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button
} from 'react-aria-components';
import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';


const EmailConfirmed: React.FC = () => {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };
  return (
    <PageWrapper title={'Email confirmed'}>
      <h1>Email confirmed</h1>
      <ContentContainer>
        <div className="container">
          <p>Thanks for confirming your alias email. Click below to log in and access your plans. Remember you still need to use your primary email to log in.</p>
          <Button data-primary onPress={handleGoToLogin}>Log in</Button>
        </div>
      </ContentContainer>
    </PageWrapper>
  )
}

export default EmailConfirmed;