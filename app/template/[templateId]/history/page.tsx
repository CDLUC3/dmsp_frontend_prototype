'use client'

import React from "react";
import PageWrapper from "@/components/PageWrapper";
import styles from './history.module.scss';

const TemplateHistory = () => {
    return (
        <PageWrapper title={"Template History"}>
            <div>
                <h1 className={styles.withSubheader}>Arctic Data Center: NSF Polar Programs</h1>
                <div className={styles.subHeader}>
                    <div>by National Science Foundation (nsf.gov)</div>
                    <div><span className={styles.historyVersion}>Version 6.2</span><span>Published: Jan 1, 2024</span></div>
                </div>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>User</th>
                            <th>Time and Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div>Published v6</div>
                                <div><small>Change log: Added section for data type</small></div>
                            </td>
                            <td>Frederick Cook</td>
                            <td>09:44 on Jan 22 2024</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PageWrapper>
    )
}

export default TemplateHistory;