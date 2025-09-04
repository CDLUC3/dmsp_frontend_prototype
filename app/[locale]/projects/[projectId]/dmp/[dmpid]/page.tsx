'use client';

import { useEffect, useReducer, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  Radio,
  Text
} from 'react-aria-components';
import {
  PlanSectionProgress,
  PlanStatus,
  PlanVisibility,
  usePlanQuery,
} from '@/generated/graphql';

//Components
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';
import { DmpIcon } from "@/components/Icons";
import { FormSelect, RadioGroupComponent } from '@/components/Form';
import PageHeaderWithTitleChange from "@/components/PageHeaderWithTitleChange";

import { routePath } from '@/utils/routes';
import { toTitleCase } from '@/utils/general';
import { extractErrors } from '@/utils/errorHandler';
import { useToast } from '@/context/ToastContext';
import {
  publishPlanAction,
  updatePlanStatusAction,
  updatePlanTitleAction
} from './actions';
import {
  ListItemsInterface,
  PlanMember,
  PlanOverviewInterface,
} from '@/app/types';
import styles from './PlanOverviewPage.module.scss';

const PUBLISHED = 'Published';
const UNPUBLISHED = 'Unpublished';

// Status options for dropdown
const planStatusOptions = Object.entries(PlanStatus).map(([name, id]) => ({
  id,
  name
}));

type UpdateTitleErrors = {
  general?: string;
  title?: string;
};

type UpdateStatusErrors = {
  general?: string;
  status?: string;
}

type PublishPlanErrors = {
  general?: string;
  visibility?: string;
  status?: string;
}

