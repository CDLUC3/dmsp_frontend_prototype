'use client'

import React from "react";
import sanitizeHtml from 'sanitize-html';
import ContentContainer from "@/components/ContentContainer";
import ConnectionSection from "@/components/ConnectionSection";
import styles from "./connections.module.scss";

const REDIRECT_URI = process.env.NEXT_PUBLIC_ORCID_DEV_CALLBACK;
const ORCID_CLIENT_ID = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID;

const ConnectionsPage: React.FC = () => {

  // Sandbox Uri
  //const orcidUri = `https://sandbox.orcid.org/oauth/authorize?client_id=${orcidClientId}&response_type=code&scope=/read-limited&redirect_uri=${redirectURI}`;

  //Production Uri
  const orcidUri = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${REDIRECT_URI}`;

  const orcidContentString = sanitizeHtml('ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other users. Learn more at <a href="https://orcid.org/" target="_blank" rel="noopener noreferrer">ORCID.org</a>.');

  return (
    <>
      <h1 className={styles.title}>Connections</h1>
      <ContentContainer>
        <ConnectionSection
          type='orcid'
          title='ORCID iD'
          content={orcidContentString}
          btnUrl={orcidUri}
          btnImageUrl='/images/orcid.svg'
          btnText='Connect your ORCID iD'
        />
        <ConnectionSection
          type='orcidtest'
          title='Test orcid'
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
    </>
  )
}

export default ConnectionsPage;