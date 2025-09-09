'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import {
  PlanSearchResult,
  PlanSectionProgress,
  useProjectQuery
} from '@/generated/graphql';

import { routePath } from '@/utils/routes';

// Components
import PageHeader from "@/components/PageHeader";
import { Card } from '@/components/Card/card';
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";

interface FundingInterface {
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
  fundings: FundingInterface[];
  projectMembers: ProjectMemberInterface[];
  researchOutputs: ResearchOutputsInterface[];
  plans: PlanSearchResult[];
  dmpId?: string;
  modified?: string;
}

const ProjectOverviewPage: React.FC = () => {
  // Get projectId param
  const params = useParams();
  const projectId = String(params.projectId); // From route /projects/:projectId
  const router = useRouter();
  const formatter = useFormatter();
  const [project, setProject] = useState<ProjectOverviewInterface>({
    title: '',
    startDate: null,
    endDate: null,
    fundings: [],
    plans: [],
    projectMembers: [],
    researchOutputs: []
  });

  // Localization keys
  const ProjectOverview = useTranslations('ProjectOverview');
  const Global = useTranslations('Global');

  //const FEEDBACK_URL = routePath('projects.dmp.feedback', { projectId });
  const COLLABORATION_URL = routePath('projects.collaboration', { projectId });


  // Get Project using projectId
  const { data, loading, error } = useProjectQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Format date using next-intl date formatter
  const formatDate = (date: string) => {
    let dateObj: Date;

    // Check if date is a timestamp (numeric string) or ISO string
    if (/^\d+$/.test(date)) {
      // It's a timestamp, convert to number
      dateObj = new Date(Number(date));
    } else {
      // It's likely an ISO string or other format
      dateObj = new Date(date);
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return date; // Return original if invalid
    }

    const formattedDate = formatter.dateTime(dateObj, {
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
        fundings: data.project.fundings
          ?.filter((funding) => funding !== null) // Filter out null
          .map((funding) => ({
            id: Number(funding.id),
            name: funding.affiliation?.displayName ?? '',
            shortName: funding.affiliation?.name ?? '',
            grantId: funding.grantId ?? '',
          })) ?? [], // Provide a default empty array
        projectMembers: data.project.members
          ?.filter((member) => member !== null) // Filter out null
          .map((member) => ({
            fullname: `${member.givenName} ${member.surName}`,
            email: member.email ?? '',
            role: (member.memberRoles ?? []).map((role) => role.label),
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

  if (error) {
    if (error.message.toLowerCase() === 'forbidden') {
      router.push('/not-found');
    } else {
      return <div>{error.message}</div>
    }
  }


  return (
    <>
      <PageHeader
        title={ProjectOverview('pageTitle')}
        description={ProjectOverview('pageDescription')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={ProjectOverview('navigation')}>
            <Breadcrumb><Link href={routePath('app.home')}>{ProjectOverview('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{ProjectOverview('projects')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.projectOverview')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />
      <LayoutWithPanel>
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
                {project.startDate && project.endDate && (
                  ProjectOverview('dateRange', {
                    startDate: formatDate(project.startDate),
                    endDate: formatDate(project.endDate)
                  }))}
              </p>
              <Link href={`/projects/${projectId}/project`} aria-label={ProjectOverview('editProject')}>
                {ProjectOverview('edit')}
              </Link>
            </section>


            <section className="project-overview-item project-fundings"
              aria-labelledby="fundings-title">
              <h2 id="fundings-title">{ProjectOverview('fundings')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {ProjectOverview('fundingCount', { count: project.fundings.length })}
                </strong>
              </p>
              <p>
                {project.fundings.map((funding, index) => (
                  <span key={funding.id} data-index={index}>
                    {funding.grantId ? (ProjectOverview('fundingInfo', {
                      name: funding.name,
                      id: funding.grantId
                    })) : funding.name}
                    {index < project.fundings.length - 1 && ', '}
                  </span>
                ))}
              </p>
              <Link href={`/projects/${projectId}/fundings`} aria-label={ProjectOverview('editFundings')}>
                {ProjectOverview('editFundingDetails')}
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
              // Use the plan ID for routing, not the DOI extraction
              const planId = plan?.id?.toString() || '';
              const modifiedDate = formatDate(plan?.modified ?? '');
              const createdDate = formatDate(plan?.created ?? '');
              const sortedSections = sortSections(plan.versionedSections ?? []);
              return (
                <Card className="plan-item" key={plan.id}>
                  <p className="mb-1">{ProjectOverview('funding')}: {plan.funding}</p>
                  <h3 className="mt-0">{plan.templateTitle}</h3>
                  <div className="plan-sections mb-4">
                    <ul className="plan-sections-list"
                      aria-label={ProjectOverview('planSections')}>
                      {sortedSections.map((section) => (
                        <li key={section.versionedSectionId} className="plan-sections-list-item">
                          <Link href={routePath('projects.dmp.versionedSection', {
                            projectId: String(projectId),
                            dmpId: planId,
                            versionedSectionId: section.versionedSectionId
                          })}>
                            {section.title}
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
                        href={routePath('projects.dmp.download', {
                          projectId: String(projectId),
                          dmpId: planId
                        })}
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
                        href={routePath('projects.dmp.show', { projectId, dmpId: String(plan.id) })}
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

        <SidebarPanel>
          <div className={"sidePanel statusPanelContent"}>

            <div className={"sidePanelContent"}>
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{ProjectOverview('status.collaboration.title')}</h3>
                  <p>{ProjectOverview('status.collaboration.description', {
                    total: project.projectMembers.length ?? 0,
                  })}</p>
                </div>
                <Link className={"sidePanelLink"} href={COLLABORATION_URL} aria-label={Global('links.request')} >
                  {ProjectOverview('status.collaboration.link_text')}
                </Link >
              </div >
              {/** Feedback 
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{ProjectOverview('status.feedback.title')}</h3>
                </div>
                <Link className={"sidePanelLink"} href={FEEDBACK_URL} aria-label={Global('links.request')} >
                  {Global('links.request')}
                </Link >
              </div >
*/}
            </div >
          </div >

        </SidebarPanel >
      </LayoutWithPanel>

    </>
  );
}

export default ProjectOverviewPage;

