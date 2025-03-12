'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Link
} from "react-aria-components";
import { useTranslations } from 'next-intl';

import { useParams, useRouter } from 'next/navigation';


import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';

import { useProjectContributorsQuery } from '@/generated/graphql';
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
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId


  const [projectContributors, setProjectContributors] = useState<ProjectContributorsInterface[]>();

  // Localization keys
  const ProjectMembers = useTranslations('ProjectsProjectMembers');
  const Global = useTranslations('Global');

  // Get project contributors using projectid
  const { data, loading, error: queryError } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
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



  // eslint-disable-next-line no-unused-vars
  const handleEdit = (memberId: string): void => {
    // Handle editing member
    window.location.href = '/projects/proj_2425/members/edit?memberid=' + memberId;
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

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }


  return (
    <>
      <PageHeader
        title="Members for this plan"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
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
            <Link href='projects/proj_2425/members'
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
                          isSelected={true}
                        >
                          <div className="checkbox">
                            <svg viewBox="0 0 18 18" aria-hidden="true">
                              <polyline points="1 9 7 14 15 4" />
                            </svg>
                          </div>
                        </Checkbox>

                      </div>
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
                          className="button-link"
                          aria-label={`Change role`}
                        >
                          Change role
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>

        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanAdjustMembers;
