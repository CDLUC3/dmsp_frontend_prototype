'use client'

import React from 'react';
import PageHeader from '@/components/PageHeader';
import {
  LayoutWithPanel,
  ContentContainer,
} from '@/components/Container';
import styles from './verificationFailed.module.scss';

const VerificationFailed: React.FC = () => {
  return (
    <>
      <PageHeader title="Verification failed" />
      <LayoutWithPanel>
        <ContentContainer className={styles.layoutContentContainer}>
          <div className="sectionContainer">
            <div className={`sectionContent ${styles.section}`}>
              <div className="container">
                <p>You&lsquo;re email verification failed.</p>
              </div>
            </div>
          </div>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  )
}

export default VerificationFailed;