'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Link
} from "react-aria-components";
import {
  useProjectQuery,
  PlanSearchResult,
  PlanSectionProgress
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { Card } from '@/components/Card/card';
import {
  ContentContainer,
  LayoutContainer
} from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';

interface FunderInterface {
  name: string;
  shortName: string;
  id: number;
  grantId: string;
}

interface ProjectMemberInterface {
  fullname: string;
  role: string[];
  email: string;
}

interface ResearchOutputsInterface {
  title: string;
}

interface ProjectOverviewInterface {
  title: string;
  startDate: string | null;
  endDate: string | null;
  funders: FunderInterface[];
  projectMembers: ProjectMemberInterface[];
  researchOutputs: ResearchOutputsInterface[];
  plans: PlanSearchResult[];
  dmpId?: string;
  modified?: string;
}

const ProjectOverviewPage: React.FC = () => {
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId
  const formatter = useFormatter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [project, setProject] = useState<ProjectOverviewInterface>({
    title: '',
    startDate: null,
    endDate: null,
    funders: [],
    plans: [],
    projectMembers: [],
    researchOutputs: []
  });

  // Localization keys
  const ProjectOverview = useTranslations('ProjectOverview');
  const Global = useTranslations('Global');

  // Get Project using projectId
  const { data, loading, error } = useProjectQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  if (error) {
    const errorMsg = ProjectOverview('messages.errorGettingProject');
    setErrors(prev => [...prev, errorMsg]);
  }

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

  const sortSections = (sections: PlanSectionProgress[]) => {
    // Create a new array with the spread operator before sorting
    return [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  useEffect(() => {
    // When data from backend changes, set project data in state
    if (data && data.project) {
      setProject({
        title: data.project.title ?? '',
        startDate: data.project?.startDate ? data.project.startDate : '',
        endDate: data.project?.endDate ? data.project.endDate : '',
        plans: data.project?.plans ?? [],
        funders: data.project.funders
          ?.filter((funder) => funder !== null) // Filter out null
          .map((funder) => ({
            id: Number(funder.id),
            name: funder.affiliation?.displayName ?? '',
            shortName: funder.affiliation?.name ?? '',
            grantId: funder.grantId ?? '',
          })) ?? [], // Provide a default empty array
        projectMembers: data.project.contributors
          ?.filter((member) => member !== null) // Filter out null
          .map((member) => ({
            fullname: `${member.givenName} ${member.surName}`,
            email: member.email ?? '',
            role: (member.contributorRoles ?? []).map((role) => role.label),
          })) ?? [], // Provide a default empty array
        researchOutputs: data.project.outputs
          ?.filter((output) => output !== null) // Filter out null
          .map((output) => ({
            title: output.title ?? '',
          })) ?? [], // Provide a default empty array
      });
    }
  }, [data]);


  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={ProjectOverview('pageTitle')}
        description={ProjectOverview('pageDescription')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={ProjectOverview('navigation')}>
            <Breadcrumb><Link href="/">{ProjectOverview('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{ProjectOverview('projects')}</Link></Breadcrumb>
            <Breadcrumb>{ProjectOverview('pageTitle')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />
      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer>
          <div className="project-overview">
            <section className="project-overview-item project-header"
              aria-labelledby="project-title">
              <h2 id="project-title">{ProjectOverview('project')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {project.title}
                </strong>
              </p>
              <p>
                {ProjectOverview('dateRange', {
                  startDate: (project.startDate),
                  endDate: (project.endDate)
                })}
              </p>
              <Link href={`/projects/${projectId}/project`} aria-label={ProjectOverview('editProject')}>
                {ProjectOverview('edit')}
              </Link>
            </section>


            <section className="project-overview-item project-funders"
              aria-labelledby="funders-title">
              <h2 id="funders-title">{ProjectOverview('funders')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {ProjectOverview('funderCount', { count: project.funders.length })}
                </strong>
              </p>
              <p>
                {project.funders.map((funder, index) => (
                  <span key={funder.id} data-index={index}>
                    {funder.grantId ? (ProjectOverview('funderInfo', {
                      name: funder.name,
                      id: funder.grantId
                    })) : funder.name}
                  </span>
                ))}
              </p>
              <Link href={`/projects/${projectId}/funder`} aria-label={ProjectOverview('editFunders')}>
                {ProjectOverview('editFunderDetails')}
              </Link>
            </section>

            <section className="project-overview-item project-members"
              aria-labelledby="members-title">
              <h2 id="members-title">{ProjectOverview('projectMembers')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {ProjectOverview('memberCount', { count: project.projectMembers.length })}
                </strong>
              </p>
              <p>
                {project.projectMembers.map((member, index) => (
                  <span key={index}>
                    {ProjectOverview('memberInfo', {
                      name: member.fullname,
                      role: member.role.join(', ')
                    })}
                    {index < project.projectMembers.length - 1 ? '; ' : ''}
                  </span>
                ))}
              </p>
              <Link href={`/projects/${projectId}/members`} aria-label={ProjectOverview('editMembers')}>
                {ProjectOverview('editProjectMembers')}
              </Link>
            </section>

            <section className="project-overview-item research-outputs"
              aria-labelledby="outputs-title">
              <h2 id="outputs-title">{ProjectOverview('researchOutputs')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {ProjectOverview('outputCount', { count: project.researchOutputs.length })}
                </strong>
              </p>
              <Link href={`/projects/${projectId}/research-outputs`} aria-label={ProjectOverview('editOutputs')}>
                {ProjectOverview('editOutputs')}
              </Link>
            </section>

          </div>

          <section className="plans" aria-labelledby="plans-title">
            <div className="plans-header plans-header-with-actions">
              <div className="">
                <h2 id="plans-title">{ProjectOverview('plans')}</h2>
              </div>
              <div className="actions" role="group"
                aria-label={ProjectOverview('planActions')}>
                <Link
                  href={`/projects/${projectId}/dmp/upload`}
                  className="react-aria-Button react-aria-Button--secondary"
                  aria-label={ProjectOverview('uploadPlan')}
                >
                  {ProjectOverview('upload')}
                </Link>
                <Link
                  href={`/projects/${projectId}/dmp/create`}
                  className="react-aria-Button react-aria-Button--primary"
                  aria-label={ProjectOverview('createNewPlan')}
                >
                  {ProjectOverview('createNew')}
                </Link>
              </div>
            </div>
            {/** Plans */}
            {project.plans.map((plan) => {
              // extract dmp id from the full dmpId
              const doiId = plan?.dmpId?.match(/(?:https?:\/\/doi\.org\/)(.+)/)?.[1] ?? '';
              const modifiedDate = formatDate(plan?.modified ?? '');
              const createdDate = formatDate(plan?.created ?? '');
              const sortedSections = sortSections(plan.sections ?? []);
              return (
                <Card className="plan-item" key={plan.id}>
                  <p className="mb-1">{ProjectOverview('funder')}: {plan.funder}</p>
                  <h3 className="mt-0">{plan.templateTitle}</h3>
                  <div className="plan-sections mb-4">
                    <ul className="plan-sections-list"
                      aria-label={ProjectOverview('planSections')}>
                      {sortedSections.map((section) => (
                        <li key={section.sectionId} className="plan-sections-list-item">
                          <Link href={`/projects/${projectId}/dmp/${doiId}/s/${section.sectionId}`}>
                            {section.sectionTitle}
                          </Link>
                          <span className="plan-sections-list-item-progress">
                            {ProjectOverview('progress', {
                              current: section.answeredQuestions,
                              total: section.totalQuestions
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-meta">
                    <p>
                      {ProjectOverview('doi')}: {plan.dmpId} <br />
                      {ProjectOverview('lastUpdated')}: {modifiedDate}<br />
                      {ProjectOverview('created')}: {createdDate}
                    </p>
                  </div>
                  <div className="plan-footer">
                    <div className="plan-links">
                      <Link
                        href="/plans/123"
                        className="plan-link download-link"
                        aria-label={ProjectOverview('downloadPlan')}
                      >
                        <span className="link-text">{ProjectOverview('download')}</span>
                        <span className="link-icon" aria-hidden="true">↓</span>
                      </Link>
                      <Link
                        href="/share"
                        className="plan-link share-link"
                        aria-label={ProjectOverview('sharePlan')}
                      >
                        <span className="link-text">{ProjectOverview('share')}</span>
                        <span className="link-icon" aria-hidden="true">👤</span>
                      </Link>
                    </div>
                    <div className="plan-action">
                      <Link
                        href={`/projects/${projectId}/dmp/xxx`}
                        className="react-aria-Button react-aria-Button--primary"
                        aria-label={ProjectOverview('updatePlan')}
                      >
                        {ProjectOverview('update')}
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </section>
        </ContentContainer>
      </LayoutContainer>

    </>
  );
}

export default ProjectOverviewPage;

