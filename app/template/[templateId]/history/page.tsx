'use client'

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTemplateVersionsQuery } from '@/generated/graphql';
import {
    Table,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
} from "react-aria-components";
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import PageWrapper from "@/components/PageWrapper";
import BackButton from "@/components/BackButton";
import { formatWithTimeAndDate, formatShortMonthDayYear } from "@/utils/dateUtils"
import styles from './history.module.scss';

const TemplateHistory = () => {
    const params = useParams();
    const templateId = Number(params.templateId);
    const [errors, setErrors] = useState<string[]>([]);
    const router = useRouter();

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
    }, [error, refetch]); // Runs when 'error' changes

    // Handle loading state
    if (loading) {
        return <p>Loading publication history...</p>;
    }

    const templateVersions = data?.templateVersions || [];
    const sortedTemplates = templateVersions.slice().sort((a, b) => {
        if (a === null || b === null) {
            return a === null ? 1 : -1;
        }
        const versionA = parseInt(a.version.slice(1), 10);
        const versionB = parseInt(b.version.slice(1), 10);
        return versionB - versionA;
    });

    const lastPublication = sortedTemplates.length > 0 ? sortedTemplates[0] : null;
    const lastPublicationDate = lastPublication?.created
        ? formatShortMonthDayYear(new Date(lastPublication.created))
        : '';

    return (
        <PageWrapper title={"Template History"}>
            <BackButton />
            {loading && <p>Template history is loading...</p>}
            <div>
                <div>
                    {errors && errors.map((err, index) => (
                        <p key={index}>{err}</p>
                    ))}
                </div>
                {lastPublication && (
                    <>
                        <h1 className="with-subheader">{lastPublication?.name || 'Unknown'}</h1>
                        <div className="subheader">
                            <div data-testid="author">{`by ${lastPublication?.versionedBy?.affiliation?.displayName}`}</div>
                            <div>
                                <span data-testid="latest-version" className={styles.historyVersion}>Version {lastPublication?.version.slice(1)}</span>
                                <span data-testid="publication-date">Published: {lastPublicationDate}</span>
                            </div>
                        </div>
                    </>
                )}

                <h2 id="templateHistoryHeading">History</h2>
                <Table aria-labelledby="templateHistoryHeading" className="react-aria-Table">
                    <TableHeader className="react-aria-TableHeader">

                        <Column isRowHeader={true} className="react-aria-Column">Action</Column>
                        <Column isRowHeader={true} className="react-aria-Column">User</Column>
                        <Column isRowHeader={true} className="react-aria-Column">Time and Date</Column>
                    </TableHeader>
                    <TableBody>
                        {
                            sortedTemplates.length > 0
                                ? sortedTemplates.map((item, index) => {
                                    const publishDate = item?.created
                                        ? formatWithTimeAndDate(new Date(item.created))
                                        : '';
                                    const versionedBy = item?.versionedBy;

                                    return (
                                        <Row key={`${item?.id}-${index}`} className="react-aria-Row">
                                            <Cell className="react-aria-Cell">
                                                <div>Published {item?.version}</div>
                                                <div>
                                                    <small className={styles.changeLog}>
                                                        Change log:<br />{item?.comment}
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
                                : <Row><Cell>No template history available.</Cell></Row>
                        }

                    </TableBody>
                </Table>
            </div>
        </PageWrapper>
    )
}

export default TemplateHistory;

