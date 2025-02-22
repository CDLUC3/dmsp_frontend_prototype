'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Link
} from "react-aria-components";
import {
  useProjectQuery
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
}

const ProjectOverviewPage: React.FC = () => {
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [project, setProject] = useState<ProjectOverviewInterface>({
    title: '',
    startDate: null,
    endDate: null,
    funders: [],
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

  const project1 = {
    plans: [
      {
        id: "plan_123",
        template_name: "NSF Polar Programs",
        funder_id: "nsf_1",
        funder_name: "National Science Foundation",
        template_id: "temp_456",
        sections: [
          {
            section_title: "Roles and Responsibilities",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_1",
            progress: 1
          },
          {
            section_title: "Types of Data",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_2",
            progress: 1
          },
          {
            section_title: "Data and Metadata formats",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_3",
            progress: 2
          },
          {
            section_title: "Policies for Access and Sharing",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_4",
            progress: 1
          },
          {
            section_title: "Policies for reuse and re-distribution",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_5",
            progress: 0
          },
          {
            section_title: "Plans for archiving and preservation",
            link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
            id: "sect_6",
            progress: 0
          }
        ],
        doi: "10.12345/example.123",
        last_updated: "2024-04-01",
        created_date: "2023-07-18"
      }
    ]
  };

  useEffect(() => {
    // When data from backend changes, set template data in state
    if (data && data.project) {
      setProject({
        title: data.project.title ?? '',
        startDate: data.project?.startDate ? data.project.startDate : '',
        endDate: data.project?.endDate ? data.project.endDate : '',
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
            <Breadcrumb><Link
              href="/projects">{ProjectOverview('projects')}</Link></Breadcrumb>
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
                {ProjectOverview('editResearchOutputs')}
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
            {project1.plans.map((plan) => (
              <Card className="plan-item" key={plan.id}>
                <p className="mb-1">{ProjectOverview('funder')}: {plan.funder_name}</p>
                <h3 className="mt-0">{plan.template_name}</h3>
                <div className="plan-sections mb-4">
                  <ul className="plan-sections-list"
                    aria-label={ProjectOverview('planSections')}>
                    {plan.sections.map((section) => (
                      <li key={section.id} className="plan-sections-list-item">
                        <Link href={section.link}>
                          {section.section_title}
                        </Link>
                        <span className="plan-sections-list-item-progress">
                          {ProjectOverview('progress', {
                            current: section.progress,
                            total: 3
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="plan-meta">
                  <p>
                    {ProjectOverview('doi')}: {plan.doi} <br />
                    {ProjectOverview('lastUpdated')}: {plan.last_updated}<br />
                    {ProjectOverview('template')}: Arctic Data Center: NSF Polar Programs
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
            ))}
          </section>
        </ContentContainer>
      </LayoutContainer>

    </>
  );
}

export default ProjectOverviewPage;

