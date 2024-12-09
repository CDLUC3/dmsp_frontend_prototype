'use client'

import React from 'react';
import PageHeader from '@/components/PageHeader';
import {ContentContainer, LayoutContainer,} from '@/components/Container';

const VerificationFailed: React.FC = () => {
  return (
    <>
      <PageHeader title="Verification failed" />
      <LayoutContainer>
        <ContentContainer>
          <div className="sectionContainer">
            <div className="sectionContent">
              <div className="container">
                <p>You&lsquo;re email verification failed.</p>
              </div>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer>
    </>
  )
}

export default VerificationFailed;
