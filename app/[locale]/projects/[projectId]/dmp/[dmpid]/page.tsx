'use client';

import { useEffect, useRef, useReducer, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  PlanSectionProgress,
  PlanErrors
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
import { publishPlanAction } from './action';
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
  primaryContact: string;
  publishedStatus: string;
  visibility: string;
  members: PlanMember[];
  sections: PlanSectionProgress[];
  percentageAnswered: number;
}

const PUBLISHED = 'Published';
const UNPUBLISHED = 'Unpublished';



// Status options for dropdown
const planStatusOptions = Object.entries(PlanStatus).map(([name, id]) => ({
  id,
  name
}));


const initialState: {
  isModalOpen: boolean;
  checkListItems: ListItemsInterface[];
  errorMessages: string[];
  planVisibility: PlanVisibility;
  planStatus: PlanStatus | null;
  step: number;
  errors: string[];
  isEditingPlanStatus: boolean;
  planData: PlanOverviewInterface;
} = {
  isModalOpen: false,
  checkListItems: [] as ListItemsInterface[],
  errorMessages: [] as string[],
  planVisibility: PlanVisibility.Private,
  planStatus: null,
  step: 1,
  errors: [] as string[],
  isEditingPlanStatus: false,
  planData: {
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
    primaryContact: '',
    members: [] as PlanMember[],
    sections: [] as PlanSectionProgress[],
    percentageAnswered: 0,
  },
};

type Action =
  | { type: 'SET_IS_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_CHECKLIST_ITEMS'; payload: ListItemsInterface[] }
  | { type: 'SET_ERROR_MESSAGES'; payload: string[] }
  | { type: 'SET_PLAN_VISIBILITY'; payload: PlanVisibility }
  | { type: 'SET_PLAN_STATUS'; payload: PlanStatus | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_ERRORS'; payload: string[] }
  | { type: 'SET_IS_EDITING_PLAN_STATUS'; payload: boolean }
  | { type: 'SET_PLAN_DATA'; payload: PlanOverviewInterface };

type State = typeof initialState;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IS_MODAL_OPEN':
      return { ...state, isModalOpen: action.payload };
    case 'SET_CHECKLIST_ITEMS':
      return { ...state, checkListItems: action.payload };
    case 'SET_ERROR_MESSAGES':
      return { ...state, errorMessages: action.payload };
    case 'SET_PLAN_VISIBILITY':
      return { ...state, planVisibility: action.payload };
    case 'SET_PLAN_STATUS':
      return { ...state, planStatus: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_IS_EDITING_PLAN_STATUS':
      return { ...state, isEditingPlanStatus: action.payload };
    case 'SET_PLAN_DATA':
      return { ...state, planData: action.payload };
    default:
      return state;
  }
};

