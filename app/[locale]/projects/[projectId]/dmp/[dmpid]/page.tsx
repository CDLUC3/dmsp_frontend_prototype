'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {Card} from '@/components/Card/card';
import {useTranslations} from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";

interface PlanSection {
  section_title: string;
  link: string;
  id: string;
  progress: number;
}

interface PlanMember {
  fullname: string;
  role: string;
  email: string;
}

interface Plan {
  id: string;
  template_name: string;
  funder_id: string;
  funder_name: string;
  template_id: string;
  sections: PlanSection[];
  doi: string;
  last_updated: string;
  created_date: string;
  published_status: string;
  visibility: string;
  members: PlanMember[];
  research_output_count: number;
}

const PlanOverviewPage: React.FC = () => {
  const t = useTranslations('PlanOverview');

  const plan = {
    id: "plan_123",
    template_name: "NSF Polar Programs",
    title: "NSF Polar Programs",
    funder_id: "nsf_1",
    funder_name: "National Science Foundation",
    template_id: "temp_456",
    published_status: "Draft",
    visibility: "Not Published",
    members: [
      {
        fullname: "Frederick Ice",
        role: "PI",
        email: "fred.ice@example.com"
      },
      {
        fullname: "Jennifer Frost",
        role: "Contributor",
        email: "jfrost@example.com"
      }
    ],
    research_output_count: 3,
    sections: [
      {
        section_title: "Roles and Responsibilities",
        link: "/plan/123/section/1",
        id: "sect_1",
        progress: 1
      },
      {
        section_title: "Types of Data",
        link: "/plan/123/section/2",
        id: "sect_2",
        progress: 1
      },
      {
        section_title: "Data and Metadata formats",
        link: "/plan/123/section/3",
        id: "sect_3",
        progress: 2
      },
      {
        section_title: "Policies for Access and Sharing",
        link: "/plan/123/section/4",
        id: "sect_4",
        progress: 1
      },
      {
        section_title: "Policies for reuse and re-distribution",
        link: "/plan/123/section/5",
        id: "sect_5",
        progress: 0
      },
      {
        section_title: "Plans for archiving and preservation",
        link: "/plan/123/section/6",
        id: "sect_6",
        progress: 0
      }
    ],
    doi: "10.12345/example.123",
    last_updated: "2024-04-01",
    created_date: "2023-07-18"
  };

  return (
    <>
      <PageHeader
        title={plan.title}
        description={t('pageDescription')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation')}>
            <Breadcrumb><Link href="/">{t('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{t('projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects/proj_2425/">Project name</Link></Breadcrumb>
            <Breadcrumb>{plan.title}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className="template-editor-container">
            <div className="main-content">
              <div className="plan-overview">
                <section className="plan-overview-item plan-funder"
                         aria-labelledby="funder-title">
                  <h2 id="funder-title">{t('funder')}</h2>
                  <p className="plan-overview-item-heading">
                    <strong>{plan.funder_name}</strong>
                  </p>
                  <Link href="/plans/123/edit" aria-label={t('editFunder')}>
                    {t('edit')}
                  </Link>
                </section>

                <section className="plan-overview-item plan-members"
                         aria-labelledby="members-title">
                  <h2 id="members-title">{t('planMembers')}</h2>
                  <p className="plan-overview-item-heading">
                    <strong>
                      {t('memberCount', {count: plan.members.length})}
                    </strong>
                  </p>
                  <p>
                    {plan.members.map((member, index) => (
                      <span key={index}>
                        {t('memberInfo', {
                          name: member.fullname,
                          role: member.role
                        })}
                        {index < plan.members.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                  <Link href="/plans/123/edit" aria-label={t('editMembers')}>
                    {t('editMembers')}
                  </Link>
                </section>

                <section className="plan-overview-item research-outputs"
                         aria-labelledby="outputs-title">
                  <h2 id="outputs-title">{t('researchOutputs')}</h2>
                  <p className="plan-overview-item-heading">
                    <strong>
                      {t('outputCount', {count: plan.research_output_count})}
                    </strong>
                  </p>
                  <Link href="/plans/123/edit" aria-label={t('editOutputs')}>
                    {t('editOutputs')}
                  </Link>
                </section>
              </div>

              <section className="plans" aria-labelledby="plans-title">
                {plan.sections.map((section) => (
                  <Card key={section.id}
                        className="plan-sections-list-item">
                    <Link href={section.link}>
                      {section.section_title}
                    </Link>
                    <span className="plan-sections-list-item-progress">
                      {t('progress', {
                        current: section.progress,
                        total: 3
                      })}
                    </span>
                  </Card>
                ))}
              </section>
            </div>
          </div>
        </ContentContainer>

        <SidebarPanel>
          <div>
            <h2>Status</h2>
            <div>
              <h3>Last Updated</h3>
              <p>{plan.last_updated}</p>

              <h3>Published Status</h3>
              <p>{plan.published_status}</p>

              <h3>DOI</h3>
              <p>{plan.doi || 'Not Published'}</p>

              <h3>Visibility Settings</h3>
              <p>{plan.visibility}</p>

              <h3>Download</h3>
              <p><Link href="#">Download this plan as a PDF ↓</Link></p>

              <p>When you save as draft, only you and people with shared access will be able to see this plan. <Link href="#">Learn more</Link></p>

              <button className="react-aria-Button react-aria-Button--primary">Mark as complete</button>

              <h2>Feedback & Collaboration</h2>
              <p>Allow people to access, edit or comment on this plan</p>
              <Link href="#">Manage Access</Link>

              <button className="react-aria-Button react-aria-Button--secondary">Request feedback</button>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewPage;
