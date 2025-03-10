'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewPage.module.scss';
import {useTranslations} from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {routePath} from '@/utils/routes';

const PlanOverviewPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const projectId = 'proj_2425';
  const dmpId = 'xxx';

  const plan = {
    id: "plan_123",
    template_name: "NSF Polar Programs",
    title: "NSF Polar Programs",
    funder_id: "nsf_1",
    funder_name: "National Science Foundation",
    template_id: "temp_456",
    published_status: "Draft",
    visibility: "Not Published",
    members: [
      {
        fullname: "Frederick Ice",
        role: "PI",
        email: "fred.ice@example.com"
      },
      {
        fullname: "Jennifer Frost",
        role: "Contributor",
        email: "jfrost@example.com"
      }
    ],

    adjust_funder_url: routePath('projects.dmp.funder', { projectId, dmpId }),
    adjust_members_url: routePath('projects.dmp.members', { projectId, dmpId }),
    adjust_researchoutputs_url: routePath('projects.dmp.research-outputs', { projectId, dmpId }),
    download_url: routePath('projects.dmp.download', { projectId, dmpId }),
    feedback_url: routePath('projects.dmp.feedback', { projectId, dmpId },{"saved":"true"}),

    research_output_count: 3,
    sections: [
      {
        section_title: "Roles and Responsibilities",
        id: "sect_1",
        sectionId: "2544",
        progress: 1
      },
      {
        section_title: "Types of Data",
        id: "sect_2",
        sectionId: "2545",
        progress: 1
      },
      {
        section_title: "Data and Metadata formats",
        id: "sect_3",
        sectionId: "2546",
        progress: 2
      },
      {
        section_title: "Policies for Access and Sharing",
        id: "sect_4",
        sectionId: "2547",
        progress: 1
      },
      {
        section_title: "Policies for reuse and re-distribution",
        id: "sect_5",
        sectionId: "2548",
        progress: 0
      },
      {
        section_title: "Plans for archiving and preservation",
        id: "sect_6",
        sectionId: "2549",
        progress: 0
      }
    ],
    doi: "10.12345/example.123",
    last_updated: "2024-04-01",
    created_date: "2023-07-18"
  };

  return (
    <>
      <PageHeader
        title={plan.title}
        description={t('page.pageDescription')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb><Link
              href={routePath('app.home')}>
              {t('navigation.home')}
            </Link></Breadcrumb>
            <Breadcrumb><Link
              href={routePath('projects.index')}>
              {t('navigation.projects')}
            </Link></Breadcrumb>
            <Breadcrumb><Link
              href={routePath('projects.show', { projectId })}>
              Project name
            </Link></Breadcrumb>
            <Breadcrumb>{plan.title}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className={"container"}>
            <div className={styles.planOverview}>
              <section className={styles.planOverviewItem}
                       aria-labelledby="funder-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="funder-title"
                      className={styles.planOverviewItemTitle}>
                    {t('funder.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {plan.funder_name}
                  </p>
                </div>
                <Link href={plan.adjust_funder_url}
                      aria-label={t('funder.edit')}>
                  {t('funder.edit')}
                </Link>
              </section>

              <section className={styles.planOverviewItem}
                       aria-labelledby="members-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="members-title"
                      className={styles.planOverviewItemTitle}>
                    {t('members.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {plan.members.map((member, index) => (
                      <span key={index}>
                        {t('members.info', {
                          name: member.fullname,
                          role: member.role
                        })}
                        {index < plan.members.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
                <Link href={plan.adjust_members_url}
                      aria-label={t('members.edit')}>
                  {t('members.edit')}
                </Link>
              </section>

              <section className={styles.planOverviewItem}
                       aria-labelledby="outputs-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="outputs-title"
                      className={styles.planOverviewItemTitle}>
                    {t('outputs.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {t('outputs.count', { count: plan.research_output_count })}
                  </p>
                </div>
                <Link href={plan.adjust_researchoutputs_url}
                      aria-label={t('outputs.edit')}>
                  {t('outputs.edit')}
                </Link>
              </section>
            </div>


            {plan.sections.map((section) => (
              <section
                key={section.id}
                className={styles.planSectionsList}
                aria-labelledby={`section-title-${section.id}`}
              >
                <div className={styles.planSectionsHeader}>
                  <div className={styles.planSectionsTitle}>
                    <h3 id={`section-title-${section.id}`}>
                      {section.section_title}
                    </h3>
                    <p
                      aria-label={`${section.progress} out of 3 questions answered for ${section.section_title}`}>
                      <span
                        className={styles.progressIndicator}>
                        <svg
                          className={styles.progressIcon}
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
                        {t('sections.progress', {
                          current: section.progress,
                          total: 3
                        })} {t('sections.questionsAnswered')}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={routePath('projects.dmp.section', {
                      projectId,
                      dmpId,
                      sectionId: section.sectionId
                    })}
                    aria-label={t('sections.updateSection', {
                      title: section.section_title
                    })}
                    className={"react-aria-Button react-aria-Button--secondary"}
                  >
                    {t('sections.update')}
                  </Link>
                </div>
              </section>
            ))}


          </div>
        </ContentContainer>

        <SidebarPanel>
          <div className={styles.statusPanel}>
            <div className={styles.statusPanelHeader}>
              <h2>{t('status.title')}</h2>
            </div>
            <div className={styles.statusPanelContent}>
              <div className="mb-5">
                <h3>{t('status.lastUpdated')}</h3>
                <p>{plan.last_updated}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.publishedStatus')}</h3>
                <p>{plan.published_status}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.doi')}</h3>
                <p>{plan.doi || t('status.notPublished')}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.visibilitySettings')}</h3>
                <p>{plan.visibility}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.download.title')}</h3>
                <p>
                  <Link
                    href={plan.download_url}>{t('status.download.downloadPDF')}</Link>
                </p>
                <p>
                  {t('status.download.draftInfo')} <Link
                  href={routePath('help.dmp.download')}>
                  {t('status.download.learnMore')}
                </Link>
                </p>
                <button
                  className="react-aria-Button react-aria-Button--primary">
                  {t('status.download.markComplete')}
                </button>
              </div>
              <div className="mb-5">
                <h3>{t('status.feedback.title')}</h3>
                <p>{t('status.feedback.description')}</p>
                <p>
                  <Link
                    href={plan.feedback_url}>{t('status.feedback.manageAccess')}</Link>
                </p>
                <button
                  className="react-aria-Button react-aria-Button--secondary">
                  {t('status.feedback.requestFeedback')}
                </button>
              </div>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewPage;
