'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  ListBoxItem,
  Text
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

import {
  useAddPlanContributorMutation,
  useProjectContributorsQuery,
  useUpdatePlanContributorMutation,
  usePlanContributorsQuery,
  ProjectContributor,
  useRemovePlanContributorMutation
} from '@/generated/graphql';
import { ProjectContributorsInterface } from '@/app/types';
import styles from './ProjectsProjectPlanAdjustMembers.module.scss';

interface Member {
  id: string;
  name: string;
  affiliation: string;
  orcid: string;
  role: string;
  isSelectedForThisProject: boolean;
}

interface PlanContributorDropdown {
  id: string;
  name: string;
  isPrimaryContact?: boolean | null | undefined;
}

const ProjectsProjectPlanAdjustMembers = () => {
  // Get projectId and planId params
  const params = useParams();
  const { dmpid: planId, projectId } = params; // From route /projects/:projectId/dmp/:dmpId
  // to scroll to errors
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Store project contributors
  const [projectContributors, setProjectContributors] = useState<ProjectContributorsInterface[]>();

  // Store ids of members selected for this plan
  const [planMemberIds, setPlanMemberIds] = useState<number[]>([]);

  // To track whether user is editing the primary contact
  const [isEditing, setIsEditing] = useState(true);

  const [planMembers, setPlanMembers] = useState<PlanContributorDropdown[]>([]);
  const [selectedPlanMember, setSelectedPlanMember] = useState<string | null>(null);

  // Save errors in state to display on page
  const [errors, setErrors] = useState<string[]>([]);

  // Localization keys
  const ProjectMembers = useTranslations('ProjectsProjectMembers');
  const Global = useTranslations('Global');

  // Get Project Contributors using projectid
  const { data, loading, error: queryError } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  //Get Plan Contributors so that we know which members are already part of this plan
  const { data: planContributorData, loading: planContributorLoading, error: planContributorError } = usePlanContributorsQuery(
    {
      variables: { planId: Number(planId) },
      notifyOnNetworkStatusChange: true
    }
  );

  console.log("***PlanContributorData***", planContributorData);
  // Initialize mutations
  const [AddPlanContributorMutation] = useAddPlanContributorMutation();
  const [RemovePlanContributorMutation] = useRemovePlanContributorMutation();
  const [UpdatePlanContributorMutation] = useUpdatePlanContributorMutation();

  const handleFormSubmit = () => {
    console.log("Form submitted")
  }

  // eslint-disable-next-line no-unused-vars
  const handleEdit = (memberId: string): void => {
    // Handle editing member
    window.location.href = '/projects/proj_2425/members/edit?memberid=' + memberId;
  };

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

  const handleAddPlanContributor = async (memberId: number | null) => {
    if (memberId) {
      // Create new section
      const errors = await addPlanContributor(memberId);

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {

        setErrors([errors.general || "something went wrong"]);
      } else {
        //show success message
        setPlanMemberIds(prev => [...prev, Number(memberId)]);
      }
    }
  }


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

  const handleRemovePlanContributor = async (memberId: number | null) => {
    if (memberId) {
      // Find the planContributor ID that matches the memberId
      const planContributor = planContributorData?.planContributors?.find(
        (contributor) => contributor?.projectContributor?.id === memberId
      );

      if (!planContributor?.id) {
        setErrors(["Contributor not found in this plan"]);
        return;
      }
      // Create new section
      const errors = await removePlanContributor(planContributor.id);

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {
        setErrors([errors.general || "something went wrong"]);
      } else {
        //show success message
        setPlanMemberIds((prev) => prev.filter((id) => id !== memberId));
      }
    }
  }

  const updatePlanContributor = async (planContributorId: number) => {
    try {
      const response = await UpdatePlanContributorMutation({
        variables: {
          planId: Number(planId),
          planContributorId: planContributorId,
          isPrimaryContact: true
        }
      });

      if (response.data?.updatePlanContributor?.errors) {
        return response.data.updatePlanContributor.errors;
      }
    } catch (error) {
    }
    return {};
  }

  const handleSelectedPlanMember = (selected) => {
    console.log("***SELECTED", selected);
  }

  const handlePrimaryContactForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPlanMember) {
      // Create new section
      const errors = await updatePlanContributor(Number(selectedPlanMember));

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'PlanContributorErrors').length > 0) {

        setErrors([errors.general || "something went wrong"]);
      }
    }
  }


  const handleCheckboxChange = (id: string) => {
    // Handle checkbox change
    if (planMemberIds.includes(Number(id))) {
      // Remove member from plan
      setPlanMemberIds(planMemberIds.filter((memberId) => memberId !== Number(id)));

    } else {
      // Add member to plan
      setPlanMemberIds([...planMemberIds, Number(id)]);
    }
  };

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

  useEffect(() => {
    // When data from backend changes, set project contributors data in state
    if (data && data.projectContributors) {
      const projectContributorData = data.projectContributors.map((contributor) => ({
        id: contributor?.id ?? null,
        fullName: `${contributor?.givenName} ${contributor?.surName}`,
        affiliation: contributor?.affiliation?.displayName ?? '',
        orcid: contributor?.orcid ?? '',
        isPrimaryContact: isPrimaryContact(contributor as ProjectContributor),
        role: (contributor?.contributorRoles && contributor.contributorRoles.length > 0) ? contributor?.contributorRoles?.map((role) => role.label).join(', ') : '',
      }))
      setProjectContributors(projectContributorData);
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
          id: (contributor?.id)?.toString() ?? null,
          name: `${contributor?.projectContributor?.givenName} ${contributor?.projectContributor?.surName}`,
          isPrimaryContact: contributor?.isPrimaryContact ?? null, // Ensure it matches the optional type
        }))
        .filter((contributor): contributor is PlanContributorDropdown => contributor.id !== null); // Filter out null ids

      if (transformedData.length > 0) {
        setPlanMembers(transformedData);
      }
    }
  }, [planContributorData]);

  useEffect(() => {
    if (planMembers?.length) {
      console.log("*** my plan members", planMembers);
      const primaryContact = planMembers.find(member => member.isPrimaryContact);
      if (primaryContact) {
        console.log("Setting selectedPlanMember:", primaryContact.id);

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
        title="Members for this plan"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}/dmp/${planId}`}>Plan Overview</Link></Breadcrumb>
            <Breadcrumb>Members for this plan</Breadcrumb>
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
                <p>{ProjectMembers('messages.noContributors')}</p>
              ) : (
                <>
                  <div role="list">
                    {projectContributors.map((member) => (
                      <div
                        key={member.id}
                        className={styles.membersList}
                        role="listitem"
                        aria-label={`Project member: ${member.fullName}`}
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
                              aria-label={`ORCID profile for ${member.fullName}`}
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
                            {member.role}
                          </p>                        </div>
                        <div className={`${styles.memberActions} ${styles.box}`}>
                          {planMemberIds.includes(Number(member.id)) ? (
                            <Button
                              onPress={() => handleRemovePlanContributor(member.id)}

                              className={"button-link secondary"}
                              aria-label={`Remove from plan`}
                            >
                              Remove from plan
                            </Button>
                          ) : (<Button
                            onPress={() => handleAddPlanContributor(member.id)}

                            className={"button-link primary"}
                            aria-label={`Add to this plan`}
                          >
                            Add to this plan
                          </Button>)
                          }

                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className={styles.primaryContact}>Primary contact</h2>
                    {/**Just show the Plan Contributors in the dropdown */}
                    <Form onSubmit={handlePrimaryContactForm}>
                      {isEditing ? (
                        <FormSelect
                          label="Language"
                          isRequired
                          name="institution"
                          items={planMembers}
                          errorMessage="A selection is required"
                          helpMessage="This is the help text"
                          onSelectionChange={(selected) => setSelectedPlanMember(selected as string)}
                          selectedKey={selectedPlanMember}
                        >
                          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                        </FormSelect>
                      ) : (
                        <Text slot="givenName" className={styles.readOnlyField}>
                          <div className="field-label">Name</div>
                          <p>{selectedPlanMember}</p>
                        </Text>
                      )}
                      <Button type="submit">Save</Button>

                    </Form>
                  </div>
                </>
              )}

            </div>
          </section>

          <section className={styles.otherOptions}>
            <h3>Adding a new member?</h3>
            <p>
              You can add any project member to this plan using the tickboxes above. If you want to
              add someone who isn&apos;t shown here, you must <strong>add them to the projrect first</strong>.
            </p>
            <Link href={`/projects/${projectId}/members`}>Update project members (new window)</Link>

            <h3>Allow others access to the project</h3>
            <p>
              You can allow others access to the project. This will grant them access to the project and all plans.
            </p>
            <Link href={`/projects/${projectId}/members`}>Invite a person</Link>
          </section>

        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectPlanAdjustMembers;
