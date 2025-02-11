'use client'

import React from 'react';
import {useTranslations} from 'next-intl';
import PageHeader from '@/components/PageHeader';

const LocaleTestPage: React.FC = () => {
  const t = useTranslations('LocaleTest');
  const name = 'Juliet'
  return (
    <>
      <PageHeader title={t('title')} />
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
      <p>{t('general')}</p>
    </>
  )
}

export default LocaleTestPage;
