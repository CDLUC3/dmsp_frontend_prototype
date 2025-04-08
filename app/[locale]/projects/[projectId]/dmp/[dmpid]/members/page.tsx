'use client';

import {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  FormEvent
} from 'react';
import { ApolloError } from '@apollo/client';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  ListBoxItem
} from "react-aria-components";
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import classNames from 'classnames';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';
import { FormSelect } from '@/components/Form/FormSelect';
import ErrorMessages from '@/components/ErrorMessages';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import {
  useProjectContributorsQuery,
  useUpdatePlanContributorMutation,
  usePlanContributorsQuery,
  ProjectContributor,
  useRemovePlanContributorMutation,
  PlanContributorErrors,
  PlanContributor
} from '@/generated/graphql';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { addPlanContributorAction } from './action';
import { ProjectContributorsInterface } from '@/app/types';
import { routePath } from '@/utils/routes';
import styles from './ProjectsProjectPlanAdjustMembers.module.scss';

interface PlanContributorDropdown {
  id: string;
  name: string;
  isPrimaryContact?: boolean | null | undefined;
  projectContributorId: number | null;
}

const initialState = {
  projectContributors: [] as ProjectContributorsInterface[],
  planMemberIds: [] as number[],
  isEditing: false,
  planMembers: [] as PlanContributorDropdown[],
  selectedPlanMember: null as string | null,
  primaryContact: '',
  errorMessages: [] as string[],
};

type Action =
  | { type: 'SET_PROJECT_CONTRIBUTORS'; payload: ProjectContributorsInterface[] }
  | { type: 'SET_PLAN_MEMBER_IDS'; payload: number[] }
  | { type: 'ADD_PLAN_MEMBER_ID'; payload: number }
  | { type: 'REMOVE_PLAN_MEMBER_ID'; payload: number }
  | { type: 'SET_IS_EDITING'; payload: boolean }
  | { type: 'SET_PLAN_MEMBERS'; payload: PlanContributorDropdown[] }
  | { type: 'SET_SELECTED_PLAN_MEMBER'; payload: string | null }
  | { type: 'SET_PRIMARY_CONTACT'; payload: string }
  | { type: 'SET_ERROR_MESSAGES'; payload: string[] }
  | { type: 'ADD_ERROR_MESSAGE'; payload: string };


const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case 'SET_PROJECT_CONTRIBUTORS':
      return { ...state, projectContributors: action.payload };
    case 'SET_PLAN_MEMBER_IDS':
      return { ...state, planMemberIds: action.payload };
    case 'ADD_PLAN_MEMBER_ID':
      return { ...state, planMemberIds: [...state.planMemberIds, action.payload] };
    case 'REMOVE_PLAN_MEMBER_ID':
      return { ...state, planMemberIds: state.planMemberIds.filter((id) => id !== action.payload) };
    case 'SET_IS_EDITING':
      return { ...state, isEditing: action.payload };
    case 'SET_PLAN_MEMBERS':
      return { ...state, planMembers: action.payload };
    case 'SET_SELECTED_PLAN_MEMBER':
      return { ...state, selectedPlanMember: action.payload };
    case 'SET_PRIMARY_CONTACT':
      return { ...state, primaryContact: action.payload };
    case 'SET_ERROR_MESSAGES':
      return { ...state, errorMessages: action.payload };
    case 'ADD_ERROR_MESSAGE':
      return { ...state, errorMessages: [...state.errorMessages, action.payload] };
    default:
      return state;
  }
};


