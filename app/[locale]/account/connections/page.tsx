'use client'

import React from 'react';
import ConnectionSection from '@/components/ConnectionSection';
import PageHeader from '@/components/PageHeader';
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel,
} from '@/components/Container';
import { Breadcrumb, Breadcrumbs } from "react-aria-components";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import styles from "@/app/[locale]/account/profile/profile.module.scss";

const REDIRECT_URI = process.env.NEXT_PUBLIC_ORCID_DEV_CALLBACK;
const ORCID_CLIENT_ID = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID;

const ConnectionsPage: React.FC = () => {
  const t = useTranslations('UserConnections');

  // Sandbox Uri
  //const orcidUri = `https://sandbox.orcid.org/oauth/authorize?client_id=${orcidClientId}&response_type=code&scope=/read-limited&redirect_uri=${redirectURI}`;


  //Production Uri
  const orcidUri = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${REDIRECT_URI}`;

  // Fake flag to indicate if ORCID is connected
  const isOrcidConnected = true;



  const orcidContentString = t.markup(
    isOrcidConnected
      ? 'orcidConnectionConnected.content'
      : 'orcidConnection.content',
    {
      link: (chunks) =>
        `<a href="https://orcid.org/" target="_blank" rel="noopener noreferrer">${chunks}</a>`
    }
  );

  return (
    <>
      <PageHeader
        title={t('title')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{t('breadcrumbHome')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/account/profile">{t('breadcrumbProfile')}</Link></Breadcrumb>
            <Breadcrumb>{t('breadcrumbConnections')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-connections-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className="sectionContainer">
            <div className="sectionContent">
              {!isOrcidConnected ? (
                <ConnectionSection
                  type='orcid'
                  title={t('orcidConnection.title')}
                  content={orcidContentString}
                  btnUrl={orcidUri}
                  btnImageUrl='/images/orcid.svg'
                  btnText={t('orcidConnection.btnText')}
                />
              ) : (
                <ConnectionSection
                  type='orcidconnected'
                  title={t('orcidConnectionConnected.title')}
                  content={orcidContentString}
                  btnUrl='/users/auth/orcid/test'
                  btnImageUrl='/images/orcid.svg'
                  btnText={t('orcidConnectionConnected.btnText')}
                />
              )}
              <ConnectionSection
                type='sso'
                title={t('ssoConnection.title')}
                content={t('ssoConnection.content')}
                btnUrl=''
                btnText={t('ssoConnection.btnText')}
              />
            </div>
          </div>
        </ContentContainer>

        <SidebarPanel className={styles.layoutSidebarPanel}>
          <h2>{t('headingRelatedActions')}</h2>
          <ul className={styles.relatedItems}>
            <li><Link href="/account/profile">{t('breadcrumbProfile')}</Link></li>
            <li><Link href="/account/update-password">{t('linkUpdatePassword')}</Link></li>
            <li><Link href="/account/notifications">{t('linkManageNotifications')}</Link></li>
          </ul>
        </SidebarPanel>

      </LayoutWithPanel>
    </>
  )
}

export default ConnectionsPage;
