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
  ListBoxItem,
  Modal,
} from 'react-aria-components';
import {
  PlanStatus,
  PlanVisibility,
  usePlanQuery,
  usePublishPlanMutation,
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
import {
  FormSelect,
  RadioGroupComponent
} from '@/components/Form';

import logECS from '@/utils/clientLogger';
import { toSentenceCase } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { useToast } from '@/context/ToastContext';
import styles from './PlanOverviewPage.module.scss';

interface PlanMember {
  fullname: string;
  role: string[];
  orcid: string;
  isPrimaryContact: boolean;
  email: string;
}

interface ListItemsInterface {
  id: number;
  content: JSX.Element;
  completed: boolean;
}[]

interface PlanOverviewInterface {
  id: number | null;
  dmpId: string;
  doi: string;
  lastUpdated?: string;
  createdDate?: string;
  templateName: string;
  title: string;
  status: string;
  funderOpportunityNumber?: number | null;
  funderName: string;
  templateId: number | null;
  publishedStatus: string;
  visibility: string;
  members: PlanMember[];
  sections: PlanSectionProgress[];
  percentageAnswered: number;
}

const PUBLISHED = 'Published';
const UNPUBLISHED = 'Unpublished';

const radioData = {
  radioGroupLabel: "Set visibility of yoru plan",
  radioButtonData: [
    {
      value: 'public',
      label: 'Public',
      description: <><strong>All metadata will be visible to any user. Researchers will be able to view the contents of the plan itself.</strong></>
    },
    {
      value: 'organizational',
      label: 'Organization only',
      description: <>The full plan will be visible to anyone within your Organization. <strong>Only basic metadata about your plan</strong> (title and collaborators) will be visible to users outside your organization.</>
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only basic metadata about your plan (title and collaborators) will be visible to other users.'
    }
  ]
}

// Status options for dropdown
const planStatusOptions = Object.entries(PlanStatus).map(([name, id]) => ({
  id,
  name
}));

const testSectionsData = [
  {
    answeredQuestions: 2,
    displayOrder: 1,
    sectionId: 1,
    sectionTitle: "Roles & Responsibilities",
    totalQuestions: 5
  },
  {
    answeredQuestions: 1,
    displayOrder: 2,
    sectionId: 2,
    sectionTitle: "Metadata",
    totalQuestions: 3
  },
  {
    answeredQuestions: 2,
    displayOrder: 3,
    sectionId: 3,
    sectionTitle: "Sharing/Copying Issues",
    totalQuestions: 5
  },
  {
    answeredQuestions: 2,
    displayOrder: 4,
    sectionId: 4,
    sectionTitle: "Long-term Preservation",
    totalQuestions: 5
  },

]

const PlanOverviewPage: React.FC = () => {
  // Get projectId and planId params
  const params = useParams();
  const { dmpid: planId, projectId } = params; // From route /projects/:projectId/dmp/:dmpId
  // next-intl date formatter
  const formatter = useFormatter();
  const toastState = useToast(); // Access the toast state from context

  const errorRef = useRef<HTMLDivElement | null>(null);
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const [checklistItems, setCheckListItems] = useState<ListItemsInterface[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [planVisibility, setPlanVisibility] = useState<PlanVisibility>(PlanVisibility.Private);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEditingPlanStatus, setIsEditingPlanStatus] = useState(false);
  const [planData, setPlanData] = useState<PlanOverviewInterface>({
    id: null,
    dmpId: '',
    doi: '',
    lastUpdated: '',
    createdDate: '',
    title: '',
    status: '',
    templateName: '',
    funderOpportunityNumber: null,
    funderName: '',
    templateId: null,
    publishedStatus: '',
    visibility: '',
    members: [],
    sections: [],
    percentageAnswered: 0
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

  // Initialize publish plan mutation
  const [publishPlanMutation] = usePublishPlanMutation();

  const adjustFunderUrl = `/projects/${projectId}/dmp/${planId}/funder`;
  const adjustMembersUrl = `/projects/${projectId}/dmp/${planId}/members`;
  const adjustResearchoutputsUrl = `/projects/${projectId}/dmp/${planId}/research-outputs`;
  const downloadUrl = `/projects/${projectId}/dmp/${planId}/download`;
  const feedbackUrl = `/projects/${projectId}/dmp/${planId}/feedback`;
  const changePrimaryContact = `/projects/${projectId}/dmp/${planId}/members`;

  //TODO: Get research output count from backend
  const researchOutputCount = 3;

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    const selection = value.toUpperCase();
    if (Object.values(PlanVisibility).includes(selection as PlanVisibility)) {
      setPlanVisibility(selection as PlanVisibility);
    } else {
      console.error(`Invalid visibility value: ${value}`);
    }
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = "Successfully published your plan";
    toastState.add(successMessage, { type: 'success' });
  }



  const updatePlan = async (visibility: PlanVisibility) => {
    try {
      const response = await publishPlanMutation({
        variables: {
          planId: Number(planId),
          visibility
        },
      })

      if (response) {
        const responseErrors = response.data?.publishPlan?.errors;
        // If there is a general error, set it in the pageErrors state
        if (responseErrors?.general) {
          setErrorMessages([responseErrors.general]);
        } else {
          setIsMarkCompleteModalOpen(false);
          showSuccessToast();
        }
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        //close modal
        setIsMarkCompleteModalOpen(false);
      } else {
        setErrors(prevErrors => [...prevErrors, Global('messaging.errors.somethingWentWrong')]);
        logECS('error', 'updatePlan', {
          error: err,
          url: {
            path: `/project/${projectId}/dmp/${planId}`
          }
        });
      };
    }
  }

  const handlePlanStatusChange = (e) => {
    e.preventDefault = true;
    setIsEditingPlanStatus(true);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as PlanVisibility;

    await updatePlan(visibility);
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

  const handlePlanStatusForm = (e) => {
    e.preventDefault();
    setIsEditingPlanStatus(false);
  }

  const calculatePercentageAnswered = (sections: PlanSectionProgress[]) => {
    if (sections.length === 0) return 0;
    const totalAnswered = sections.reduce((sum, section) => sum + section.answeredQuestions, 0);
    const totalQuestions = sections.reduce((sum, section) => sum + section.totalQuestions, 0);
    const overallPercentage = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
    return Math.round(overallPercentage);
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
        dmpId: data?.plan.dmpId ?? '',
        lastUpdated: formatDate(data?.plan?.modified ?? ''),
        createdDate: formatDate(data?.plan?.created ?? ''),
        templateName: data?.plan?.versionedTemplate?.template?.name ?? '',
        title: data?.plan?.project?.title ?? '',
        status: data?.plan?.status ?? '',
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
            orcid: member?.projectContributor?.orcid ?? '',
            isPrimaryContact: member?.isPrimaryContact ?? false,
            role: (member?.projectContributor?.contributorRoles ?? []).map((role) => role.label),
          })) ?? [],
        sections: testSectionsData ?? [],
        percentageAnswered: calculatePercentageAnswered(testSectionsData ?? []) ?? 0,
      });
    }
  }, [data]);


  useEffect(() => {
    if (queryError) {
      setErrors(prev => [...prev, queryError.message]);
    }
  }, [queryError])

  useEffect(() => {
    const listItems = [
      {
        id: 1,
        content: (
          <>
            <strong>have a primary contact <Link href={changePrimaryContact} onPress={() => setIsMarkCompleteModalOpen(false)}>Jane Doe</Link></strong>
          </>
        ),
        completed: planData.members.some(member => member.isPrimaryContact),
      },
      {
        id: 2,
        content: (
          <>
            marked your plan as <Link href="#" onPress={() => setIsMarkCompleteModalOpen(false)}>complete</Link>
          </>
        ),
        completed: planData.status === 'COMPLETE',
      },
      {
        id: 3,
        content: (
          <>
            have answered at least 50% of the questions (you answered {planData.percentageAnswered}%)
          </>
        ),
        completed: planData.percentageAnswered >= 50,
      },
      {
        id: 4,
        content: (
          <>
            have identified your (<Link href={adjustFunderUrl} onPress={() => setIsMarkCompleteModalOpen(false)}>funder(s)</Link>)
          </>
        ),
        completed: !!planData.funderName, // Example: Check if funderName exists
      },
      {
        id: 5,
        content: <>completed all fields marked as "required"</>,
        completed: false, // Example: Mark as not completed
      },
      {
        id: 6,
        content: (
          <>
            have designated the ORCiD for at least one of the <Link href={adjustMembersUrl} onPress={() => setIsMarkCompleteModalOpen(false)}>Project Members</Link>
          </>
        ),
        completed: planData.members.some(member => member.orcid), // Example: Check if any member has an ORCiD
      },
    ];

    setCheckListItems(listItems);
  }, [planData]);

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  const handleDialogCloseBtn = () => {
    setIsMarkCompleteModalOpen(false);
    setStep(1);
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
                    href={`/projects/${projectId}/dmp/${planId}/s/${section.sectionId}`}
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
          <div className={`${styles.statusPanelContent} ${styles.sidePanel} `}>
            <div className={`${styles.buttonContainer} mb - 5`}>
              <Button className="secondary">Preview</Button>
              <Button
                onPress={() => setIsMarkCompleteModalOpen(true)}
              >
                Publish
              </Button>
            </div>
            <div className={styles.sidePanelContent}>
              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>Feedback</h3>
                  <p>No feedback</p>
                </div>
                <Link href={feedbackUrl} aria-label="Request feedback" >
                  Request
                </Link >
              </div >
              {isEditingPlanStatus ? (
                <div>
                  <h3>Plan Status</h3>
                  <Form onSubmit={handlePlanStatusForm}>
                    <FormSelect
                      label=""
                      ariaLabel="primary contact selection"
                      isRequired
                      name="institution"
                      items={planStatusOptions}
                      errorMessage={"Selection is required"}
                      description={"Select a plan status"}
                      onSelectionChange={(selected) => setPlanStatus(selected as PlanStatus)}
                      selectedKey={planStatus ?? planData.status}
                    >
                      {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                    </FormSelect>
                    {isEditingPlanStatus && (
                      <Button type="submit">{Global('buttons.save')}</Button>
                    )}
                  </Form>
                </div>
              ) : (
                <div className={`${styles.panelRow} mb-5`}>
                  <div>
                    <h3>Plan Status</h3>
                    <p>{planData.status}</p>
                  </div>
                  <Link className={`${styles.sidePanelLink} react-aria-Link`} onPress={handlePlanStatusChange} aria-label="plan status">
                    Update
                  </Link>
                </div>
              )}

              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>Publish Status</h3>
                  <p>{planData.dmpId ? PUBLISHED : UNPUBLISHED}</p>
                </div>
                <Link className={`${styles.sidePanelLink} react-aria-Link`} onPress={() => setIsMarkCompleteModalOpen(true)} aria-label="Publish plan">
                  Publish
                </Link>
              </div>
              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>Download</h3>
                </div>
                <Link href={downloadUrl} aria-label="download">
                  Download
                </Link>
              </div>
            </div >
          </div >

        </SidebarPanel >
      </LayoutWithPanel >

      <Modal isDismissable
        isOpen={isMarkCompleteModalOpen}
        data-testid="modal"
      >

        {step === 1 && (
          <Dialog>
            <div className={`${styles.markAsCompleteModal} ${styles.dialogWrapper}`}>

              <ErrorMessages errors={errors} ref={errorRef} />
              <Heading slot="title">Publish</Heading>

              <p>Publishing a Data Management Plan (DMP) assigns it a Digital Object Identifier (DOI). By publishing, you&rsquo;ll be able to link this plan
                to your ORCiD, and to project outputs such articles which will make it easier to show that you met your funder&rsquo;s requirements by the end of the project.
              </p>

              <p>
                This DOI uniquely identifies the DMP, facilitating easy reference and access in the future.
              </p>

              <Heading level={2}>Before you publish your plan, we strongly recommend that you:</Heading>

              <ul className={styles.checkList}>
                {checklistItems
                  .filter(item => item.completed) // Filter for completed items
                  .map(item => (
                    <li key={item.id} className={styles.iconTextListItem}>
                      <div className={styles.iconWrapper}>
                        <DmpIcon
                          icon="check_circle_black"
                        />
                      </div>
                      <div className={styles.textWrapper}>
                        {item.content}
                      </div>
                    </li>
                  ))}

                {/* Render incomplete items next */}
                {checklistItems
                  .filter(item => !item.completed) // Filter for incomplete items
                  .map(item => (
                    <li key={item.id} className={styles.iconTextListItem}>
                      <div className={styles.iconWrapper}>
                        <DmpIcon
                          icon="error_circle"
                        />
                      </div>
                      <div className={styles.textWrapper}>
                        {item.content}
                      </div>
                    </li>
                  ))}
              </ul>

              <p>
                <strong>{checklistItems.filter(item => !item.completed).length} item(s) can be fixed</strong>
              </p>

              <div className="modal-actions">
                <div className="">
                  <Button data-secondary onPress={handleDialogCloseBtn}>Close</Button>
                </div>
                <div className="">
                  <Button
                    type="submit"
                    onPress={() => setStep(2)}
                  >
                    Next: Set visibility &gt;
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}

        {step === 2 && (
          <Dialog>
            <div className={`${styles.markAsCompleteModal} ${styles.dialogWrapper}`}>
              <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

                <ErrorMessages errors={errors} ref={errorRef} />
                <Heading slot="title">Publish: set visibility</Heading>

                <p>
                  Great, publishing your plan has many benefits.
                </p>

                <Heading level={2}>Set the visibility of your plan</Heading>

                <RadioGroupComponent
                  name="radioGroup"
                  value={planVisibility.toLowerCase()}
                  radioGroupLabel={radioData.radioGroupLabel}
                  radioButtonData={radioData.radioButtonData}
                  onChange={handleRadioChange}
                />

                <div className="modal-actions">
                  <div className="">
                    <Button data-secondary onPress={handleDialogCloseBtn}>Close</Button>
                  </div>
                  <div className="">
                    <Button type="submit">Publish</Button>
                  </div>
                </div>

              </Form>
            </div>
          </Dialog>
        )}


      </Modal>
    </>
  );
}

export default PlanOverviewPage;
