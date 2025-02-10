'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {Card} from '@/components/Card/card';
import {useTranslations} from "next-intl";


const ProjectOverviewPage: React.FC = () => {
  const t = useTranslations('ProjectOverview');


  const project = {
    title: "Coastal Ocean Processes of North Greenland",
    start_date: "2023-07-18",
    end_date: "2026-06-30",
    funders: [
      {
        name: "Physical Oceanography",
        shortname: "PO",
        id: "GR-1810",
        grantid: "PO-GR-1810"
      }
    ],
    project_members: [
      {
        fullname: "Frederick Ice",
        role: "PI",
        email: "fred.ice@example.com"
      },
      {
        fullname: "Jennifer Frost",
        role: "PI",
        email: "jfrost@example.com"
      },
      {
        fullname: "Amelia Snow",
        role: "Other",
        email: "asnow@example.com"
      }
    ],
    research_outputs: [
      {
        title: "North Greenland Coastal Process Data Set 1"
      },
      {
        title: "Ocean Temperature Measurements 2023-2024"
      },
      {
        title: "Coastal Mapping Analysis Results"
      }
    ],
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

  return (
    <>
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation')}>
            <Breadcrumb><Link href="/">{t('home')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/projects">{t('projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <div className="template-editor-container">
        <div className="main-content">
          <div className="project-overview">
            <section className="project-overview-item project-header"
                     aria-labelledby="project-title">
              <h2 id="project-title">{t('project')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {project.title}
                </strong>
              </p>
              <p>
                {t('dateRange', {
                  startDate: (project.start_date),
                  endDate: (project.end_date)
                })}
              </p>
              <Link href="/projects/proj_2425/project" aria-label={t('editProject')}>
                {t('edit')}
              </Link>
            </section>


            <section className="project-overview-item project-funders"
                     aria-labelledby="funders-title">
              <h2 id="funders-title">{t('funders')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {t('funderCount', {count: project.funders.length})}
                </strong>
              </p>
              <p>
                {project.funders.map((funder, index) => (
                  <span key={funder.id} data-index={index}>
                      {t('funderInfo', {
                        name: funder.name,
                        id: funder.grantid
                      })}
                    </span>
                ))}
              </p>
              <Link href="/projects/proj_2425/funder" aria-label={t('editFunders')}>
                {t('editFunderDetails')}
              </Link>
            </section>

            <section className="project-overview-item project-members"
                     aria-labelledby="members-title">
              <h2 id="members-title">{t('projectMembers')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {t('memberCount', {count: project.project_members.length})}
                </strong>
              </p>
              <p>
                {project.project_members.map((member, index) => (
                  <span key={index}>
                    {t('memberInfo', {
                      name: member.fullname,
                      role: member.role
                    })}
                                {index < project.project_members.length - 1 ? '; ' : ''}
                  </span>
                ))}
              </p>
              <Link href="/projects/proj_2425/members" aria-label={t('editMembers')}>
                {t('editProjectMembers')}
              </Link>
            </section>

            <section className="project-overview-item research-outputs"
                     aria-labelledby="outputs-title">
              <h2 id="outputs-title">{t('researchOutputs')}</h2>
              <p className="project-overview-item-heading">
                <strong>
                  {t('outputCount', {count: project.research_outputs.length})}
                </strong>
              </p>
              <Link href="/projects/proj_2425/research-outputs" aria-label={t('editOutputs')}>
                {t('editResearchOutputs')}
              </Link>
            </section>

          </div>

          <section className="plans" aria-labelledby="plans-title">
            <div className="plans-header plans-header-with-actions">
              <div className="">
                <h2 id="plans-title">{t('plans')}</h2>
              </div>
              <div className="actions" role="group"
                   aria-label={t('planActions')}>
                <Link
                  href="/en-US/projects/proj_2425/dmp/upload"
                  className="react-aria-Button react-aria-Button--secondary"
                  aria-label={t('uploadPlan')}
                >
                  {t('upload')}
                </Link>
                <Link
                  href="/en-US/projects/proj_2425/dmp/create"
                  className="react-aria-Button react-aria-Button--primary"
                  aria-label={t('createNewPlan')}
                >
                  {t('createNew')}
                </Link>
              </div>
            </div>
            {project.plans.map((plan) => (
              <Card className="plan-item" key={plan.id}>
                <p className="mb-1">{t('funder')}: {plan.funder_name}</p>
                <h3 className="mt-0">{plan.template_name}</h3>
                <div className="plan-sections mb-4">
                  <ul className="plan-sections-list"
                      aria-label={t('planSections')}>
                    {plan.sections.map((section) => (
                      <li key={section.id} className="plan-sections-list-item">
                        <Link href={section.link}>
                          {section.section_title}
                        </Link>
                        <span className="plan-sections-list-item-progress">
                          {t('progress', {
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
                    {t('doi')}: {plan.doi} <br/>
                    {t('lastUpdated')}: {plan.last_updated}<br/>
                    {t('template')}: Arctic Data Center: NSF Polar Programs
                  </p>
                </div>
                <div className="plan-footer">
                  <div className="plan-links">
                    <Link
                      href="/plans/123"
                      className="plan-link download-link"
                      aria-label={t('downloadPlan')}
                    >
                      <span className="link-text">{t('download')}</span>
                      <span className="link-icon" aria-hidden="true">↓</span>
                    </Link>
                    <Link
                      href="/share"
                      className="plan-link share-link"
                      aria-label={t('sharePlan')}
                    >
                      <span className="link-text">{t('share')}</span>
                      <span className="link-icon" aria-hidden="true">👤</span>
                    </Link>
                  </div>
                  <div className="plan-action">
                    <Link
                      href="/projects/proj_2425/dmp/xxx"
                      className="react-aria-Button react-aria-Button--primary"
                      aria-label={t('updatePlan')}
                    >
                      {t('update')}
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}

export default ProjectOverviewPage;

