'use client'

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';


const VerificationFailed: React.FC = () => {
  return (
    <PageWrapper title={'Verification failed'}>
      <h1>Verification failed</h1>
      <ContentContainer>
        <div className="container">
          <p>You&lsquo;re email verification failed.</p>
        </div>
      </ContentContainer>
    </PageWrapper >
  )
}

export default VerificationFailed;