const initialState: {
  isModalOpen: boolean;
  checkListItems: ListItemsInterface[];
  errorMessages: string[];
  planVisibility: PlanVisibility;
  planStatus: PlanStatus | null;
  step: number;
  isEditingPlanStatus: boolean;
  planData: PlanOverviewInterface;
} = {
  isModalOpen: false,
  checkListItems: [] as ListItemsInterface[],
  errorMessages: [] as string[],
  planVisibility: PlanVisibility.Private,
  planStatus: null,
  step: 1,
  isEditingPlanStatus: false,
  planData: {
    id: null,
    dmpId: '',
    registered: '',
    title: '',
    status: '',
    funderName: '',
    primaryContact: '',
    members: [] as PlanMember[],
    versionedSections: [] as PlanSectionProgress[],
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
  const projectId = String(params.projectId);
  const dmpId = String(params.dmpid);
  const planId = Number(dmpId);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const toastState = useToast();

  // Localization keys
  const t = useTranslations('PlanOverview');
  const Global = useTranslations('Global');


  // Get Plan using planId
  const { data, loading, error: queryError, refetch } = usePlanQuery(
    {
      variables: { planId: Number(planId) },
      skip: isNaN(planId), // prevents the query from running when id is not a number
      notifyOnNetworkStatusChange: true
    }
  );

  // Set URLs
  const FUNDINGS_URL = routePath('projects.dmp.fundings', { projectId, dmpId: planId });
  const MEMBERS_URL = routePath('projects.dmp.members', { projectId, dmpId: planId });
  const RESEARCH_OUTPUT_URL = routePath('projects.dmp.research-outputs', { projectId, dmpId: planId });
  const DOWNLOAD_URL = routePath('projects.dmp.download', { projectId, dmpId: planId });
  const FEEDBACK_URL = routePath('projects.dmp.feedback', { projectId, dmpId: planId });
  const CHANGE_PRIMARY_CONTACT_URL = routePath('projects.dmp.members', { projectId, dmpId: planId });
  const RELATED_WORKS_URL = routePath('projects.dmp.relatedWorks', { projectId, dmpId: planId });


  //TODO: Get research output count from backend
  const researchOutputCount = 3;

  //TODO: Get related works count from backend
  const relatedWorksCount = 3;

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    const selection = value.toUpperCase();

    dispatch({
      type: 'SET_PLAN_VISIBILITY',
      payload: selection as PlanVisibility,
    })

  };

  const handlePlanStatusChange = () => {
    dispatch({
      type: 'SET_IS_EDITING_PLAN_STATUS',
      payload: true
    });
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

  // Call Server Action updatePlanStatusAction to run the updatePlanStatusMutation
  const updateStatus = async (status: PlanStatus) => {
    // Don't need a try-catch block here, as the error is handled in the action
    const response = await updatePlanStatusAction({
      planId: Number(planId),
      status
    })

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data
    }
  }

  const handlePlanStatusForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch({
      type: 'SET_IS_EDITING_PLAN_STATUS',
      payload: false
    });

    const status = state.planStatus ?? state.planData.status as PlanStatus;

    const result = await updateStatus(status);

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        dispatch({
          type: 'SET_ERROR_MESSAGES',
          payload: errors,
        })
      }
    } else {
      if (result?.data?.errors) {
        const errs = extractErrors<UpdateStatusErrors>(result?.data?.errors, ['general', 'status']);
        if (errs.length > 0) {
          dispatch({
            type: 'SET_ERROR_MESSAGES',
            payload: errs
          });
        } else {

          // Optimistically update status so UI reflects it smoothly
          dispatch({
            type: 'SET_PLAN_STATUS',
            payload: status
          });

          // ALSO update the planData.status so the display paragraph updates
          dispatch({
            type: 'SET_PLAN_DATA',
            payload: {
              ...state.planData,
              status
            }
          });
          const successMessage = t('messages.success.successfullyUpdatedStatus');
          toastState.add(successMessage, { type: 'success' });
        }
      }
    }
  }

  // Call Server Action publishPlanAction to run the publishPlanMutation
  const publishPlan = async (visibility: PlanVisibility) => {
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
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Close modal
    dispatch({
      type: 'SET_IS_MODAL_OPEN',
      payload: false
    });

    // Set step back to Step 1
    dispatch({
      type: 'SET_STEP',
      payload: 1
    });

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as PlanVisibility;

    const result = await publishPlan(visibility);

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        dispatch({
          type: 'SET_ERROR_MESSAGES',
          payload: errors.length > 0 ? errors : [Global('messaging.somethingWentWrong')],
        })
      }
    } else {
      if (result?.data?.errors) {
        const errs = extractErrors<PublishPlanErrors>(result?.data?.errors, ['general', 'visibility', 'status']);
        if (errs.length > 0) {
          dispatch({
            type: 'SET_ERROR_MESSAGES',
            payload: errs
          });
        } else {
          const successMessage = t('messages.success.successfullyPublished');
          toastState.add(successMessage, { type: 'success' });
        }
      }
      //Need to refetch plan data to refresh the info that was changed
      await refetch();
    }
  };

  // Call Server Action updatePlanTitleAction to run the updatePlanTitleMutation
  const updateTitle = async (title: string) => {
    // Don't need a try-catch block here, as the error is handled in the action
    const response = await updatePlanTitleAction({
      planId: Number(planId),
      title
    })

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data
    }
  }

  const handleTitleChange = async (newTitle: string) => {
    const result = await updateTitle(newTitle);

    if (!result.success) {
      dispatch({
        type: 'SET_ERROR_MESSAGES',
        payload: [...state.errorMessages, t('messages.errors.updateTitleError')]
      });
    } else {
      if (result.data?.errors) {
        // Handle errors as an object with general or field-level errors
        const errs = extractErrors<UpdateTitleErrors>(result?.data?.errors, ['general', 'title']);
        if (errs.length > 0) {
          dispatch({
            type: 'SET_ERROR_MESSAGES',
            payload: errs
          });
          return;
        }

        // Optimistically update state so UI reflects it smoothly
        dispatch({
          type: 'SET_PLAN_DATA',
          payload: {
            ...state.planData,
            title: newTitle
          }
        });

        const successMessage = t('messages.success.successfullyUpdatedTitle');
        toastState.add(successMessage, { type: 'success' });

      }
    }
  }


  useEffect(() => {
    // When data from backend changes, set project data in state
    if (data && data.plan) {
      dispatch({
        type: 'SET_PLAN_DATA',
        payload: {
          id: Number(data?.plan.id) ?? null,
          dmpId: data?.plan.dmpId ?? '',
          registered: data?.plan.registered ?? '',
          title: data?.plan?.title ?? '',
          status: data?.plan?.status ?? '',
          funderName: data?.plan?.fundings?.map(f => f?.projectFunding?.affiliation?.displayName).filter(Boolean).join(', ') ?? '',
          primaryContact: data.plan.members
            ?.filter(member => member?.isPrimaryContact === true)
            ?.map(member => member?.projectMember?.givenName + ' ' + member?.projectMember?.surName)
            ?.join(', ') ?? '',
          members: data.plan.members
            ?.filter((member) => member !== null) // Filter out null
            .map((member) => ({
              fullname: `${member?.projectMember?.givenName} ${member?.projectMember?.surName}`,
              email: member?.projectMember?.email ?? '',
              orcid: member?.projectMember?.orcid ?? '',
              isPrimaryContact: member?.isPrimaryContact ?? false,
              role: (member?.projectMember?.memberRoles ?? []).map((role) => role.label),
            })) ?? [],
          versionedSections: data?.plan?.versionedSections ?? [],
          percentageAnswered: data?.plan?.progress?.percentComplete ?? 0,
        },
      })
      dispatch({
        type: 'SET_PLAN_VISIBILITY',
        payload: data.plan.visibility as PlanVisibility
      });
    }
  }, [data]);


  useEffect(() => {
    if (queryError) {
      dispatch({
        type: 'SET_ERROR_MESSAGES',
        payload: [...state.errorMessages, queryError.message]
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
            {t('publishModal.publish.checklistItem.fundingText')} (<Link href={FUNDINGS_URL} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false })}>{t('publishModal.publish.checklistItem.funding')}</Link>)
          </>
        ),
        completed: !!state.planData.funderName, // Check if funderName exists
      },
      {
        id: 5,
        content: <>{t('publishModal.publish.checklistItem.requiredFields')}</>,
        completed: false, // Mark as not completed
      },
      {
        id: 6,
        content: (
          <>
            {t('publishModal.publish.checklistItem.orcidText')} <Link href={MEMBERS_URL} onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false })}>{t('publishModal.publish.checklistItem.projectMembers')}</Link>
          </>
        ),
        completed: state.planData.members.some(member => member.orcid), // Check if any member has an ORCiD
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

  return (
    <>
      <PageHeaderWithTitleChange
        title={state.planData.title}
        description={t('page.pageDescription')}
        linkText={t('links.editTitle')}
        labelText={t('labels.planTitle')}
        placeholder={t('page.planTitlePlaceholder')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={Global('breadcrumbs.navigation')}>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.planOverview')}</Breadcrumb>
          </Breadcrumbs>
        }
        onTitleChange={handleTitleChange}
      />

      <ErrorMessages errors={state.errorMessages} ref={errorRef} />
      <LayoutWithPanel>
        <ContentContainer>
          <div className={"container"}>
            <div className={styles.planOverview}>
              <section className={styles.planOverviewItem}
                aria-labelledby="funding-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="funding-title"
                    className={styles.planOverviewItemTitle}>
                    {t('funding.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {state.planData.funderName}
                  </p>
                </div>
                <Link href={FUNDINGS_URL}
                  aria-label={t('funding.edit')}>
                  {t('funding.edit')}
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

              <section className={styles.planOverviewItem}
                aria-labelledby="related-works-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="related-works-title"
                    className={styles.planOverviewItemTitle}>
                    {t('relatedWorks.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {t('relatedWorks.count', { count: relatedWorksCount })}
                  </p>
                </div>
                <Link href={RELATED_WORKS_URL}
                  aria-label={t('relatedWorks.edit')}>
                  {t('relatedWorks.edit')}
                </Link>
              </section>
            </div>

            {state.planData.versionedSections.map((versionedSection) => (
              <section
                key={versionedSection.versionedSectionId}
                className={styles.planSectionsList}
                aria-labelledby={`section-title-${versionedSection.versionedSectionId}`}
              >
                <div className={styles.planSectionsHeader}>
                  <div className={styles.planSectionsTitle}>
                    <h3 id={`section-title-${versionedSection.versionedSectionId}`}>
                      {versionedSection.title}
                    </h3>
                    <p
                      aria-label={`${versionedSection.answeredQuestions} out of ${versionedSection.totalQuestions} questions answered for ${versionedSection.title}`}>
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
                          current: versionedSection.answeredQuestions,
                          total: versionedSection.totalQuestions
                        })} {t('sections.questionsAnswered')}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={routePath('projects.dmp.versionedSection', { projectId, dmpId: planId, versionedSectionId: versionedSection.versionedSectionId })}
                    aria-label={t('sections.updateSection', {
                      title: versionedSection.title
                    })}
                    className={"react-aria-Button react-aria-Button--secondary"}
                  >
                    {(versionedSection.answeredQuestions === 0) ? t('sections.start') : t('sections.update')}
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </ContentContainer>

        <SidebarPanel>
          <div className={`statusPanelContent sidePanel`}>
            <div className={`buttonContainer withBorder  mb-5`}>
              <Button className="secondary">{Global('buttons.preview')}</Button>
              <Button
                onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true })}
              >
                {Global('buttons.publish')}
              </Button>
            </div>
            <div className="sidePanelContent">
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{t('status.feedback.title')}</h3>
                </div>
                <Link className="sidePanelLink" href={FEEDBACK_URL} aria-label={Global('links.request')} >
                  {Global('links.request')}
                </Link >
              </div >
              {state.isEditingPlanStatus ? (
                <div>
                  <Form onSubmit={handlePlanStatusForm} className="statusForm">
                    <FormSelect
                      label={t('status.title')}
                      ariaLabel={t('status.select.label')}
                      isRequired
                      name="planStatus"
                      items={planStatusOptions}
                      onChange={(selected) => dispatch({ type: 'SET_PLAN_STATUS', payload: selected as PlanStatus })}
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
                <div className={`panelRow mb-5`}>
                  <div>
                    <h3>{t('status.title')}</h3>
                    <p>{toTitleCase(state.planData.status)}</p>
                  </div>
                  <Button className={`buttonLink link`} data-testid="updateLink" onPress={handlePlanStatusChange} aria-label={t('status.select.changeLabel')}>
                    {Global('buttons.linkUpdate')}
                  </Button>
                </div>
              )}

              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{t('status.publish.title')}</h3>
                  <p>{state.planData.registered ? PUBLISHED : UNPUBLISHED}</p>
                </div>
                <Link href="#" onPress={() => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true })} aria-label={t('status.publish.label')}>
                  {t('status.publish.label')}
                </Link>
              </div>
              <div className={`panelRow mb-5`}>
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
        onOpenChange={(isOpen) => { dispatch({ type: 'SET_IS_MODAL_OPEN', payload: isOpen }) }}
        data-testid="modal"
      >

        {state.step === 1 && (
          <Dialog>
            <div className={`${styles.publishModal} ${styles.dialogWrapper}`}>

              <Heading slot="title">{t('publishModal.publish.title')}</Heading>

              <p>{t('publishModal.publish.description1')}</p>

              <p>
                {t('publishModal.publish.description2')}
              </p>

              <Heading level={2}>{t('publishModal.publish.checklistTitle')}</Heading>

              <ul className={styles.checkList} data-testid="checklist">
                {/* Render completed items first */}
                {state.checkListItems
                  .filter(item => item.completed)
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
                  .filter(item => !item.completed)
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
                <div>
                  <Button
                    type="submit"
                    onPress={() => dispatch({ type: 'SET_STEP', payload: 2 })}
                  >
                    {t('publishModal.publish.buttonNext')} &gt;
                  </Button>
                </div>
                <div>
                  <Button data-secondary className="secondary" onPress={handleDialogCloseBtn}>{Global('buttons.close')}</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}

        {/* Step 2: Visibility Settings & Publish Plan button*/}
        {state.step === 2 && (
          <Dialog>
            <div className={`${styles.publishModal} ${styles.dialogWrapper}`}>
              <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

                <Heading slot="title">{t('publishModal.publish.visibilityTitle')}</Heading>

                <p>
                  {t('publishModal.publish.visibilityDescription')}
                </p>

                <Heading level={2}>{t('publishModal.publish.visibilityOptionsTitle')}</Heading>


                <RadioGroupComponent
                  name="visibility"
                  value={state.planVisibility.toLowerCase()}
                  radioGroupLabel={t('publishModal.publish.visibilityOptionsTitle')}
                  onChange={handleRadioChange}
                >
                  <div>
                    <Radio value="public">{t('publishModal.publish.visibilityOptions.public.label')}</Radio>
                    <Text
                      slot="description"
                    >
                      <strong>{t('publishModal.publish.visibilityOptions.public.description')}</strong>
                    </Text>
                  </div>

                  <div>
                    <Radio value="organizational">{t('publishModal.publish.visibilityOptions.organization.label')}</Radio>
                    <Text
                      slot="description"
                    >
                      {t.rich('publishModal.publish.visibilityOptions.organization.description', {
                        strong: (chunks) => <strong>{chunks}</strong>
                      })}
                    </Text>
                  </div>

                  <div>
                    <Radio value="private">{t('publishModal.publish.visibilityOptions.private.label')}</Radio>
                    <Text
                      slot="description"
                    >
                      {t('publishModal.publish.visibilityOptions.private.description')}
                    </Text>
                  </div>
                </RadioGroupComponent>

                <div className="modal-actions">
                  <div>
                    <Button type="submit">{t('publishModal.publish.title')}</Button>
                  </div>
                  <div>
                    <Button data-secondary className="secondary" onPress={handleDialogCloseBtn}>{Global('buttons.close')}</Button>
                  </div>
                </div>


              </Form>
            </div>
          </Dialog>
        )}
      </Modal >
    </>
  );
}

export default PlanOverviewPage;
