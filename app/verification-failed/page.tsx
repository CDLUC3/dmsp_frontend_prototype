'use client'

import React from 'react';
import PageWrapper from '@/components/PageWrapper';


const VerificationFailed: React.FC = () => {
  return (
    <PageWrapper title={'Verification failed'}>
      <h1>Verification failed</h1>
      <div className="container">
        <p>You&lsquo;re email verification failed.</p>
      </div>
    </PageWrapper >
  )
}

export default VerificationFailed;