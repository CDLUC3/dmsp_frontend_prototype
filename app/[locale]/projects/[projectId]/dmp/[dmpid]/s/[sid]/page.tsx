'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useParams } from 'next/navigation';
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewSectionPage.module.scss';
import { useTranslations } from "next-intl";
import Image from 'next/image';
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {
  usePublishedQuestionsQuery,
  usePublishedSectionQuery,
  usePlanQuery,
} from '@/generated/graphql';
import { stripHtml } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { DmpIcon } from '@/components/Icons';
import ErrorMessages from '@/components/ErrorMessages';
import ExpandableContentSection from '@/components/ExpandableContentSection';

interface VersionedQuestion {
  id: string;
  title: string;
  link: string;
  hasAnswer: boolean;
}

const PlanOverviewSectionPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const Global = useTranslations('Global');
  const params = useParams();
  const versionedSectionId = Number(params.sid);
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;

  // State for navigation visibility
  const [showNavigation, setShowNavigation] = useState(true);

  // Validate that dmpId is a valid number
  const planId = parseInt(dmpId);

  const { data: questionsData, loading: questionsLoading, error: questionsError } = usePublishedQuestionsQuery({
    variables: { planId, versionedSectionId },
    skip: !versionedSectionId
  });

  const { data: sectionData, loading: sectionLoading } = usePublishedSectionQuery({
    variables: { versionedSectionId },
    skip: !versionedSectionId
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

      const distanceToBottom = documentHeight - scrollTop - windowHeight;

      // Hide if we're within 200px of the bottom
      setShowNavigation(distanceToBottom > 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple error handling - check for invalid DMP ID
  if (isNaN(planId)) {
    return <ErrorMessages errors={[t('errors.invalidDmpId')]} />;
  }

  // Loading states
  if (questionsLoading || sectionLoading || planLoading) {
    return <div>Loading questions...</div>;
  }

  if (questionsError) {
    return <div>Error loading questions: {questionsError.message}</div>;
  }

  // Plan sections data for rendering
  const planSections = planData?.plan?.versionedSections || [];
  const sectionBelongsToPlan = planSections.some(section => section.versionedSectionId === versionedSectionId);

  // Check if section belongs to this plan
  if (!sectionBelongsToPlan) {
    return <ErrorMessages errors={[t('errors.sectionNotFound')]} />;
  }

  // Check for questions - show message if none
  const questions: VersionedQuestion[] = questionsData?.publishedQuestions?.filter((question): question is NonNullable<typeof question> => question !== null).map((question) => ({
    id: question.id?.toString() || '',
    title: question.questionText || '',
    link: routePath('projects.dmp.versionedQuestion.detail', {
      projectId, dmpId, versionedSectionId, versionedQuestionId: String(question.id)
    }),
    hasAnswer: question.hasAnswer || false
  })) || [];

  const plan = {
    id: planData?.plan?.id?.toString() || '',
    title: planData?.plan?.versionedTemplate?.template?.name || '',
    funder_name: planData?.plan?.project?.fundings?.[0]?.affiliation?.displayName || ''
  };

  return (
    <>
      <PageHeader
        title={sectionData?.publishedSection?.name || "Data and Metadata Formats"}
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
              {sectionData?.publishedSection?.name || "Data and Metadata Formats"}
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
                    <li key={section.versionedSectionId}>
                      <Link
                        href={routePath('projects.dmp.show', {
                          projectId,
                          dmpId
                        })}
                        className={`${styles.sectionLink} ${section.versionedSectionId === versionedSectionId ? styles.currentSection : ''
                          }`}
                        aria-label={`Go to ${section.title} section`}
                        aria-current={section.versionedSectionId === versionedSectionId ? 'page' : undefined}
                      >
                        {section.title}
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
                            aria-label={`Question status: ${question.hasAnswer ? 'Completed' : 'Not started'}`}
                          >
                            <DmpIcon
                              icon={question.hasAnswer ? 'check_circle' : 'cancel'}
                              classes={`${styles.progressIcon} ${!question.hasAnswer ? styles.progressIconInactive : ''}`}
                            />
                            {question.hasAnswer ? t('question.answered') : t('question.notAnswered')}
                          </span>
                        </p>
                      </div>
                      <Link
                        href={question.link}
                        aria-label={t('sections.ariaLabel', {
                          action: question.hasAnswer ? t('sections.update') : t('sections.start'),
                          title: question.title
                        })}
                        className="react-aria-Button react-aria-Button--secondary"
                      >
                        {question.hasAnswer ? t('sections.update') : t('sections.start')}
                      </Link>
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </ContentContainer>

        <SidebarPanel>

          <div className={styles.headerWithLogo}>
            <h2 className="h4">{Global('bestPractice')}</h2>
            <Image
              className={styles.Logo}
              src="/images/DMP-logo.svg"
              width="140"
              height="16"
              alt="DMP Tool"
            />
          </div>


          <ExpandableContentSection
            id="data-description"
            heading={Global('dataDescription')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}
          >
            <p>
              Give a summary of the data you will collect or create, noting the content, coverage and data type, e.g., tabular data, survey data, experimental measurements, models, software, audiovisual data, physical samples, etc.
            </p>
            <p>
              Consider how your data could complement and integrate with existing data, or whether there are any existing data or methods that you could reuse.
            </p>
            <p>
              Indicate which data are of long-term value and should be shared and/or preserved.

            </p>
            <p>
              If purchasing or reusing existing data, explain how issues such as copyright and IPR have been addressed. You should aim to minimize any restrictions on the reuse (and subsequent sharing) of third-party data.

            </p>

          </ExpandableContentSection>

          <ExpandableContentSection
            id="data-format"
            heading={Global('dataFormat')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}

          >
            <p>
              Clearly note what format(s) your data will be in, e.g., plain text (.txt), comma-separated values (.csv), geo-referenced TIFF (.tif, .tfw).
            </p>

          </ExpandableContentSection>

          <ExpandableContentSection
            id="data-volume"
            heading={Global('dataVolume')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}
          >
            <p>
              Note what volume of data you will create in MB/GB/TB. Indicate the proportions of raw data, processed data, and other secondary outputs (e.g., reports).
            </p>
            <p>
              Consider the implications of data volumes in terms of storage, access, and preservation. Do you need to include additional costs?
            </p>
            <p>
              Consider whether the scale of the data will pose challenges when sharing or transferring data between sites; if so, how will you address these challenges?
            </p>
          </ExpandableContentSection>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewSectionPage;