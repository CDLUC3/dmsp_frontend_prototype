'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'react-aria-components';
import PageHeader from '@/components/PageHeader';
import {
  LayoutWithPanel,
  ContentContainer,
} from '@/components/Container';
import styles from './email-confirmed.module.scss';

const EmailConfirmed: React.FC = () => {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };
  return (
    <>
      <PageHeader title="Email confirmed" />
      <LayoutWithPanel>
        <ContentContainer className={styles.layoutContentContainer}>
          <div className="sectionContainer">
            <div className={`sectionContent ${styles.section}`}>
              <div className="container">
                <p>Thanks for confirming your alias email. Click below to log in and access your plans. Remember you still need to use your primary email to log in.</p>
                <Button data-primary onPress={handleGoToLogin}>Log in</Button>
              </div>
            </div>
          </div>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  )
}

export default EmailConfirmed;
