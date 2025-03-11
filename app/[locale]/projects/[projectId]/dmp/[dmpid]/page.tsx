'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";

import {
  usePlanQuery,
  PlanSectionProgress
} from '@/generated/graphql';

//Components
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import PageHeader from "@/components/PageHeader";

import { toSentenceCase } from '@/utils/general';
import styles from './PlanOverviewPage.module.scss';

interface PlanMember {
  fullname: string;
  role: string[];
  email: string;
}


interface PlanOverviewInterface {
  id: number | null;
  doi: string;
  lastUpdated?: string;
  createdDate?: string;
  templateName: string;
  title: string;
  funderOpportunityNumber?: number | null;
  funderName: string;
  templateId: number | null;
  publishedStatus: string;
  visibility: string;
  members: PlanMember[];
  sections: PlanSectionProgress[];
}

const PlanOverviewPage: React.FC = () => {
  // Get projectId and planId params
  const params = useParams();
  const { dmpid: planId, projectId } = params; // From route /projects/:projectId/dmp/:dmpId
  // next-intl date formatter
  const formatter = useFormatter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [planData, setPlanData] = useState<PlanOverviewInterface>({
    id: null,
    doi: '',
    lastUpdated: '',
    createdDate: '',
    title: '',
    templateName: '',
    funderOpportunityNumber: null,
    funderName: '',
    templateId: null,
    publishedStatus: '',
    visibility: '',
    members: [],
    sections: []
  });

  // Localization keys
  const t = useTranslations('PlanOverview');
  const Global = useTranslations('Global');

  // Get Plan using planId
  const { data, loading, error } = usePlanQuery(
    {
      variables: { planId: Number(planId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // const plan = {
  //   id: "plan_123",
  //   template_name: "NSF Polar Programs",
  //   title: "NSF Polar Programs",
  //   funder_id: "nsf_1",
  //   funder_name: "National Science Foundation",
  //   template_id: "temp_456",
  //   published_status: "Draft",
  //   visibility: "Not Published",
  //   members: [
  //     {
  //       fullname: "Frederick Ice",
  //       role: "PI",
  //       email: "fred.ice@example.com"
  //     },
  //     {
  //       fullname: "Jennifer Frost",
  //       role: "Contributor",
  //       email: "jfrost@example.com"
  //     }
  //   ],

  //   adjust_funder_url: "/en-US/projects/proj_2425/dmp/xxx/funder",
  //   adjust_members_url: "/en-US/projects/proj_2425/dmp/xxx/members",
  //   adjust_researchoutputs_url: "/en-US/projects/proj_2425/dmp/xxx/research-outputs",
  //   download_url: "/en-US/projects/proj_2425/dmp/xxx/download",
  //   feedback_url: "/en-US/projects/proj_2425/dmp/xxx/feedback",


  //   research_output_count: 3,
  //   sections: [
  //     {
  //       section_title: "Roles and Responsibilities",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
  //       id: "sect_1",
  //       progress: 1
  //     },
  //     {
  //       section_title: "Types of Data",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2545",
  //       id: "sect_2",
  //       progress: 1
  //     },
  //     {
  //       section_title: "Data and Metadata formats",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2546",
  //       id: "sect_3",
  //       progress: 2
  //     },
  //     {
  //       section_title: "Policies for Access and Sharing",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2547",
  //       id: "sect_4",
  //       progress: 1
  //     },
  //     {
  //       section_title: "Policies for reuse and re-distribution",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2548",
  //       id: "sect_5",
  //       progress: 0
  //     },
  //     {
  //       section_title: "Plans for archiving and preservation",
  //       link: "/en-US/projects/proj_2425/dmp/xxx/s/2549",
  //       id: "sect_6",
  //       progress: 0
  //     }
  //   ],
  //   doi: "10.12345/example.123",
  //   last_updated: "2024-04-01",
  //   created_date: "2023-07-18"
  // };

  const adjustFunderUrl = `/projects/${projectId}/dmp/${planId}/funder`;
  const adjustMembersUrl = `/projects/${projectId}/dmp/${planId}/members`;
  const adjustResearchoutputsUrl = `/projects/${projectId}/dmp/${planId}/research-outputs`;
  const downloadUrl = `/projects/${projectId}/dmp/${planId}/download`;
  const feedbackUrl = `/projects/${projectId}/dmp/${planId}/feedback`;

  const researchOutputCount = 3;
  // Format date using next-intl date formatter
  const formatDate = (date: string) => {
    const formattedDate = formatter.dateTime(new Date(Number(date)), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    // Replace slashes with hyphens
    return formattedDate.replace(/\//g, '-');
  }


  useEffect(() => {
    // When data from backend changes, set project data in state
    if (data && data.plan) {
      const doiRegex = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)([^\/\s]+\/[^\/\s]+)/i;
      const match = data?.plan?.dmpId?.match(doiRegex);
      const doi = (match && match[1]) ? match[1] : data?.plan?.dmpId;
      setPlanData({
        id: Number(data?.plan.id) ?? null,
        doi: doi ?? '',
        lastUpdated: formatDate(data?.plan?.modified ?? ''),
        createdDate: formatDate(data?.plan?.created ?? ''),
        templateName: data?.plan?.versionedTemplate?.template?.name ?? '',
        title: data?.plan?.project?.title ?? '',
        funderOpportunityNumber: Number(data?.plan?.project?.funders?.[0]?.funderOpportunityNumber) ?? '',
        funderName: data?.plan?.project?.funders?.[0]?.affiliation?.displayName ?? '',
        templateId: data?.plan?.versionedTemplate?.template?.id ?? null,
        publishedStatus: toSentenceCase(data?.plan?.status ?? ''),
        visibility: toSentenceCase(data?.plan?.visibility ?? ''),
        members: data.plan.contributors
          ?.filter((member) => member !== null) // Filter out null
          .map((member) => ({
            fullname: `${member?.projectContributor?.givenName} ${member?.projectContributor?.surName}`,
            email: member?.projectContributor?.email ?? '',
            role: (member?.projectContributor?.contributorRoles ?? []).map((role) => role.label),
          })) ?? [],
        sections: data?.plan?.sections ?? [],

      });
    }
  }, [data]);


  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={planData.title}
        description={t('page.pageDescription')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects/proj_2425/">{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{planData.title}</Breadcrumb>
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
                    {planData.funderName}
                  </p>
                </div>
                <Link href={adjustFunderUrl}
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
                    {planData.members.map((member, index) => (
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
                <Link href={adjustMembersUrl}
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
                    {t('outputs.count', { count: researchOutputCount })}
                  </p>
                </div>
                <Link href={adjustResearchoutputsUrl}
                  aria-label={t('outputs.edit')}>
                  {t('outputs.edit')}
                </Link>
              </section>
            </div>


            {planData.sections.map((section) => (
              <section
                key={section.sectionId}
                className={styles.planSectionsList}
                aria-labelledby={`section - title - ${section.sectionId} `}
              >
                <div className={styles.planSectionsHeader}>
                  <div className={styles.planSectionsTitle}>
                    <h3 id={`section - title - ${section.sectionId} `}>
                      {section.sectionTitle}
                    </h3>
                    <p
                      aria-label={`${section.answeredQuestions} out of ${section.totalQuestions} questions answered for ${section.sectionTitle}`}>
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
                          current: section.answeredQuestions,
                          total: section.totalQuestions
                        })} {t('sections.questionsAnswered')}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/ en - US / projects / ${projectId} / dmp / ${planId} /s/${section.sectionId} `}
                    aria-label={t('sections.updateSection', {
                      title: section.sectionTitle
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
                <p>{planData.lastUpdated}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.publishedStatus')}</h3>
                <p>{planData.publishedStatus}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.doi')}</h3>
                <p>{planData.doi || t('status.notPublished')}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.visibilitySettings')}</h3>
                <p>{planData.visibility}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.download.title')}</h3>
                <p>
                  <Link
                    href={downloadUrl}>{t('status.download.downloadPDF')}</Link>
                </p>
                <p>
                  {t('status.download.draftInfo')} <Link
                    href="#">{t('status.download.learnMore')}</Link>
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
                    href={feedbackUrl}>{t('status.feedback.manageAccess')}</Link>
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
