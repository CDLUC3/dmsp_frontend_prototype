'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Breadcrumbs, Button, Link } from "react-aria-components";

import {
  useProjectContributorsQuery
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';
import ErrorMessages from '@/components/ErrorMessages';

import styles from './ProjectsProjectMembers.module.scss';

interface ProjectContributorsInterface {
  id: number | null;
  fullName: string;
  affiliation: string;
  orcid: string;
  role: string;
  isPrimaryInvestigator: boolean;
}

const ProjectsProjectMembers = () => {
  const router = useRouter();
  // To scroll to error message
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId

  // Localization keys
  const ProjectMembers = useTranslations('ProjectsProjectMembers');
  const Global = useTranslations('Global');

  const [projectContributors, setProjectContributors] = useState<ProjectContributorsInterface[]>();
  const [errors, setErrors] = useState<string[]>([]);

  // Get project contributors using projectid
  const { data, loading, error: queryError } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  const handleAddCollaborator = (): void => {
    // Handle adding new collaborator
    router.push(`/projects/${projectId}/members/search`);
  };

  const handleEdit = (memberId: number | null): void => {

    // Handle editing member
    router.push(`/projects/${projectId}/members/edit?memberid=${memberId?.toString()}`);
  };

  const handleAccessUpdate = (memberId: number | null): void => {
    // Handle access update
    router.push(`/projects/${projectId}/members/edit?memberid=${memberId?.toString()}`);
  };

  const handleShare = (): void => {
    // Handle share
    router.push(`/projects/${projectId}/share`);
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
        isPrimaryInvestigator: true// TODO: We need to update this once we have backend data for this
      }))
      setProjectContributors(projectContributorData);
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      const errorMsg = ProjectMembers('messages.errors.errorGettingContributors');
      setErrors(prev => [...prev, errorMsg]);
    }
  }, [queryError])

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }


  return (
    <>
      <PageHeader
        title={ProjectMembers('title')}
        description={ProjectMembers('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}`}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb>{ProjectMembers('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Button
              onPress={handleAddCollaborator}
              className="secondary"
            >
              {ProjectMembers('buttons.addCollaborators')}
            </Button>
          </>
        }
        className="page-project-members"
      />
      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer className="layout-content-container-full">
          <section
            aria-label="Project members list"
            role="region"
          >
            {(!projectContributors || projectContributors?.length === 0) ? (
              <p>{ProjectMembers('messages.noContributors')}</p>
            ) : (
              <div className={styles.membersList} role="list">
                {projectContributors.map((member) => (
                  <div
                    key={member.id}
                    className={styles.membersListItem}
                    role="listitem"
                    aria-label={`Project member: ${member.fullName}`}
                  >
                    <div className={styles.memberInfo}>
                      <h2 className={styles.memberNameHeading}>
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
                    <div className={styles.memberRole}>
                      <p className={styles.role}>{member.role}</p>
                    </div>
                    <div className={styles.memberActions}>
                      <Button
                        onPress={() => handleAccessUpdate(member.id)}
                        className="secondary"
                        aria-label={`${member.isPrimaryInvestigator ? ProjectMembers('buttons.update') : ProjectMembers('buttons.share')} ${ProjectMembers('buttons.accessFor', { member: member.fullName })}`}
                      >
                        {member.isPrimaryInvestigator ? ProjectMembers('buttons.updateAccess') : ProjectMembers('buttons.shareAccess')}
                      </Button>
                      <Button
                        onPress={() => handleEdit(member.id)}
                        className="primary"
                        aria-label={`Edit ${member.fullName}'s details`}
                      >
                        {Global('buttons.edit')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            aria-labelledby="collaborators-heading"
            className={styles.collaboratorAccess}
          >
            <h2 id="collaborators-heading">{ProjectMembers('headings.h2AllowCollaborators')}</h2>
            <p>{ProjectMembers('para.para1AllowCollaborators')}</p>
            <Button
              onPress={handleShare}
              className="secondary"
              aria-label={ProjectMembers('buttons.shareWithPeople')}
            >
              {ProjectMembers('buttons.shareWithPeople')}
            </Button>
          </section>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
};

export default ProjectsProjectMembers;
