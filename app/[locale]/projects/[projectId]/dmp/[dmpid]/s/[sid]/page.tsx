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
  isAnswered: boolean;
}

const PlanOverviewSectionPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const Global = useTranslations('Global');
  const params = useParams();
  const versionedSectionId = Number(params.sid);
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;

  // State for navigation positioning with sticky-like behavior
  const [navPosition, setNavPosition] = useState({ left: '20px', top: '20px', display: 'block' });
  // Store the initial navigation position to prevent upward movement
  const [initialNavTop, setInitialNavTop] = useState<number | null>(null);
  // Mobile navigation state
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Validate that dmpId is a valid number
  const planId = parseInt(dmpId);

  const { data: questionsData, loading: questionsLoading, error: questionsError } = usePublishedQuestionsQuery({
    variables: { versionedSectionId },
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

  // Calculate navigation position and visibility
  useEffect(() => {
    const checkMobile = () => {
      const windowWidth = window.innerWidth;
      const isMobileView = windowWidth < 1024; // Adjust breakpoint as needed
      setIsMobile(isMobileView);
      if (isMobileView) {
        setIsMobileNavOpen(false); // Close mobile nav when switching to mobile
      }
    };

    const calculateNavPosition = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate if navigation would overlap with footer
      // Assume nav height is roughly 200px (estimated based on content)
      const estimatedNavHeight = 200;
      const distanceToBottom = documentHeight - scrollTop - windowHeight;
      const shouldShowNavigation = distanceToBottom > (estimatedNavHeight + 30);

      // Calculate the position for the navigation
      // The #App container has max-width: 1200px and is centered
      const appMaxWidth = 1200;
      const navWidth = 180;
      const marginBuffer = 20; // Space between nav and content

      // Find the LayoutWithPanel to align with the content area
      const layoutWithPanel = document.querySelector('.layout-with-panel') ||
                             document.querySelector('[data-testid="layout-with-panel"]');

      // Calculate positioning based on the actual LayoutWithPanel if possible
      let navLeftPosition;
      
      if (layoutWithPanel) {
        const layoutRect = layoutWithPanel.getBoundingClientRect();
        const contentContainer = layoutWithPanel.querySelector('.layout-content-container');
        
        if (contentContainer) {
          const contentRect = contentContainer.getBoundingClientRect();
          // Position nav to the left of the content container
          navLeftPosition = contentRect.left - navWidth - marginBuffer;
        } else {
          // Fallback: use layout container's left edge
          navLeftPosition = layoutRect.left - navWidth - marginBuffer;
        }
      } else {
        // Original fallback calculation
        const contentLeftEdge = Math.max((windowWidth - appMaxWidth) / 2, 0);
        navLeftPosition = contentLeftEdge - navWidth - marginBuffer;
      }

      // Check if there's enough space for the navigation
      // We need space for nav (180px) + margin (20px) + some buffer (20px)
      const minRequiredWidth = appMaxWidth + navWidth + marginBuffer + 40;
      const hasEnoughSpace = windowWidth >= minRequiredWidth && navLeftPosition > 0;

      // Calculate static-then-sticky top position (never moves up)
      let navTopPosition = '20px';
      let newInitialNavTop = initialNavTop;
      
      if (layoutWithPanel) {
        const layoutRect = layoutWithPanel.getBoundingClientRect();
        
        // Set initial position if not already set
        if (initialNavTop === null) {
          // Position nav at top of layout + 20px buffer
          const initialTop = Math.max(layoutRect.top + scrollTop + 20, 20);
          newInitialNavTop = initialTop;
          navTopPosition = `${Math.round(initialTop)}px`;
        } else {
          // True sticky behavior: nav follows content but never goes above threshold
          const layoutTop = layoutRect.top;
          const stickyThreshold = 20;
          
          // Calculate where the nav wants to be relative to the layout
          const desiredTop = layoutTop + stickyThreshold;
          
          // But never let it go above the sticky threshold
          const finalTop = Math.max(desiredTop, stickyThreshold);
          
          navTopPosition = `${Math.round(finalTop)}px`;
        }
      } else {
        // Fallback: if LayoutWithPanel not found, try to find PageHeader as secondary option
        const pageHeader = document.querySelector('.pageheader-container') || 
                          document.querySelector('.template-editor-header') ||
                          document.querySelector('[class*="pageheader"]');
        
        if (pageHeader) {
          const headerRect = pageHeader.getBoundingClientRect();
          
          if (initialNavTop === null) {
            // Position nav at bottom of header + 20px buffer
            const initialTop = Math.max(headerRect.bottom + scrollTop + 20, 20);
            newInitialNavTop = initialTop;
            navTopPosition = `${Math.round(initialTop)}px`;
          } else {
            const headerBottom = headerRect.bottom;
            navTopPosition = headerBottom <= 0 ? '20px' : `${Math.round(initialNavTop)}px`;
          }
        } else {
          // Final fallback: use a reasonable default position
          if (initialNavTop === null) {
            const fallbackTop = 120;
            newInitialNavTop = fallbackTop;
            navTopPosition = `${fallbackTop}px`;
          } else {
            navTopPosition = `${Math.round(initialNavTop)}px`;
          }
        }
      }

      // Batch state updates to prevent multiple re-renders
      if (newInitialNavTop !== initialNavTop) {
        setInitialNavTop(newInitialNavTop);
      }
      
      setNavPosition({
        left: hasEnoughSpace ? `${navLeftPosition}px` : '20px',
        top: navTopPosition,
        display: shouldShowNavigation && hasEnoughSpace ? 'block' : 'none'
      });
    };

    // Throttle scroll to prevent excessive calculations and reduce movement
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          calculateNavPosition();
          isScrolling = false;
        });
        isScrolling = true;
      }
      
      // Additional debouncing for final position
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        calculateNavPosition();
      }, 50);
    };

    const handleResize = () => {
      // Reset initial position on resize to recalculate properly
      setInitialNavTop(null);
      checkMobile();
      calculateNavPosition();
    };

    // Multiple calculation attempts to ensure proper positioning
    const calculateWithRetry = () => {
      calculateNavPosition();
      // Try again after a short delay if PageHeader wasn't found initially
      if (initialNavTop === null) {
        setTimeout(calculateNavPosition, 200);
        setTimeout(calculateNavPosition, 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', calculateNavPosition, { passive: true });
    
    // Check if mobile on initial load
    checkMobile();
    // Calculate initial position with multiple attempts
    calculateWithRetry();

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', calculateNavPosition);
    };
  }, [initialNavTop]); // Add initialNavTop to dependencies

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
    isAnswered: false
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
          <Breadcrumbs aria-label={Global('breadcrumbs.navigation')}>
            <Breadcrumb>
              <Link href={routePath('app.home')}>
                {Global('breadcrumbs.home')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.index')}>
                {Global('breadcrumbs.projects')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.show', { projectId })}>
                {Global('breadcrumbs.project')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath('projects.dmp.show', {
                projectId,
                dmpId
              })}>
                {Global('breadcrumbs.planOverview')}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              {Global('breadcrumbs.section')}
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      {/* Desktop navigation positioned outside content flow */}
      {!isMobile && (
        <nav
          className={styles.planNavigation}
          style={{ 
            display: navPosition.display,
            left: navPosition.left,
            top: navPosition.top
          }}
          aria-labelledby="plan-nav-title"
        >
          <h2 id="plan-nav-title" className={styles.srOnly}>Plan Navigation</h2>

          <Link
            href={routePath('projects.dmp.show', { projectId, dmpId })}
            className={styles.planOverviewLink}
            aria-label="Go to plan overview"
          >
            {Global('breadcrumbs.planOverview')}
          </Link>

          {planSections.length > 0 && (
            <ul className={styles.sectionsList} role="list" aria-label="Plan sections">
              {planSections.map((section) => (
                <li key={section.versionedSectionId}>
                  <Link
                    href={routePath('projects.dmp.versionedSection', {
                      projectId,
                      dmpId,
                      versionedSectionId: section.versionedSectionId
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
      )}

      {/* Mobile navigation - collapsible panel */}
      {isMobile && (
        <div className={styles.mobileNavContainer}>
          <button
            className={styles.mobileNavToggle}
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMobileNavOpen ? 'Close sections navigation' : 'Open sections navigation'}
          >
            <span className={styles.toggleText}>Sections</span>
            <span className={`${styles.toggleIcon} ${isMobileNavOpen ? styles.toggleIconOpen : ''}`}>
              ▼
            </span>
          </button>
          
          <div 
            id="mobile-nav-panel"
            className={`${styles.mobileNavPanel} ${isMobileNavOpen ? styles.mobileNavPanelOpen : ''}`}
            aria-hidden={!isMobileNavOpen}
          >
            <nav aria-labelledby="mobile-plan-nav-title">
              <h2 id="mobile-plan-nav-title" className={styles.srOnly}>Plan Navigation</h2>
              
              <Link
                href={routePath('projects.dmp.show', { projectId, dmpId })}
                className={styles.mobilePlanOverviewLink}
                aria-label="Go to plan overview"
                onClick={() => setIsMobileNavOpen(false)}
              >
                {Global('breadcrumbs.planOverview')}
              </Link>

              {planSections.length > 0 && (
                <ul className={styles.mobileSectionsList} role="list" aria-label="Plan sections">
                  {planSections.map((section) => (
                    <li key={section.versionedSectionId}>
                      <Link
                        href={routePath('projects.dmp.versionedSection', {
                          projectId,
                          dmpId,
                          versionedSectionId: section.versionedSectionId
                        })}
                        className={`${styles.mobileSectionLink} ${section.versionedSectionId === versionedSectionId ? styles.currentSection : ''
                          }`}
                        aria-label={`Go to ${section.title} section`}
                        aria-current={section.versionedSectionId === versionedSectionId ? 'page' : undefined}
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}

      <LayoutWithPanel>
        <ContentContainer>
          <div className={styles.contentWrapper}>

            <div className="container">
              <section aria-label={"Requirements"}>
                <h4 className="mt-0">Requirements by {plan.funder_name}</h4>
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
                            <DmpIcon
                              icon={question.isAnswered ? 'check_circle' : 'cancel'}
                              classes={`${styles.progressIcon} ${!question.isAnswered ? styles.progressIconInactive : ''}`}
                            />
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