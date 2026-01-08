'use client'

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormatter, useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Cell,
  Column,
  Link,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";

// GraphQL
import { useQuery } from '@apollo/client/react';
import { TemplateVersionsDocument } from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import ErrorMessages from "@/components/ErrorMessages";

// Utils and other
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import { formatToDateOnly, formatWithTimeAndDate } from "@/utils/dateUtils"
import styles from './history.module.scss';

const TemplateHistory = () => {
  const format = useFormatter();
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const templateId = Number(params.templateId);
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);

  // Localization keys
  const t = useTranslations('TemplateHistory');
  const Global = useTranslations('Global');

  // Query for Template versions
  const { data = {}, loading, error, refetch } = useQuery(TemplateVersionsDocument, {
    variables: { templateId }
  });

  // UseEffect to handle error handling
  useEffect(() => {
    if (error) {
      setErrors([error.message]);
    }
  }, [error]);

  // Handle loading state
  if (loading) {
    return <p>{t('loading')}</p>;
  }

  const templateVersions = data?.templateVersions || [];
  const sortedTemplates = templateVersions.slice().sort((a, b) => {
    if (a === null || b === null) {
      return a === null ? 1 : -1;
    }
    const createdA = a.created ? Number(a.created) : 0;
    const createdB = b.created ? Number(b.created) : 0;
    return createdB - createdA;
  });

  const lastPublication = sortedTemplates.length > 0 ? sortedTemplates[0] : null;
  const lastPublicationDate = lastPublication?.created ? formatToDateOnly(lastPublication.created, format.dateTime) : '';
  const lastPublishVersion = lastPublication?.version ? lastPublication.version : '';

  let description = '';
  if (lastPublication) {
    description = `by ${lastPublication?.versionedBy?.affiliation?.displayName}` +
      (lastPublishVersion ? ` - ${Global('version')}: ${lastPublishVersion}` : '') +
      (lastPublicationDate ? ` - ${Global('lastUpdated')}: ${lastPublicationDate}` : '');
  }

  return (
    <>
      <PageHeader
        title={t('title')}
        description={description}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.templateHistory')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />
      <ErrorMessages errors={errors} ref={errorRef} />

      {loading && <p>{t('loading')}</p>}
      <LayoutContainer>
        <ContentContainer>
          <h3 id="templateHistoryHeading">{t('subHeading')}</h3>
          {sortedTemplates.length > 0 ? (
            <Table aria-labelledby="templateHistoryHeading" className="react-aria-Table">
              <TableHeader className="react-aria-TableHeader">

                <Column isRowHeader={true} className={`react-aria-Column ${styles.firstColumn}`}>{t('tableColumnAction')}</Column>
                <Column isRowHeader={true} className="react-aria-Column">{t('tableColumnUser')}</Column>
                <Column isRowHeader={true} className="react-aria-Column">{t('tableColumnDate')}</Column>
              </TableHeader>
              <TableBody>
                {
                  sortedTemplates.map((item, index) => {

                    const publishDate = item?.created ? formatWithTimeAndDate(item?.created, format.dateTime) : '';
                    const versionedBy = item?.versionedBy;

                    return (
                      <Row key={`${item?.id}-${index}`} className="react-aria-Row">
                        <Cell className={`react-aria-Cell ${styles.firstColumn}`}>
                          <div>{item?.versionType} {item?.version}</div>
                          <div>
                            <small className={styles.changeLog}>
                              {t('changeLog')}:<br />{item?.comment}
                            </small>
                          </div>
                        </Cell>
                        <Cell className="react-aria-Cell">
                          {versionedBy
                            ? `${versionedBy.givenName || ''} ${versionedBy.surName || ''}`
                            : 'Unknown'}</Cell>
                        <Cell>{publishDate}</Cell>
                      </Row>
                    );
                  })
                }

              </TableBody>
            </Table>
          ) : <p>{t('notFoundMessage')}</p>}
        </ContentContainer>
      </LayoutContainer>
    </>
  )
}

export default TemplateHistory;

