'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useParams, notFound } from 'next/navigation';
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewSectionPage.module.scss';
import { useTranslations } from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { usePlanSectionQuestionsQuery, useSectionQuery, usePlanQuery } from '@/generated/graphql';
import { stripHtml } from '@/utils/general';
import { routePath } from '@/utils/routes';

interface Question {
  id: string;
  title: string;
  link: string;
  isAnswered: boolean;
}

const PlanOverviewSectionPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const params = useParams();
  const sectionId = Number(params.sid);
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;

  // State for navigation visibility
  const [showNavigation, setShowNavigation] = useState(true);

  // Validate that dmpId is a valid number, redirect to 404 if not
  const planId = parseInt(dmpId);
  if (isNaN(planId)) {
    notFound();
  }

  const { data: questionsData, loading: questionsLoading, error: questionsError } = usePlanSectionQuestionsQuery({
    variables: { sectionId },
    skip: !sectionId
  });

  const { data: sectionData, loading: sectionLoading } = useSectionQuery({
    variables: { sectionId },
    skip: !sectionId
  });

  const { data: planData, loading: planLoading } = usePlanQuery({
    variables: { planId },
    skip: !planId
  });

  // Hide navigation when close to footer
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const navHeight = 300; // Approximate height of navigation

      // Calculate if navigation bottom would be close to footer
      const navBottom = windowHeight * 0.2 + navHeight; // 20% from top + nav height
      const distanceToBottom = documentHeight - scrollTop - windowHeight;

      // Hide if we're within 200px of the bottom
      setShowNavigation(distanceToBottom > 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading states
  if (questionsLoading || sectionLoading || planLoading) {
    return <div>Loading questions...</div>;
  }

  if (questionsError) {
    return <div>Error loading questions: {questionsError.message}</div>;
  }

  // Validate section belongs to plan - 404 if not
  const planSections = planData?.plan?.sections || [];
  const sectionBelongsToPlan = planSections.some(section => section.sectionId === sectionId);

  if (!sectionBelongsToPlan) {
    notFound();
  }

  // Check for questions - show message if none
  const questions: Question[] = questionsData?.questions?.filter((question): question is NonNullable<typeof question> => question !== null).map((question) => ({
    id: question.id?.toString() || '',
    title: question.questionText || '',
    link: routePath('projects.dmp.question', {
      projectId,
      dmpId,
    }) + `/${question.id}`,
    isAnswered: false
  })) || [];

  const plan = {
    id: planData?.plan?.id?.toString() || '',
    template_name: planData?.plan?.versionedTemplate?.template?.name || '',
    title: planData?.plan?.versionedTemplate?.template?.name || '',
    funder_name: planData?.plan?.project?.fundings?.[0]?.affiliation?.displayName || ''
  };

  return (
    <>
      <PageHeader
        title={sectionData?.section?.name || "Data and Metadata Formats"}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb>
              <Link href={routePath('app.home')}>
                {t('navigation.home')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.index')}>
                {t('navigation.projects')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.show', { projectId })}>
                {planData?.plan?.project?.title || 'Project'}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.dmp.show', {
                projectId,
                dmpId
              })}>
                {plan.title}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              {sectionData?.section?.name || "Data and Metadata Formats"}
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className={styles.contentWrapper}>
            {/* Subtle plan navigation for very large screens */}
            <nav
              className={styles.planNavigation}
              style={{ display: showNavigation ? 'block' : 'none' }}
              aria-labelledby="plan-nav-title"
            >
              <h2 id="plan-nav-title" className={styles.srOnly}>Plan Navigation</h2>

              <Link
                href={routePath('projects.dmp.show', { projectId, dmpId })}
                className={styles.planOverviewLink}
                aria-label="Go to plan overview"
              >
                Plan Overview
              </Link>

              {planSections.length > 0 && (
                <ul className={styles.sectionsList} role="list" aria-label="Plan sections">
                  {planSections.map((section) => (
                    <li key={section.sectionId}>
                      <Link
                        href={routePath('projects.dmp.section', {
                          projectId,
                          dmpId,
                          sectionId: section.sectionId
                        })}
                        className={`${styles.sectionLink} ${section.sectionId === sectionId ? styles.currentSection : ''
                          }`}
                        aria-label={`Go to ${section.sectionTitle} section`}
                        aria-current={section.sectionId === sectionId ? 'page' : undefined}
                      >
                        {section.sectionTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>

            <div className="container">
              <section aria-label={"Requirements"}>
                <h4>Requirements by {plan.funder_name}</h4>
                <p>
                  (DUMMY DATA) The Arctic Data Center requires when submitting to the Center,
                  include methods to create these types of data.
                </p>
                <p>
                  If using proprietary formats like Excel or MATLAB, plan to
                  convert them to open-source formats before submission. If
                  conversion isn&apos;t possible, explain why
                </p>

                <h4>Requirements by University of California</h4>
                <p>
                  (DUMMY DATA) The management of data and metadata is essential for supporting
                  research integrity, reproducibility and collaboration. This
                  section seeks to document the types and formats of data and
                  metadata that will be generated in your project. Properly
                  formatted and well-documented data enhance the visibility of
                  your research, promote collaboration among users and ensure
                  compliance with institutional policies and guidelines.
                </p>
              </section>

              {questions.length === 0 ? (
                <section className={styles.noQuestionsMessage}>
                  <h3>No Questions Available</h3>
                  <p>There are currently no questions in this section.</p>
                </section>
              ) : (
                questions.map((question) => (
                  <section
                    key={question.id}
                    className={styles.questionCard}
                    aria-labelledby={`question-title-${question.id}`}
                  >
                    <div className={styles.questionHeader}>
                      <div className={styles.questionTitle}>
                        <h3 id={`question-title-${question.id}`}>
                          {stripHtml(question.title)}
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
                                d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
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
                ))
              )}
            </div>
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
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/preservation">
                Data preservation
                <svg width="20" height="20" viewBox="0 0 20 20"
                  aria-hidden="true"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/protection">
                Data protection
                <svg width="20" height="20" viewBox="0 0 20 20"
                  aria-hidden="true"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/all">
                All topics
                <svg width="20" height="20" viewBox="0 0 20 20"
                  aria-hidden="true"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
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