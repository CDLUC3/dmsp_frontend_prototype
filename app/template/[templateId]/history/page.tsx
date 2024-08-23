'use client'

import React from "react";
import { useParams } from "next/navigation";
import { useTemplateVersionsQuery } from '@/generated/graphql';
import PageWrapper from "@/components/PageWrapper";
import { formatWithTimeAndDate, formatShortMonthDayYear } from "@/utils/dateUtils"
import styles from './history.module.scss';


const TemplateHistory = () => {
    const params = useParams();
    const templateId = Number(params.templateId);

    const { data, loading, error } = useTemplateVersionsQuery(
        { variables: { templateId } }
    );

    // Handle loading state
    if (loading) {
        return <p>Loading publication history...</p>;
    }

    if (error) {
        return <p>There was a problem.</p>
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
    const lastPublicationDate = formatShortMonthDayYear(lastPublication?.created);
    return (
        <PageWrapper title={"Template History"} backButton={true}>
            {loading && <p>Template history is loading...</p>}
            <div>
                {lastPublication && (
                    <>
                        <h1 className="with-subheader">{lastPublication?.name || 'Unknown'}</h1>
                        <div className="subheader">
                            <div>{`by ${lastPublication?.versionedBy?.affiliation?.name}`}</div>
                            <div>
                                <span className={styles.historyVersion}>Version {lastPublication?.version.slice(1)}</span>
                                <span>Published: {lastPublicationDate}</span>
                            </div>
                        </div>
                    </>
                )}

                <h2>History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>User</th>
                            <th>Time and Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sortedTemplates.length > 0
                                ? sortedTemplates.map((item) => {
                                    const publishDate = formatWithTimeAndDate(item?.created);
                                    const versionedBy = item?.versionedBy;

                                    return (
                                        <tr key={item?.id}>
                                            <td>
                                                <div>Published {item?.version}</div>
                                                <div>
                                                    <small className={styles.changeLog}>
                                                        Change log:<br />{item?.comment}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                {versionedBy
                                                    ? `${versionedBy.givenName || ''} ${versionedBy.surName || ''}`
                                                    : 'Unknown'}</td>
                                            <td>{publishDate}</td>
                                        </tr>
                                    );
                                })
                                : <tr><td colSpan={3}>No template history available.</td></tr>

                        }

                    </tbody>
                </table>
            </div>
        </PageWrapper>
    )
}

export default TemplateHistory;