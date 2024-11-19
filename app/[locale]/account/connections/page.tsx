'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import sanitizeHtml from 'sanitize-html';
import ConnectionSection from '@/components/ConnectionSection';
import ContentContainer from '@/components/ContentContainer';
import PageWrapper from '@/components/PageWrapper';

const REDIRECT_URI = process.env.NEXT_PUBLIC_ORCID_DEV_CALLBACK;
const ORCID_CLIENT_ID = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID;

const ConnectionsPage: React.FC = () => {
  const t = useTranslations('Connections');
  // Sandbox Uri
  //const orcidUri = `https://sandbox.orcid.org/oauth/authorize?client_id=${orcidClientId}&response_type=code&scope=/read-limited&redirect_uri=${redirectURI}`;

  //Production Uri
  const orcidUri = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${REDIRECT_URI}`;

  const orcidContentString = sanitizeHtml('ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other users. Learn more at <a href="https://orcid.org/" target="_blank" rel="noopener noreferrer">ORCID.org</a>.');
  const name = 'Juliet'
  return (
    <PageWrapper title={'Connections'}>
      {/*-Testing translation capabilities*/}
      <h1>{t('title')}</h1>

      <p>{t('content', { name })}</p>
      <p>{t('itemCount', { count: 1 })}</p>
      <p>
        {t.rich('message', {
          guidelines: (chunks) => <a href="/guidelines">{chunks}</a>
        })}
      </p>
      {t.rich('markup', {
        important: (chunks) => <b>${chunks}</b>
      })}
      <div dangerouslySetInnerHTML={{ __html: t.raw('raw') }} />

      {/*End of Testing translation capabilities */}
      <ContentContainer>
        <ConnectionSection
          type='orcid'
          title='ORCID iD - not connected'
          content={orcidContentString}
          btnUrl={orcidUri}
          btnImageUrl='/images/orcid.svg'
          btnText='Connect your ORCID iD'
        />
        <ConnectionSection
          type='orcidtest'
          title='ORCiD state when user is connected'
          content='This is to test the display of the orcid id once the user has connected.'
          btnUrl='/users/auth/orcid/test'
          btnImageUrl='/images/orcid.svg'
          btnText='Connect your ORCID iD Test'
        />
        <ConnectionSection
          type='sso'
          title='Single Sign On'
          content='Connect your account so that you can log into DMP Tool via your institution.'
          btnUrl=''
          btnText='Connect institutional credentials'
        />
      </ContentContainer>
    </PageWrapper>
  )
}

export default ConnectionsPage;