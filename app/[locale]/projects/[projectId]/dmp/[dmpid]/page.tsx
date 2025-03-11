'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApolloError } from "@apollo/client";
import { useFormatter, useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  Form,
  Heading,
  Link,
  Modal,
} from 'react-aria-components';
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
import ErrorMessages from '@/components/ErrorMessages';
import { DmpIcon } from "@/components/Icons";

import logECS from '@/utils/clientLogger';
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
  const [isMarkCompleteModalOpen, setMarkCompleteModalOpen] = useState(false);
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
  const { data, loading, error: queryError } = usePlanQuery(
    {
      variables: { planId: Number(planId) },
      notifyOnNetworkStatusChange: true
    }
  );

  const adjustFunderUrl = `/projects/${projectId}/dmp/${planId}/funder`;
  const adjustMembersUrl = `/projects/${projectId}/dmp/${planId}/members`;
  const adjustResearchoutputsUrl = `/projects/${projectId}/dmp/${planId}/research-outputs`;
  const downloadUrl = `/projects/${projectId}/dmp/${planId}/download`;
  const feedbackUrl = `/projects/${projectId}/dmp/${planId}/feedback`;

  //TODO: Get research output count from backend
  const researchOutputCount = 3;

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveTemplate = async () => {
    try {

    } catch (err) {
      if (err instanceof ApolloError) {
        //close modal
        setMarkCompleteModalOpen(false);
      } else {
        setErrors(prevErrors => [...prevErrors, 'there was an error']);
        logECS('error', 'saveTemplate', {
          error: err,
          url: { path: '/template/[templateId]' }
        });
      };
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Do some stuff here

    await saveTemplate();
  };

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


  useEffect(() => {
    if (queryError) {
      setErrors(prev => [...prev, queryError.message]);
    }
  }, [queryError])


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

      <ErrorMessages errors={errors} ref={errorRef} />
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
                          role: member.role.map((role) => role).join(', ')
                        })}
                        {index < planData.members.length - 1 ? '; ' : ''}
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
                aria-labelledby={`section-title-${section.sectionId}`}
              >
                <div className={styles.planSectionsHeader}>
                  <div className={styles.planSectionsTitle}>
                    <h3 id={`section-title-${section.sectionId}`}>
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
                <Button
                  className="react-aria-Button react-aria-Button--primary"
                  onPress={() => setMarkCompleteModalOpen(true)}
                >
                  {t('status.download.markComplete')}
                </Button>
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

      <Modal isDismissable
        isOpen={isMarkCompleteModalOpen}
        data-testid="modal"
      >
        <Dialog>
          <div className={styles.markAsCompleteModal}>
            <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

              <ErrorMessages errors={errors} ref={errorRef} />
              <Heading slot="title">Marked as complete</Heading>

              <p>We have updated your plan to completed - if you have made a mistake you can mark it as incomplete</p>

              <Button className="tertiary" onPress={() => console.log("marked as incomplete")}>Mark as incomplete</Button>

              <Link href="/download">Download plan</Link>

              <Heading level={2}>Next step: Publish this plan</Heading>

              <p>
                Publishing a Data Management Plan (DMP) assigns it a Digital Object identifier (DOI). By publishing, you&apos;ll
                be able to l ink this plan to your ORCIiD, and to protect outputs such articles which will make it easier to show templateHistoryyou met your funder&apos;s
                requirements by the end of the project.
              </p>

              <p>
                This DOI uniquely identifies the DMP, facilitating easy reference and access in the future.
              </p>

              <p>
                Before you publish your plan, we strongly recommend that you:
              </p>

              <ul className={styles.checkList}>
                <li>
                  <DmpIcon icon="check_circle" /> have answered at least 50% of the questions
                </li>
                <li>
                  <DmpIcon icon="check_circle" /> have identified my funder(s)
                </li>
                <li>
                  <span>
                    <DmpIcon icon="error_circle" /> have designated the ORCiD for at least one of the Project Members(<Link href="#">fix this</Link>)
                  </span>
                </li>
                <li>
                  <DmpIcon icon="error_circle" /> another suggestion(<Link href="#">fix this</Link>)
                </li>
              </ul>
              <span><strong>2 item(s) can be fixed</strong></span>


              <div className="modal-actions">
                <div className="">
                  <Button data-secondary onPress={() => setMarkCompleteModalOpen(false)}>Close</Button>
                </div>
                <div className="">
                  <Button type="submit">Pubish the plan</Button>
                </div>
              </div>

            </Form>
          </div>
        </Dialog>
      </Modal>
    </>
  );
}

export default PlanOverviewPage;
