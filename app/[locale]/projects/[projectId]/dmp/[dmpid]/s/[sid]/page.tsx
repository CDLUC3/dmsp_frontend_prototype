'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewSectionPage.module.scss';
import {useTranslations} from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";

interface Question {
  id: string;
  title: string;
  link: string;
  isAnswered: boolean;
}

const PlanOverviewSectionPage: React.FC = () => {
  const t = useTranslations('PlanOverview');

  const plan = {
    id: "plan_123",
    template_name: "NSF Polar Programs",
    title: "NSF Polar Programs",
    funder_name: "National Science Foundation"
  };

  const questions: Question[] = [
    {
      id: "q1",
      title: "What types of data, samples, collections, software, materials, etc. will be produced during your project?",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2544",
      isAnswered: true
    },
    {
      id: "q2",
      title: "What type of metadata (information others might need to use your data) will be collected during...",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2545",
      isAnswered: false
    },
    {
      id: "q3",
      title: "Will all data collected be converted to open source formats?",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2546",
      isAnswered: false
    }
  ];

  return (
    <>
      <PageHeader
        title="Data and Metadata Formats"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb><Link
              href="/en-US">{t('navigation.home')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/en-US/projects">{t('navigation.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/en-US/projects/proj_2425/">Project
              name</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/en-US/projects/proj_2425/dmp/xxx/">{plan.title}</Link></Breadcrumb>
            <Breadcrumb>Data and Metadata Formats</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className="container">
            <section aria-label={"Requirements"}>
              <h4>Requirements by {plan.funder_name}</h4>
              <p>
                The Arctic Data Center requires when submitting to the Center,
                include methods to create these types of data.
              </p>
              <p>
                If using proprietary formats like Excel or MATLAB, plan to
                convert them to open-source formats before submission. If
                conversion isn&apos;t possible, explain why
              </p>

              <h4>Requirements by University of California</h4>
              <p>
                The management of data and metadata is essential for supporting
                research integrity, reproducibility and collaboration. This
                section seeks to document the types and formats of data and
                metadata that will be generated in your project. Properly
                formatted and well-documented data enhance the visibility of
                your research, promote collaboration among users and ensure
                compliance with institutional policies and guidelines.
              </p>
            </section>

            {questions.map((question) => (
              <section
                key={question.id}
                className={styles.questionCard}
                aria-labelledby={`question-title-${question.id}`}
              >
                <div className={styles.questionHeader}>
                  <div className={styles.questionTitle}>
                    <h3 id={`question-title-${question.id}`}>
                      {question.title}
                    </h3>
                    <p aria-live="polite">
                      <span
                        className={styles.progressIndicator}
                        aria-label={`Question status: ${question.isAnswered ? 'Completed' : 'Not started'}`}
                      >
                          <svg
                            className={`${styles.progressIcon} ${!question.isAnswered ? styles.progressIconInactive : ''}`}
                            width="18"
                            height="18"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                          </svg>
                        {question.isAnswered ? t('question.answered') : t('question.notAnswered')}
                        </span>
                    </p>
                  </div>
                  <Link
                    href={question.link}
                    aria-label={t('sections.ariaLabel', {
                      action: question.isAnswered ? t('sections.update') : t('sections.start'),
                      title: question.title
                    })}
                    className="react-aria-Button react-aria-Button--secondary"
                  >
                    {question.isAnswered ? t('sections.update') : t('sections.start')}
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </ContentContainer>

        <SidebarPanel>
          <div
            className={styles.bestPracticesPanel}
            aria-labelledby="best-practices-title"
          >
            <h3 id="best-practices-title">Best practice by DMP Tool</h3>
            <p>Most relevant best practice guide</p>

            <div role="navigation" aria-label="Best practices navigation"
                 className={styles.bestPracticesLinks}>
              <Link href="/best-practices/sharing">
                Data sharing
                <svg width="20" height="20" viewBox="0 0 20 20"
                     aria-hidden="true"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/preservation">
                Data preservation
                <svg width="20" height="20" viewBox="0 0 20 20"
                     aria-hidden="true"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/protection">
                Data protection
                <svg width="20" height="20" viewBox="0 0 20 20"
                     aria-hidden="true"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/all">
                All topics
                <svg width="20" height="20" viewBox="0 0 20 20"
                     aria-hidden="true"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewSectionPage;