const PlanOverviewPage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Get projectId and planId params
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const dmpId = Array.isArray(params.dmpid) ? params.dmpid[0] : params.dmpid;
  const planId = Number(dmpId);
  // next-intl date formatter
  const formatter = useFormatter();
  const toastState = useToast(); // Access the toast state from context

  const errorRef = useRef<HTMLDivElement | null>(null);

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

  // Set URLs
  const FUNDER_URL = routePath('projects.dmp.funder', { projectId, dmpId: planId });
  const MEMBERS_URL = routePath('projects.dmp.members', { projectId, dmpId: planId });
  const RESEARCH_OUTPUT_URL = routePath('projects.dmp.research-outputs', { projectId, dmpId: planId });
  const DOWNLOAD_URL = routePath('projects.dmp.download', { projectId, dmpId: planId });
  const FEEDBACK_URL = routePath('projects.dmp.feedback', { projectId, dmpId: planId });
  const CHANGE_PRIMARY_CONTACT_URL = routePath('projects.dmp.members', { projectId, dmpId: planId });

  // Set radio button data
  const radioData = {
    radioGroupLabel: t('publishModal.publish.visibilityOptionsTitle'),
    radioButtonData: [
      {
        value: 'public',
        label: t('publishModal.publish.visibilityOptions.public.label'),
        description: <><strong>{t('publishModal.publish.visibilityOptions.public.description')}</strong></>
      },
      {
        value: 'organizational',
        label: t('publishModal.publish.visibilityOptions.organization.label'),
        description: <>{t.rich('publishModal.publish.visibilityOptions.organization.description', {
          strong: (chunks) => <strong>{chunks}</strong>
        })}</>
      },
      {
        value: 'private',
        label: t('publishModal.publish.visibilityOptions.private.label'),
        description: t('publishModal.publish.visibilityOptions.private.description')
      }
    ]
  }
  //TODO: Get research output count from backend
  const researchOutputCount = 3;

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    const selection = value.toUpperCase();
    if (Object.values(PlanVisibility).includes(selection as PlanVisibility)) {
      dispatch({
        type: 'SET_PLAN_VISIBILITY',
        payload: selection as PlanVisibility,
      })
    } else {
      console.error(`Invalid visibility value: ${value}`);
    }
  };

  const updatePlan = async (visibility: PlanVisibility) => {
    try {
      const response = await publishPlanAction({
        planId: Number(planId),
        visibility
      })

      if (response.redirect) {
        router.push(response.redirect);
      }

      return {
        success: response.success,
        errors: response.errors,
        data: response.data
      }
    } catch (error) {
      logECS('error', 'updatePlan', {
        error: error,
        url: {
          path: `/project/${projectId}/dmp/${planId}`
        }
      });
    }
    return {
      success: false,
      errors: ['Something went wrong. Please try again.'],
      data: null
    };
  }

  const handlePlanStatusChange = (e) => {
    e.preventDefault = true;
    dispatch({
      type: 'SET_IS_EDITING_PLAN_STATUS',
      payload: true
    });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as PlanVisibility;

    const result = await updatePlan(visibility);

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        dispatch({
          type: 'SET_ERROR_MESSAGES',
          payload: errors.length > 0 ? errors : [Global('messaging.somethingWentWrong')],
        })
      } else if (errors && typeof errors === 'object' && errors !== null) {
        const errorObj = errors as PlanErrors;
        // Handle errors as an object with general or field-level errors
        dispatch({
          type: 'SET_ERROR_MESSAGES',
          payload: [errors.general || Global('messaging.somethingWentWrong')]
        });
      }
    }
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
    dispatch({
      type: 'SET_IS_EDITING_PLAN_STATUS',
      payload: false
    });
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
      dispatch({
        type: 'SET_PLAN_DATA',
        payload: {
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
          primaryContact: data.plan.contributors
            ?.filter(member => member?.isPrimaryContact === true)
            ?.map(member => member?.projectContributor?.givenName + ' ' + member?.projectContributor?.surName)
            ?.join(', ') ?? '',
          members: data.plan.contributors
            ?.filter((member) => member !== null) // Filter out null
            .map((member) => ({
              fullname: `${member?.projectContributor?.givenName} ${member?.projectContributor?.surName}`,
              email: member?.projectContributor?.email ?? '',
              orcid: member?.projectContributor?.orcid ?? '',
              isPrimaryContact: member?.isPrimaryContact ?? false,
              role: (member?.projectContributor?.contributorRoles ?? []).map((role) => role.label),
            })) ?? [],
          sections: data?.plan?.sections ?? [],
          percentageAnswered: calculatePercentageAnswered(data?.plan?.sections ?? []) ?? 0,
        },
      })
    }
  }, [data]);


  useEffect(() => {
    if (queryError) {
      dispatch({
        type: 'SET_ERRORS',
        payload: [...state.errors, queryError.message]
      });
    }
  }, [queryError])

  useEffect(() => {
    const listItems = [
      {
        id: 1,
        content: (
          <>
            <strong>{t('publishModal.publish.checklistItem.primaryContact')} <Link href={CHANGE_PRIMARY_CONTACT_URL} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false })}>{state.planData.primaryContact}</Link></strong>
          </>
        ),
        completed: state.planData.members.some(member => member.isPrimaryContact),
      },
      {
        id: 2,
        content: (
          <>
            {t('publishModal.publish.checklistItem.complete')}
          </>
        ),
        completed: state.planData.status === 'COMPLETE',
      },
      {
        id: 3,
        content: (
          <>
            {t('publishModal.publish.checklistItem.percentageAnswered', { percentage: state.planData.percentageAnswered })}

          </>
        ),
        completed: state.planData.percentageAnswered >= 50,
      },
      {
        id: 4,
        content: (
          <>
            {t('publishModal.publish.checklistItem.funderText')} (<Link href={FUNDER_URL} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false })}>{t('publishModal.publish.checklistItem.funder')}</Link>)
          </>
        ),
        completed: !!state.planData.funderName, // Example: Check if funderName exists
      },
      {
        id: 5,
        content: <>{t('publishModal.publish.checklistItem.requiredFields')}</>,
        completed: false, // Example: Mark as not completed
      },
      {
        id: 6,
        content: (
          <>
            {t('publishModal.publish.checklistItem.orcidText')} <Link href={MEMBERS_URL} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false })}>{t('publishModal.publish.checklistItem.projectMembers')}</Link>
          </>
        ),
        completed: state.planData.members.some(member => member.orcid), // Example: Check if any member has an ORCiD
      },
    ];
    dispatch({
      type: 'SET_CHECKLIST_ITEMS',
      payload: listItems
    });
  }, [state.planData]);

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  const handleDialogCloseBtn = () => {
    dispatch({
      type: 'SET_IS_MODAL_OPEN',
      payload: false
    });
    dispatch({
      type: 'SET_STEP',
      payload: 1
    })
  }


  return (
    <>
      <PageHeader
        title={state.planData.title}
        description={t('page.pageDescription')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={Global('breadcrumbs.navigation')}>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{state.planData.title}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <ErrorMessages errors={state.errors} ref={errorRef} />
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
                    {state.planData.funderName}
                  </p>
                </div>
                <Link href={FUNDER_URL}
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
                    {state.planData.members.map((member, index) => (
                      <span key={index}>
                        {t('members.info', {
                          name: member.fullname,
                          role: member.role.map((role) => role).join(', ')
                        })}
                        {index < state.planData.members.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
                <Link href={MEMBERS_URL}
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
                <Link href={RESEARCH_OUTPUT_URL}
                  aria-label={t('outputs.edit')}>
                  {t('outputs.edit')}
                </Link>
              </section>
            </div>


            {state.planData.sections.map((section) => (
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
                    href={routePath('projects.dmp.section', { projectId, dmpId: planId, sectionId: section.sectionId })}
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
              <Button className="secondary">{Global('buttons.preview')}</Button>
              <Button
                onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true })}
              >
                {Global('buttons.publish')}
              </Button>
            </div>
            <div className={styles.sidePanelContent}>
              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>{t('status.feedback.title')}</h3>
                  <p>No feedback</p>
                </div>
                <Link href={FEEDBACK_URL} aria-label="Request feedback" >
                  {Global('links.request')}
                </Link >
              </div >
              {state.isEditingPlanStatus ? (
                <div>
                  <Form onSubmit={handlePlanStatusForm} className={styles.statusForm}>
                    <FormSelect
                      label={t('status.title')}
                      ariaLabel={t('status.select.label')}
                      isRequired
                      name="planStatus"
                      items={planStatusOptions}
                      onSelectionChange={(selected) => dispatch({ type: 'SET_PLAN_STATUS', payload: selected as PlanStatus })}
                      selectedKey={state.planStatus ?? state.planData.status}
                    >
                      {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                    </FormSelect>
                    {state.isEditingPlanStatus && (
                      <Button type="submit">{Global('buttons.save')}</Button>
                    )}
                  </Form>
                </div>
              ) : (
                <div className={`${styles.panelRow} mb-5`}>
                  <div>
                    <h3>{t('status.title')}</h3>
                    <p>{state.planData.status}</p>
                  </div>
                  <Link className={`${styles.sidePanelLink} react-aria-Link`} onPress={handlePlanStatusChange} aria-label={t('status.select.changeLabel')}>
                    {Global('buttons.linkUpdate')}
                  </Link>
                </div>
              )}

              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>{t('status.publish.title')}</h3>
                  <p>{state.planData.dmpId ? PUBLISHED : UNPUBLISHED}</p>
                </div>
                <Link className={`${styles.sidePanelLink} react-aria-Link`} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true })} aria-label={t('status.publish.label')}>
                  {t('status.publish.label')}
                </Link>
              </div>
              <div className={`${styles.panelRow} mb-5`}>
                <div>
                  <h3>{t('status.download.title')}</h3>
                </div>
                <Link href={DOWNLOAD_URL} aria-label="download">
                  {t('status.download.title')}
                </Link>
              </div>
            </div >
          </div >

        </SidebarPanel >
      </LayoutWithPanel >

      <Modal isDismissable
        isOpen={state.isModalOpen}
        data-testid="modal"
      >

        {state.step === 1 && (
          <Dialog>
            <div className={`${styles.markAsCompleteModal} ${styles.dialogWrapper}`}>

              <ErrorMessages errors={state.errors} ref={errorRef} />
              <Heading slot="title">{t('publishModal.publish.title')}</Heading>

              <p>Publishing a Data Management Plan (DMP) assigns it a Digital Object Identifier (DOI). By publishing, you&rsquo;ll be able to link this plan
                to your ORCiD, and to project outputs such articles which will make it easier to show that you met your funder&rsquo;s requirements by the end of the project.
              </p>

              <p>
                This DOI uniquely identifies the DMP, facilitating easy reference and access in the future.
              </p>

              <Heading level={2}>{t('publishModal.publish.checklistTitle')}</Heading>

              <ul className={styles.checkList}>
                {state.checkListItems
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
                {state.checkListItems
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
                <strong>{state.checkListItems.filter(item => !item.completed).length} {t('publishModal.publish.checklistInfo')}</strong>
              </p>

              <div className="modal-actions">
                <div className="">
                  <Button data-secondary onPress={handleDialogCloseBtn}>{Global('buttons.close')}</Button>
                </div>
                <div className="">
                  <Button
                    type="submit"
                    onPress={() => dispatch({ type: 'SET_STEP', payload: 2 })}
                  >
                    {t('publishModal.publish.buttonNext')}
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}

        {state.step === 2 && (
          <Dialog>
            <div className={`${styles.markAsCompleteModal} ${styles.dialogWrapper}`}>
              <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

                <ErrorMessages errors={state.errors} ref={errorRef} />
                <Heading slot="title">{t('publishModal.publish.visibilityTitle')}</Heading>

                <p>
                  {t('publishModal.publish.visibilityDescription')}
                </p>

                <Heading level={2}>{t('publishModal.publish.visibilityOptionsTitle')}</Heading>

                <RadioGroupComponent
                  name="visibility"
                  value={state.planVisibility.toLowerCase()}
                  radioGroupLabel={radioData.radioGroupLabel}
                  radioButtonData={radioData.radioButtonData}
                  onChange={handleRadioChange}
                />

                <div className="modal-actions">
                  <div className="">
                    <Button data-secondary onPress={handleDialogCloseBtn}>{Global('buttons.close')}</Button>
                  </div>
                  <div className="">
                    <Button type="submit">{t('publishModal.publish.title')}</Button>
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
