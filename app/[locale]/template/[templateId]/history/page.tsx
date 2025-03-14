'use client'

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useTemplateVersionsQuery } from '@/generated/graphql';
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

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import ErrorMessages from "@/components/ErrorMessages";


import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import { formatShortMonthDayYear, formatWithTimeAndDate } from "@/utils/dateUtils"

import styles from './history.module.scss';

const TemplateHistory = () => {
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
    const { data = {}, loading, error, refetch } = useTemplateVersionsQuery(
        { variables: { templateId } }
    );

    // UseEffect to handle async error handling
    useEffect(() => {
        if (error) {
            const handleErrors = async () => {
                await handleApolloErrors(
                    error.graphQLErrors,
                    error.networkError,
                    setErrors,
                    refetch,
                    router
                );
            };

            handleErrors();
        }
    }, [error, refetch, router]);

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
    const lastPublicationDate = lastPublication?.created ? formatShortMonthDayYear(lastPublication.created) : '';

    return (
        <>
            <PageHeader
                title={t('title')}
                description=""
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
                    {lastPublication && (
                        <>
                            <h2 className="with-subheader">{lastPublication?.name || 'Unknown'}</h2>
                            <div className="subheader">
                                <div data-testid="author">{`${t('by')} ${lastPublication?.versionedBy?.affiliation?.displayName}`}</div>
                                <div>
                                    <span data-testid="latest-version" className={styles.historyVersion}>{t('version')} {lastPublication?.version.slice(1)}</span>
                                    <span data-testid="publication-date">{t('published')}: {lastPublicationDate}</span>
                                </div>
                            </div>
                        </>
                    )}

                    <h3 id="templateHistoryHeading">{t('subHeading')}</h3>
                    <Table aria-labelledby="templateHistoryHeading" className="react-aria-Table">
                        <TableHeader className="react-aria-TableHeader">

                            <Column isRowHeader={true} className={`react-aria-Column ${styles.firstColumn}`}>{t('tableColumnAction')}</Column>
                            <Column isRowHeader={true} className="react-aria-Column">{t('tableColumnUser')}</Column>
                            <Column isRowHeader={true} className="react-aria-Column">{t('tableColumnDate')}</Column>
                        </TableHeader>
                        <TableBody>
                            {
                                sortedTemplates.length > 0
                                    ? sortedTemplates.map((item, index) => {

                                        const publishDate = item?.created ? formatWithTimeAndDate(item?.created) : '';
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
                                    : <Row><Cell>{t('notFoundMessage')}</Cell></Row>
                            }

                        </TableBody>
                    </Table>
                </ContentContainer>
            </LayoutContainer>
        </>
    )
}

export default TemplateHistory;

