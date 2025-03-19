'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  ListBoxItem
} from "react-aria-components";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import {
  useAddPlanContributorMutation,
  useProjectContributorsQuery,
  useUpdatePlanContributorMutation,
  usePlanContributorsQuery,
  ProjectContributor,
  useRemovePlanContributorMutation,
  PlanContributorErrors
} from '@/generated/graphql';
import { ProjectContributorsInterface } from '@/app/types';
import { useToast } from '@/context/ToastContext';
import styles from './ProjectsProjectPlanAdjustMembers.module.scss';

interface PlanContributorDropdown {
  id: string;
  name: string;
  isPrimaryContact?: boolean | null | undefined;
  projectContributorId: number | null;
}

const ProjectsProjectPlanAdjustMembers = () => {
  const { scrollToTop } = useScrollToTop();

  // Get projectId and planId params
  const params = useParams();
  const { dmpid: planId, projectId } = params; // From route /projects/:projectId/dmp/:dmpId

  // Set refs for error messages and scrolling
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const toastState = useToast(); // Access the toast state from context

  // Store project contributors
  const [projectContributors, setProjectContributors] = useState<ProjectContributorsInterface[]>();

  // Store ids of members selected for this plan
  const [planMemberIds, setPlanMemberIds] = useState<number[]>([]);

  // To track whether user is editing the primary contact
  const [isEditing, setIsEditing] = useState(false);

  const [planMembers, setPlanMembers] = useState<PlanContributorDropdown[]>([]);
  const [selectedPlanMember, setSelectedPlanMember] = useState<string | null>(null);
  const [primaryContact, setPrimaryContact] = useState<string>('');
  // Save errors in state to display on page
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Localization keys
  const PlanMembers = useTranslations('ProjectsProjectPlanAdjustMembers');
  const Global = useTranslations('Global');

  // Get Project Contributors using projectid
  const { data, loading, error: queryError } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  console.log("*** data ***", data);
  //Get Plan Contributors so that we know which members are already part of this plan
  const { data: planContributorData, loading: planContributorLoading, refetch, error: planContributorError } = usePlanContributorsQuery(
    {
      variables: { planId: Number(planId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize mutations
  const [AddPlanContributorMutation] = useAddPlanContributorMutation();
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
      const response = await AddPlanContributorMutation({
        variables: {
          planId: Number(planId),
          projectContributorId: id
        }
      });

      if (response.data?.addPlanContributor?.errors) {
        return response.data.addPlanContributor.errors;
      }
    } catch (error) {
    }
    return {};
  };

  // handle adding of plan contributor
  const handleAddPlanContributor = async (memberId: number | null) => {
    if (memberId) {
      // Attempt to add plan contributor
      const errors = await addPlanContributor(memberId);

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {

        setErrorMessages([errors.general || Global('messaging.somethingWentWrong')]);
      } else {

        setPlanMemberIds(prev => [...prev, Number(memberId)]);
        await refetch(); // Refresh the data after the update

        //show success message
        const planMemberAdded = projectContributors?.find((contributor) => contributor.id === memberId);
        const successMessage = PlanMembers('messaging.success.addedPlanMember', { fullName: planMemberAdded?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  }

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
    }
    return {};
  };

  // handle removing of plan contributor
  const handleRemovePlanContributor = async (memberId: number | null) => {
    if (memberId) {
      // Find the planContributor ID that matches the memberId
      const planContributor = planContributorData?.planContributors?.find(
        (contributor) => contributor?.projectContributor?.id === memberId
      );

      if (!planContributor?.id) {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        setErrorMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Attempt to remove plan contributor
      const errors = await removePlanContributor(planContributor.id);

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {
        setErrorMessages([errors.general || Global('messaging.somethingWentWrong')]);
      } else {
        setPlanMemberIds((prev) => prev.filter((id) => id !== memberId));
        await refetch(); // Refresh the data after the update

        //show success message
        const planMemberAdded = projectContributors?.find((contributor) => contributor.id === memberId);
        const successMessage = PlanMembers('messaging.success.removedPlanMember', { fullName: planMemberAdded?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  }

  const updatePlanContributor = async (
    planContributorId: number,
    contributorRoles: { id: number | null, label: string }[]
  ): Promise<PlanContributorErrors | null> => {
    try {
      const response = await UpdatePlanContributorMutation({
        variables: {
          planId: Number(planId),
          planContributorId: planContributorId,
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
    }
    return {};
  }

  const handlePrimaryContactForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPlanMember) {
      // Find the selected plan member's details
      const selectedMember = planMembers.find((member) => member.id === selectedPlanMember);

      if (!selectedMember) {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        setErrorMessages(prev => [...prev, errorMessage]);
        return;
      }

      const projectContributorId = selectedMember.projectContributorId;
      const contributorRoles = projectContributors
        ?.find((contributor) => contributor.id === projectContributorId)
        ?.roles ?? [];

      let errors;
      // Call updatePlanContributor with the selected plan member's ID and roles
      if (projectContributorId !== null) {
        errors = await updatePlanContributor(
          Number(selectedPlanMember),
          contributorRoles
        );
      } else {
        const errorMessage = PlanMembers('messaging.error.memberNotFound');
        setErrorMessages(prev => [...prev, errorMessage]);
      }

      // If errors, set errorMessages, otherwise, refetch updated data and hide primary contact Select
      if (
        errors &&
        Object.values(errors).filter((err) => err && err !== "PlanContributorErrors").length > 0
      ) {
        setErrorMessages([errors.general ?? Global('messaging.somethingWentWrong')]);
      } else {
        await refetch(); // Refresh the data after the update
        setIsEditing(false);

        //show success message
        const planMemberAdded = projectContributors?.find((contributor) => contributor.id === projectContributorId);
        const successMessage = PlanMembers('messaging.success.updatedPlanMember', { fullName: planMemberAdded?.fullName });
        toastState.add(successMessage, { type: 'success' });

        scrollToTop(topRef);
      }
    }
  };

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
        }));

      if (projectContributorData.length > 0) {
        setProjectContributors(projectContributorData);
      }
    }
  }, [data, planContributorData]);

  useEffect(() => {
    // When data from backend changes, set plan contributors data in state
    if (planContributorData && planContributorData.planContributors) {
      const planContributorIds = planContributorData.planContributors
        .map((contributor) => contributor?.projectContributor?.id ?? null)
        .filter(id => id !== null);
      setPlanMemberIds(planContributorIds);

      const transformedData = planContributorData.planContributors
        .map((contributor): PlanContributorDropdown => ({
          id: (contributor?.id)?.toString() ?? '',
          name: `${contributor?.projectContributor?.givenName} ${contributor?.projectContributor?.surName}`,
          isPrimaryContact: contributor?.isPrimaryContact ?? null, // Ensure it matches the optional type
          projectContributorId: contributor?.projectContributor?.id ?? null
        }))
        .filter((contributor): contributor is PlanContributorDropdown => contributor.id !== null); // Filter out null ids

      if (transformedData.length > 0) {
        setPlanMembers(transformedData);
      }
      const primaryContact = planContributorData.planContributors.find(member => member?.isPrimaryContact);
      if (primaryContact) {
        setPrimaryContact(primaryContact.projectContributor?.givenName + ' ' + primaryContact.projectContributor?.surName); // Set the primary contact name for display purposes

      }

    }
  }, [planContributorData]);

  useEffect(() => {
    if (planMembers?.length) {
      const primaryContact = planMembers.find(member => member.isPrimaryContact);
      if (primaryContact) {
        setSelectedPlanMember(primaryContact.id);
      }
    }
  }, [planMembers]); // Runs when `planMembers` changes


  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
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
            <Breadcrumb><Link href={`/projects/${projectId}/dmp/${planId}`}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb>{PlanMembers('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>

          </>
        }
        className="page-project-members"
      />


      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <p>
            Select the relevant members for <strong>this plan only</strong> from the list of project members shown below.
            Regardless of their role in this plan, they will remain as members of your
          </p>
          <p>
            <Link href={`/projects/${projectId}/members`}
              className={"text-base underline"}>Update project
              members</Link> (new window)
          </p>
          <section
            aria-label="Project members list"
            role="region"
          >
            <div>
              {(!projectContributors || projectContributors?.length === 0) ? (
                <p>{PlanMembers('messaging.error.memberNotFound')}</p>
              ) : (
                <>
                  <div role="list">
                    {projectContributors.map((member) => (
                      <div
                        key={member.id}
                        className={styles.membersList}
                        role="listitem"
                        aria-label={`${PlanMembers('labels.planMembers')}: ${member.fullName}`}
                      >
                        <div className={classNames(styles.memberInfo, styles.box, {
                          [styles.notMember]: !planMemberIds.includes(Number(member.id))
                        })}>
                          <h2>
                            {member.fullName}
                          </h2>
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
                        <div className={classNames(styles.memberRole, styles.box, {
                          [styles.notMember]: !planMemberIds.includes(Number(member.id))
                        })}>

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
                          {planMemberIds.includes(Number(member.id)) ? (
                            <Button
                              onPress={() => handleRemovePlanContributor(member.id)}

                              className={"button-link secondary"}
                              aria-label={PlanMembers('labels.removeFromPlan')}
                            >
                              {PlanMembers('labels.removeFromPlan')}
                            </Button>
                          ) : (<Button
                            onPress={() => handleAddPlanContributor(member.id)}

                            className={"button-link primary"}
                            aria-label={PlanMembers('labels.addMemberToPlan')}
                          >
                            {PlanMembers('labels.addMemberToPlan')}
                          </Button>)
                          }

                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className={styles.primaryContact}>{PlanMembers('headings.h2PrimaryContact')}</h2>

                    {/**Just show the Plan Contributors in the dropdown */}
                    <Form onSubmit={handlePrimaryContactForm}>
                      {isEditing ? (
                        <FormSelect
                          label=""
                          ariaLabel=""
                          isRequired
                          name="institution"
                          items={planMembers}

                          errorMessage={PlanMembers('form.select.selectionIsRequired')}
                          description={PlanMembers('form.select.description')}
                          onSelectionChange={(selected) => setSelectedPlanMember(selected as string)}
                          selectedKey={selectedPlanMember}
                        >
                          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                        </FormSelect>
                      ) : (
                        <div className={styles.primaryContactChangeWrapper}>
                          <div className="field-label">{primaryContact}{' -'}</div>
                          <Button className={`${styles.linkButton} link`} onPress={() => setIsEditing(true)}>Change</Button>
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

          <section className={styles.otherOptions}>
            <h3>{PlanMembers('headings.h3AddProjectMember')}</h3>
            <p>{PlanMembers.rich('addProjectMemberInfo', {
              strong: (chunks) => <strong>{chunks}</strong>
            })}</p>
            < Link href={`/projects/${projectId}/members`}>{PlanMembers('links.updateProjectMembers')}</Link>

            <h3>{PlanMembers('headings.h3AllowOthers')}</h3>
            <p>
              {PlanMembers('allowOthersToAccess')}
            </p>
            <Link href={`/projects/${projectId}/members`}>{PlanMembers('links.inviteAPerson')}</Link>
          </section>

        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectPlanAdjustMembers;
