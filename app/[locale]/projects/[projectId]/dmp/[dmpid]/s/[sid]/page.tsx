'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useParams } from 'next/navigation';
import { useTranslations } from "next-intl";

// GraphQL
import { useQuery } from '@apollo/client/react';
import {
  PublishedQuestionsDocument,
  PublishedSectionDocument,
  PlanDocument,
  MeDocument,
} from '@/generated/graphql';

// Components
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { DmpIcon } from '@/components/Icons';
import ErrorMessages from '@/components/ErrorMessages';
import PageHeader from "@/components/PageHeader";
import SafeHtml from '@/components/SafeHtml';
import GuidancePanel from '@/components/GuidancePanel';
import Loading from '@/components/Loading';

// Utils and other
import { stripHtml } from '@/utils/general';
import { routePath } from '@/utils/routes';
import styles from './PlanOverviewSectionPage.module.scss';
import { useGuidanceData } from '@/app/hooks/useGuidanceData';
import { useGuidanceMutations } from "@/app/hooks/useGuidanceMutations";

interface VersionedQuestion {
  id: string;
  title: string;
  link: string;
  hasAnswer: boolean;
}

const PlanOverviewSectionPage: React.FC = () => {
  // Localization
  const t = useTranslations('PlanOverview');
  const Guidance = useTranslations('Guidance');
  const Section = useTranslations('SectionPage');

  // Get route params
  const params = useParams();
  const versionedSectionId = Number(params.sid);
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;

  // State for navigation visibility
  const [showNavigation, setShowNavigation] = useState(true);

  // Validate that dmpId is a valid number
  const planId = parseInt(dmpId);

  // Get user data
  const { data: me } = useQuery(MeDocument);

  const { data: questionsData, loading: questionsLoading, error: questionsError } = useQuery(PublishedQuestionsDocument, {
    variables: { planId, versionedSectionId },
    skip: !versionedSectionId
  });

  const { data: planData, loading: planLoading } = useQuery(PlanDocument, {
    variables: { planId },
    skip: !planId
  });

  const { data: sectionData, loading: sectionLoading } = useQuery(PublishedSectionDocument, {
    variables: { versionedSectionId },
    skip: !versionedSectionId
  });

  // versionedTemplateId for guidance filtering
  const versionedTemplateId = planData?.plan?.versionedTemplate?.id;

  // Use the guidance data hook to get section tags and matched guidance
  // as well as handlers for adding/removing guidance organizations
  const {
    sectionTagsMap,
    guidanceItems,
  } = useGuidanceData({
    planId: parseInt(dmpId),
    versionedSectionId
  });

  // Use guidance mutations hook (mutations only, no data)
  const {
    addGuidanceOrganization,
    removeGuidanceOrganization,
    clearError,
    guidanceError,
  } = useGuidanceMutations({
    planId: parseInt(dmpId),
    versionedSectionId
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
    return <Loading />;
  }

  if (questionsError) {
    return <div>{Section('errors.errorLoadingSections', { message: questionsError.message })}</div>;
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
              <h2 id="plan-nav-title" className={"hidden-accessibly"}>{Section('navigation.planNavigation')}</h2>

              <Link
                href={routePath('projects.dmp.show', { projectId, dmpId })}
                className={styles.planOverviewLink}
                aria-label="Go to plan overview"
              >
                {Section('navigation.planOverview')}
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
                {sectionData?.publishedSection?.requirements && (
                  <>
                    <h4>{t('headings.requirementsBy', { funder: plan.funder_name })}</h4>
                    <SafeHtml html={sectionData?.publishedSection?.requirements} />
                  </>
                )}

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
                  <h3>{Section('headings.noQuestionsAvailable')}</h3>
                  <p>{Section('headings.noQuestionsInSection')}</p>
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
                            aria-label={`Question status: ${question.hasAnswer ? t('question.answered') : t('question.notAnswered')}`}
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
          <div className="status-panel-content side-panel">
            <h2 className="h4">{Guidance('title')}</h2>
            <GuidancePanel
              userAffiliationId={me?.me?.affiliation?.uri}
              ownerAffiliationId={planData?.plan?.versionedTemplate?.owner?.uri}
              versionedTemplateId={versionedTemplateId!}
              guidanceItems={guidanceItems}
              sectionTags={sectionTagsMap}
              guidanceError={guidanceError}
              onAddOrganization={addGuidanceOrganization}
              onRemoveOrganization={removeGuidanceOrganization}
              onClearError={clearError}
            />
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewSectionPage;