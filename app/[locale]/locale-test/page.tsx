'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import PageWrapper from '@/components/PageWrapper';

const LocaleTestPage: React.FC = () => {
  const t = useTranslations('LocaleTest');
  const name = 'Juliet'
  return (
    <PageWrapper title={'Localization Test'}>
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
    </PageWrapper>
  )
}

export default LocaleTestPage;