const ProjectsProjectPlanAdjustMembers = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    projectContributors,
    planMemberIds,
    isEditing,
    planMembers,
    selectedPlanMember,
    primaryContact,
    errorMessages,
  } = state;


  const { scrollToTop } = useScrollToTop();

  // Get projectId and dmpId params from route /projects/:projectId/dmp/:dmpId
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const dmpId = Array.isArray(params.dmpid) ? params.dmpid[0] : params.dmpid;

  // Set refs for error messages and scrolling
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const toastState = useToast(); // Access the toast state from context

  //Routes
  const PLAN_MEMBERS_ROUTE = routePath('projects.dmp.members', { projectId, dmpId });
  const PROJECT_MEMBERS_ROUTE = routePath('projects.members.index', { projectId });

  // Localization keys
  const PlanMembers = useTranslations('ProjectsProjectPlanAdjustMembers');
  const Global = useTranslations('Global');

  // Get Project Contributors using projectid
  const { data, loading, error: queryError, refetch: refetchProjectContributors } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  //Get Plan Contributors so that we know which members are already part of this plan
  const { data: planContributorData, loading: planContributorLoading, refetch, error: planContributorError } = usePlanContributorsQuery(
    {
      variables: { planId: Number(dmpId) },
      notifyOnNetworkStatusChange: true
    }
  );


  const isLoading = loading || planContributorLoading;
  let isError = queryError || planContributorError;

  // Initialize mutations
  const [RemovePlanContributorMutation] = useRemovePlanContributorMutation();
  const [UpdatePlanContributorMutation] = useUpdatePlanContributorMutation();


  // Check if the given contributor is the primary contact
  const isPrimaryContact = (contributor: ProjectContributor | null) => {
    if (!planContributorData || !planContributorData.planContributors) {
      return false;
    }

    // Find the primary contact ID from planContributors
    const primaryContactId = planContributorData.planContributors
      .find((planContributor) => planContributor?.isPrimaryContact)?.projectContributor?.id;

    // Check if the given contributor matches the primary contact ID
    return primaryContactId === (contributor as ProjectContributor)?.id;
  };

  // Add a new plan contributor
  const addPlanContributor = async (id: number) => {
    try {
      const response = await addPlanContributorAction({
        planId: Number(dmpId),
        projectContributorId: id
      });

      if (response.redirect) {
        router.push(response.redirect);
      }

      return {
        success: response.success,
        errors: response.errors,
        data: response.data
      }
    } catch (error) {
      logECS('error', 'addPlanContributor', {
        error,
        url: { path: PLAN_MEMBERS_ROUTE }
      });
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: null
    };
  };

  // handle adding of plan contributor
  const handleAddPlanContributor = async (memberId: number | null) => {
    if (memberId) {
      const result = await addPlanContributor(memberId);

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
        if (
          result.data?.errors &&
          typeof result.data.errors === 'object' &&
          typeof result.data.errors.general === 'string') {
          // Handle errors as an object with general or field-level errors
          dispatch({
            type: 'SET_ERROR_MESSAGES',
            payload: [result.data.errors.general]
          });
        }
        // Then mutation was successful
        dispatch({ type: 'ADD_PLAN_MEMBER_ID', payload: memberId });
        await refetch(); //Need to refresh the primary contact dropdown after adding a new member
        const planMemberAdded = projectContributors?.find((contributor) => contributor.id === memberId);
        const successMessage = PlanMembers('messaging.success.addedPlanMember', { fullName: planMemberAdded?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  };

  // Remove a plan contributor
  const removePlanContributor = async (id: number) => {
    try {
      const response = await RemovePlanContributorMutation({
        variables: {
          planContributorId: id
        }
      });

      if (response.data?.removePlanContributor?.errors) {
        return response.data.removePlanContributor.errors;
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        await refetch(); // Needed to refresh page after token refresh is triggered by an UNAUTHENTICATED graphql error
      } else {
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [Global('messaging.somethingWentWrong')] });
        logECS('error', 'removePlanContributor', {
          error,
          url: { path: PLAN_MEMBERS_ROUTE }
        });
      }
    }
    return {};
  };

  // handle removing of plan contributor
  const handleRemovePlanContributor = async (memberId: number | null) => {
    if (memberId) {
      const planContributor = planContributorData?.planContributors?.find(
        (contributor) => contributor?.projectContributor?.id === memberId
      );

      if (!planContributor?.id) {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        dispatch({ type: 'ADD_ERROR_MESSAGE', payload: errorMessage });
        return;
      }

      const errors = await removePlanContributor(planContributor.id);

      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [errors.general || Global('messaging.somethingWentWrong')] });
      } else {
        dispatch({ type: 'REMOVE_PLAN_MEMBER_ID', payload: memberId });
        await refetch();

        const planMemberRemoved = projectContributors?.find((contributor) => contributor.id === memberId);
        const successMessage = PlanMembers('messaging.success.removedPlanMember', { fullName: planMemberRemoved?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  };

  const updatePlanContributor = async (
    planContributorId: number,
    contributorRoles: { id: number | null, label: string }[]
  ): Promise<PlanContributorErrors | null> => {
    try {
      const response = await UpdatePlanContributorMutation({
        variables: {
          planId: Number(dmpId),
          planContributorId,
          isPrimaryContact: true,
          contributorRoleIds: contributorRoles
            .map((role) => role.id) // Extract `id`
            .filter((id): id is number => id !== null && id !== undefined), // Filter out invalid values
        }
      });

      if (response.data?.updatePlanContributor?.errors) {
        return response.data.updatePlanContributor.errors as PlanContributorErrors;
      }
    } catch (error) {

      if (error instanceof ApolloError) {
        await refetch();// Needed to refresh page after token refresh is triggered by an UNAUTHENTICATED graphql error
      } else {
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [Global('messaging.somethingWentWrong')] });
        logECS('error', 'updatePlanContributor', {
          error,
          url: { path: PLAN_MEMBERS_ROUTE }
        });
      }
    }
    return {};
  }

  const handlePrimaryContactForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPlanMember) {
      const selectedMember = planMembers.find((member) => member.id === selectedPlanMember);

      if (!selectedMember) {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        dispatch({ type: 'ADD_ERROR_MESSAGE', payload: errorMessage });
        return;
      }

      const projectContributorId = selectedMember.projectContributorId;
      const contributorRoles = projectContributors
        ?.find((contributor) => contributor.id === projectContributorId)
        ?.roles ?? [];

      let errors;
      if (projectContributorId !== null) {
        errors = await updatePlanContributor(
          Number(selectedPlanMember),
          contributorRoles
        );
      } else {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        dispatch({ type: 'ADD_ERROR_MESSAGE', payload: errorMessage });
      }

      if (
        errors &&
        Object.values(errors).filter((err) => err && err !== "PlanContributorErrors").length > 0
      ) {
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [errors.general ?? Global('messaging.somethingWentWrong')] });
      } else {
        await refetch();
        dispatch({ type: 'SET_IS_EDITING', payload: false });

        const planMemberUpdated = projectContributors?.find((contributor) => contributor.id === projectContributorId);
        const successMessage = PlanMembers('messaging.success.updatedPlanMember', { fullName: planMemberUpdated?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  };

  const transformPlanContributorData = (planContributors: PlanContributor[] | null) => {
    if (planContributors) {
      const transformedData = planContributors
        .map((contributor): PlanContributorDropdown => ({
          id: (contributor?.id)?.toString() ?? '',
          name: `${contributor?.projectContributor?.givenName} ${contributor?.projectContributor?.surName}`,
          isPrimaryContact: contributor?.isPrimaryContact ?? null,
          projectContributorId: contributor?.projectContributor?.id ?? null,
        }))
        .filter((contributor): contributor is PlanContributorDropdown => contributor.id !== null);

      return transformedData;
    }
    return [];
  }

  useEffect(() => {
    // When data from backend changes, set project contributors data in state
    if (data && data.projectContributors) {
      const projectContributorData = data.projectContributors
        .filter((contributor) => contributor !== null && contributor !== undefined) // Filter out null/undefined
        .map((contributor) => ({
          id: contributor?.id ?? null,
          fullName: `${contributor?.givenName} ${contributor?.surName}`,
          affiliation: contributor?.affiliation?.displayName ?? '',
          orcid: contributor?.orcid ?? '',
          isPrimaryContact: isPrimaryContact(contributor as ProjectContributor),
          roles: (contributor?.contributorRoles && contributor.contributorRoles.length > 0)
            ? contributor?.contributorRoles?.map((role) => ({
              id: role.id ?? null,
              label: role.label,
            }))
            : [],
        })) as ProjectContributorsInterface[]; // Explicitly assert type

      if (projectContributorData.length > 0) {
        dispatch({ type: 'SET_PROJECT_CONTRIBUTORS', payload: projectContributorData });
      }
    }
  }, [data, planContributorData]);// The planContributorData depedency is required to update the select dropdown after primary contact is changed


  useEffect(() => {
    if (planContributorData && planContributorData.planContributors) {
      // Filter out null values
      const validPlanContributors = planContributorData.planContributors.filter(
        (contributor): contributor is PlanContributor => contributor !== null
      );

      // Extract planContributorIds
      const planContributorIds = validPlanContributors
        .map((contributor) => contributor.projectContributor?.id ?? null)
        .filter((id) => id !== null);
      dispatch({ type: 'SET_PLAN_MEMBER_IDS', payload: planContributorIds });

      // Transform data
      const transformedData = transformPlanContributorData(validPlanContributors);

      if (transformedData.length > 0) {
        dispatch({ type: 'SET_PLAN_MEMBERS', payload: transformedData });
      }

      // Find primary contact
      const primaryContact = validPlanContributors.find((member) => member.isPrimaryContact);
      if (primaryContact) {
        dispatch({
          type: 'SET_PRIMARY_CONTACT',
          payload: `${primaryContact.projectContributor?.givenName} ${primaryContact.projectContributor?.surName}`,
        });
      }
    }
  }, [planContributorData]);

  useEffect(() => {
    if (planMembers?.length) {
      const primaryContact = planMembers.find(member => member.isPrimaryContact);
      if (primaryContact) {
        dispatch({ type: 'SET_SELECTED_PLAN_MEMBER', payload: primaryContact.id });
      }
    }
  }, [planMembers]); // Runs when `planMembers` changes


  useEffect(() => {
    const refetchData = async () => {
      await refetchProjectContributors();
      await refetch();
    } // Refetch data when the user logs in

    if (queryError instanceof ApolloError || planContributorError instanceof ApolloError) {
      isError = undefined;
      refetchData(); // To handle UNAUTHENTICATED errors
    }
  }, [queryError, planContributorError])

  if (isLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (isError) {
    return <div>{Global('messaging.error')}</div>;
  }

  return (
    <>
      <PageHeader
        title={PlanMembers('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}/dmp/${dmpId}`}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb>{PlanMembers('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>

          </>
        }
        className="page-project-members"
      />
      <ErrorMessages errors={errorMessages} ref={errorRef} />
      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <p>
            {PlanMembers.rich('description', {
              strong: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <p>
            <Link href={`/projects/${projectId}/members`} className={"text-base underline"}>{PlanMembers('links.updateProjectMembers')}</Link> {PlanMembers('newWindow')}
          </p>
          <section
            aria-label="Project members list"
            role="region"
          >
            <h2>{PlanMembers('headings.h2MembersInThePlan')}</h2>
            <div>
              {(planMemberIds.length === 0) ? (
                <p>{PlanMembers('messaging.error.memberNotFound')}</p>
              ) : (
                <>
                  <div role="list">
                    {(projectContributors ?? [])
                      .filter((member) => planMemberIds.includes(Number(member.id))) // Filter out members already in the plan
                      .map((member) => (
                        <div
                          key={member.id}
                          className={styles.membersList}
                          role="listitem"
                          aria-label={`${PlanMembers('labels.planMembers')}: ${member.fullName}`}
                        >
                          <div className={classNames(styles.memberInfo, styles.box)}>
                            <h3>
                              {member.fullName}
                            </h3>
                            <p className={styles.affiliation}>{member.affiliation}</p>
                            <p className={styles.orcid}>
                              <span aria-hidden="true">
                                <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                              </span>
                              <a
                                href={`https://orcid.org/${member.orcid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={PlanMembers('labels.orcid', { name: member.fullName })}
                              >
                                {member.orcid}
                              </a>
                            </p>
                          </div>
                          <div className={classNames(styles.memberRole, styles.box)}>
                            <p className={styles.role}>
                              {member?.isPrimaryContact && <strong>{PlanMembers('contactPerson')},{' '}</strong>}
                              {member.roles.map((role, index) => (
                                <Fragment key={role.id}>
                                  {role.label}
                                  {index < member.roles.length - 1 && ', '}
                                </Fragment>
                              ))}
                            </p>
                          </div>
                          <div className={`${styles.memberActions} ${styles.box}`}>
                            <Button
                              onPress={() => handleRemovePlanContributor(member.id)}
                              className={`${styles.memberBtn} button-link secondary`}
                              aria-label={PlanMembers('labels.removeFromPlan')}
                            >
                              {PlanMembers('labels.removeFromPlan')}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className={styles.primaryContactWrapper}>
                    <h3 className={styles.primaryContact}>{PlanMembers('headings.h3PrimaryContact')}</h3>

                    {/**Just show the Plan Contributors in the dropdown */}
                    <Form onSubmit={handlePrimaryContactForm}>
                      {isEditing ? (
                        <FormSelect
                          label=""
                          ariaLabel="primary contact selection"
                          isRequired
                          name="institution"
                          items={planMembers}

                          errorMessage={PlanMembers('form.select.selectionIsRequired')}
                          description={PlanMembers('form.select.description')}
                          onSelectionChange={(selected) =>
                            dispatch({ type: 'SET_SELECTED_PLAN_MEMBER', payload: selected as string })
                          } selectedKey={selectedPlanMember}
                        >
                          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                        </FormSelect>
                      ) : (
                        <div className={styles.primaryContactChangeWrapper}>
                          {primaryContact && (
                            <div className="field-label">{primaryContact}{' -'}</div>
                          )}
                          <Button
                            className={`${styles.linkButton} link`}
                            onPress={() => dispatch({ type: 'SET_IS_EDITING', payload: true })}
                          >
                            {Global('buttons.change')}
                          </Button>
                        </div>
                      )}
                      {isEditing && (
                        <Button type="submit">{Global('buttons.save')}</Button>
                      )}

                    </Form>
                  </div>
                </>
              )}

            </div>
          </section>

          <section
            aria-label="Members not in list"
            role="region"
          >
            <h2>{PlanMembers('headings.h2MembersNotInPlan')}</h2>
            <div>
              {projectContributors?.filter((member) => !planMemberIds.includes(Number(member.id))).length === 0 ? (
                <p>{PlanMembers('messaging.error.memberNotFound')}</p>
              ) : (
                <>
                  <div role="list">
                    {(projectContributors ?? [])
                      .filter((member) => !planMemberIds.includes(Number(member.id))) // Filter out members already in the plan
                      .map((member) => (
                        <div
                          key={member.id}
                          className={styles.membersList}
                          role="listitem"
                          aria-label={`${PlanMembers('labels.planMembers')}: ${member.fullName}`}
                        >
                          <div className={`${styles.memberInfo} ${styles.box}`}>
                            <h3>
                              {member.fullName}
                            </h3>
                            <p className={styles.affiliation}>{member.affiliation}</p>
                            <p className={styles.orcid}>
                              <span aria-hidden="true">
                                <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                              </span>
                              <a
                                href={`https://orcid.org/${member.orcid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={PlanMembers('labels.orcid', { name: member.fullName })}
                              >
                                {member.orcid}
                              </a>
                            </p>
                          </div>
                          <div className={`${styles.memberRole} ${styles.box}`}>
                            <p className={styles.role}>
                              {member?.isPrimaryContact && <strong>Contact person,{' '}</strong>}
                              {member.roles.map((role, index) => (
                                <span key={role.id}>
                                  {role.label}
                                  {index < member.roles.length - 1 && ', '}
                                </span>
                              ))}
                            </p>                        </div>
                          <div className={`${styles.memberActions} ${styles.box}`}>
                            <Button
                              onPress={() => handleAddPlanContributor(member.id)}

                              className={"button-link primary"}
                              aria-label={PlanMembers('labels.addMemberToPlan')}
                            >
                              {PlanMembers('labels.addMemberToPlan')}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}

            </div>
          </section>

          <section className={styles.otherOptions}>
            <h2>{PlanMembers('headings.h2AddProjectMember')}</h2>
            <p>{PlanMembers.rich('addProjectMemberInfo', {
              strong: (chunks) => <strong>{chunks}</strong>
            })}</p>
            <Link href={PROJECT_MEMBERS_ROUTE} className={"text-base underline"}>{PlanMembers('links.updateProjectMembers')}</Link> {PlanMembers('newWindow')}

            <h2>{PlanMembers('headings.h2AllowOthers')}</h2>
            <p>
              {PlanMembers('allowOthersToAccess')}
            </p>
            <Link href={PROJECT_MEMBERS_ROUTE}>{PlanMembers('links.inviteAPerson')}</Link>
          </section>

        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectPlanAdjustMembers;