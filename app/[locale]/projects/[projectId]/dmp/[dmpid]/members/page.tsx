'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Form,
  Link
} from "react-aria-components";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';

import {
  useProjectContributorsQuery,
  usePlanContributorsQuery,
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

  // Store selected plan contributors
  const [selectedPlanContributors, setSelectedPlanContributors] = useState<{ id: number, roleIds: number[] }[]>([]);



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


  const members: Member[] = [
    {
      id: 'member-001',
      name: 'Frederick Cook',
      affiliation: 'University of California',
      orcid: '0000-0001-2603-5427',
      role: 'Primary Investigator',
      isSelectedForThisProject: true,
    },
    {
      id: 'member-002',
      name: 'Jennifer Frost',
      affiliation: 'University of Arctic Studies',
      orcid: '0000-0007-7803-0427',
      role: 'Data curator',
      isSelectedForThisProject: false,
    },
    {
      id: 'member-003',
      name: 'Christina Snowden',
      affiliation: 'University of California',
      orcid: '0000-0007-7803-0417',
      role: 'Data curator',
      isSelectedForThisProject: true,
    }
  ];


  const handleFormSubmit = () => {
    console.log("Form submitted")
  }

  // eslint-disable-next-line no-unused-vars
  const handleEdit = (memberId: string): void => {
    // Handle editing member
    window.location.href = '/projects/proj_2425/members/edit?memberid=' + memberId;
  };

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

  useEffect(() => {
    // When data from backend changes, set project contributors data in state
    if (data && data.projectContributors) {
      const projectContributorData = data.projectContributors.map((contributor) => ({
        id: contributor?.id ?? null,
        fullName: `${contributor?.givenName} ${contributor?.surName}`,
        affiliation: contributor?.affiliation?.displayName ?? '',
        orcid: contributor?.orcid ?? '',
        role: (contributor?.contributorRoles && contributor.contributorRoles.length > 0) ? contributor?.contributorRoles?.map((role) => role.label).join(', ') : '',
      }))
      setProjectContributors(projectContributorData);
    }
  }, [data]);

  useEffect(() => {
    // When data from backend changes, set plan contributors data in state
    if (planContributorData && planContributorData.planContributors) {
      const planContributorIds = planContributorData.planContributors
        .map((contributor) => contributor?.projectContributor?.id ?? null)
        .filter(id => id !== null);
      setPlanMemberIds(planContributorIds);
    }
  }, [planContributorData]);


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
                <Form onSubmit={handleFormSubmit}>
                  <div role="list">
                    {projectContributors.map((member) => (
                      <div
                        key={member.id}
                        className={styles.membersList}
                        role="listitem"
                        aria-label={`Project member: ${member.fullName}`}
                      >
                        <div className={`${styles.memberCheckbox} ${styles.box}`}>
                          <Checkbox
                            value={member.id?.toString()}
                            aria-label={`Select ${member.fullName} for this plan`}
                            onChange={() => handleCheckboxChange(member.id?.toString() ?? '')}
                            isSelected={planMemberIds.includes(Number(member.id))}
                          >
                            <div className="checkbox">
                              <svg viewBox="0 0 18 18" aria-hidden="true">
                                <polyline points="1 9 7 14 15 4" />
                              </svg>
                            </div>
                          </Checkbox>

                        </div>
                        <div className={`${styles.memberInfo} ${styles.box}`}>
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
                        <div className={`${styles.memberRole} ${styles.box}`}>
                          <p className={styles.role}>{member.role}</p>
                        </div>
                        <div className={`${styles.memberActions} ${styles.box}`}>
                          <Button
                            onPress={() => handleEdit(member.id?.toString() ?? '')}

                            className="button-link secondary"
                            aria-label={`Change role`}
                          >
                            Change role
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="submit">Save</Button>
                </Form>
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
