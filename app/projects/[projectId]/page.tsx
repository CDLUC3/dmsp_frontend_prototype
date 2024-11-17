'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {Card} from '@/components/Card/card';

interface Funder {
  name: string;
  shortname: string;
  id: string;
  grantid: string;
}

interface ProjectMember {
  fullname: string;
  role: string;
  email: string;
}

interface ResearchOutput {
  title: string;
}

interface PlanSection {
  section_title: string;
  link: string;
  id: string;
  progress: number;
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
}

const ProjectOverviewPage: React.FC = () => {
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
        fullname: "Frederick Coon",
        role: "PI",
        email: "fcoon@example.com"
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
            link: "/plan/123/section/1",
            id: "sect_1",
            progress: 100
          },
          {
            section_title: "Types of Data",
            link: "/plan/123/section/2",
            id: "sect_2",
            progress: 100
          },
          {
            section_title: "Data and Metadata formats",
            link: "/plan/123/section/3",
            id: "sect_3",
            progress: 66
          },
          {
            section_title: "Policies for Access and Sharing",
            link: "/plan/123/section/4",
            id: "sect_4",
            progress: 100
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
            progress: 100
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
        title={project.title}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <div className="template-editor-container">
        <div className="main-content">
          <div className="project-overview">
            <div className="project-header">
              <h2>{project.title}</h2>
              <p>
                {new Date(project.start_date).toLocaleDateString()} to{' '}
                {new Date(project.end_date).toLocaleDateString()}
              </p>
              <p>
                <Link href="/projects/123/edit">Edit project</Link>
              </p>
            </div>

            <div className="project-funders">
              <h2>Funders ({project.funders.length})</h2>
              {project.funders.map((funder, index) => (
                <div key={funder.id}>
                  <p>{funder.name} ({funder.grantid})</p>
                </div>
              ))}
              <Link href="/projects/123/edit">Edit Funders</Link>
            </div>

            <div className="project-members">
              <h2>Project Members ({project.project_members.length})</h2>
              {project.project_members.map((member, index) => (
                <div key={index}>
                  <p>{member.fullname} ({member.role})</p>
                </div>
              ))}
              <Link href="/projects/123/edit">Edit project members</Link>
            </div>

            <div className="research-outputs">
              <h2>Research Outputs ({project.research_outputs.length})</h2>
              {project.research_outputs.map((output, index) => (
                <div key={index}>
                  <p>{output.title}</p>
                </div>
              ))}
              <Link href="/projects/123/edit">Edit Research outputs</Link>
            </div>

            <div className="plans">
              {project.plans.map((plan) => (
                <div key={plan.id} className="plan-item">
                  <Card>
                    <h2>{plan.template_name}</h2>
                    <p>Funder: {plan.funder_name}</p>

                    <div className="plan-sections">
                      <ul>
                        {plan.sections.map((section) => (
                          <li key={section.id} className="section">
                            <Link href={section.link}>
                              <h3>{section.section_title}</h3>
                              <p>{section.progress}% complete</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="plan-footer">
                      <p>DOI: {plan.doi}</p>
                      <p>Last
                        updated: {new Date(plan.last_updated).toLocaleDateString()}</p>
                      <p>Created: {new Date(plan.created_date).toLocaleDateString()}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectOverviewPage;
