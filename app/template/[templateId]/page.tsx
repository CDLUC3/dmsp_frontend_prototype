'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Button, Link} from 'react-aria-components';
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEdit from "@/components/QuestionEdit";
import PageHeader from "@/components/PageHeader";
import AddQuestionButton from "@/components/AddQuestionButton";
import AddSectionButton from "@/components/AddSectionButton";

interface Question {
  id: string;
  name: string;
  link: string; // Direct link to the question edit page
  order: number;
}

interface Section {
  id: string;
  name: string;
  link: string; // Direct link to the section edit page
  questions: Question[];
}

interface Template {
  id: string;
  name: string;
  author: string;
  version: string;
  publishedDate: string;
  sections: Section[];
}

const template: Template = {
  id: 'tpl_abcdef123456',
  name: 'Arctic Data Center: NSF Polar Programs',
  author: 'National Science Foundation (nsf.gov)',
  version: '6.2',
  publishedDate: 'Jan 1, 2024',
  sections: [
    {
      id: 'sec_123456',
      name: 'Roles and Responsibilities',
      link: '/template/tpl_abcdef123456/section/sec_123456', // Pre-generated link for this section
      questions: [
        {
          id: 'q_abcdef',
          name: 'What parties and individuals will be involved with data management in this project?',
          link: '/template/tpl_abcdef123456/q/q_abcdef', // Pre-generated link for this question
          order: 1,
        },
        {
          id: 'q_ghijkl',
          name: 'Who will be responsible for data oversight?',
          link: '/template/tpl_abcdef123456/q/q_ghijkl',
          order: 2,
        },
      ],
    },
    {
      id: 'sec_789101',
      name: 'Types of Data Produced',
      link: '/template/tpl_abcdef123456/section/sec_789101',
      questions: [
        {
          id: 'q_mnopqr',
          name: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_mnopqr',
          order: 1,
        },
        {
          id: 'q_stuvwx',
          name: 'What type of metadata (information others might need to use your data) will be collected during your project?',
          link: '/template/tpl_abcdef123456/q/q_stuvwx',
          order: 2,
        },
        {
          id: 'q_yzabcd',
          name: 'What will be the approximate number and size of data files that will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_yzabcd',
          order: 3,
        },
      ],
    },
    {
      id: 'sec_789101',
      name: 'Types of Data Produced',
      link: '/template/tpl_abcdef123456/section/sec_789101',
      questions: [
        {
          id: 'q_mnopqr',
          name: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_mnopqr',
          order: 1,
        },
        {
          id: 'q_stuvwx',
          name: 'What type of metadata (information others might need to use your data) will be collected during your project?',
          link: '/template/tpl_abcdef123456/q/q_stuvwx',
          order: 2,
        },
        {
          id: 'q_yzabcd',
          name: 'What will be the approximate number and size of data files that will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_yzabcd',
          order: 3,
        },
      ],
    },
    {
      id: 'sec_789101',
      name: 'Types of Data Produced',
      link: '/template/tpl_abcdef123456/section/sec_789101',
      questions: [
        {
          id: 'q_mnopqr',
          name: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_mnopqr',
          order: 1,
        },
        {
          id: 'q_stuvwx',
          name: 'What type of metadata (information others might need to use your data) will be collected during your project?',
          link: '/template/tpl_abcdef123456/q/q_stuvwx',
          order: 2,
        },
        {
          id: 'q_yzabcd',
          name: 'What will be the approximate number and size of data files that will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_yzabcd',
          order: 3,
        },
      ],
    },
    {
      id: 'sec_789101',
      name: 'Types of Data Produced',
      link: '/template/tpl_abcdef123456/section/sec_789101',
      questions: [
        {
          id: 'q_mnopqr',
          name: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_mnopqr',
          order: 1,
        },
        {
          id: 'q_stuvwx',
          name: 'What type of metadata (information others might need to use your data) will be collected during your project?',
          link: '/template/tpl_abcdef123456/q/q_stuvwx',
          order: 2,
        },
        {
          id: 'q_yzabcd',
          name: 'What will be the approximate number and size of data files that will be produced during your project?',
          link: '/template/tpl_abcdef123456/q/q_yzabcd',
          order: 3,
        },
      ],
    },
  ],
};

const TemplateEditPage: React.FC = () => {
  return (
    <div>

      <PageHeader
        title={template.name}
        description={`by ${template.author} - Version: ${template.version} - Published: ${template.publishedDate}`}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb>{template.name}</Breadcrumb>
          </Breadcrumbs>
        }

        className="page-template-overview"
      />


      <div className="template-editor-container">
        <div className="main-content">

          <div className="">
            {template.sections.map((section, index) => (
              <div key={section.id} role="list" aria-label="Questions list"
                   style={{marginBottom: '40px'}}>

                <SectionHeaderEdit
                  key={section.id}
                  sectionNumber={index + 1}
                  title={section.name}
                  editUrl={section.link}
                  onMoveUp={() => null}
                  onMoveDown={() => null}
                />

                {section.questions.map((question) => (
                  <QuestionEdit
                    key={question.id}
                    id={question.id}
                    name={question.name}
                    link={question.link}
                  />
                ))}
                <AddQuestionButton
                  href={`/template/${template.id}/q/new?section_id=${section.id}`}
                />
              </div>

            ))}

          </div>

          <AddSectionButton href={`/template/${template.id}/section/new`}/>


        </div>
        <aside className="sidebar">
          <div className="sidebar-inner">
            <h2>Status</h2>
            <div className="sidebar-section">

              <Button data-secondary className="my-3 secondary"
                      onPress={() => console.log('Save draft')}>
                Save as draft
              </Button>

              <Button data-tertiary className="my-3"
                      onPress={() => console.log('Preview')}>Preview
                template</Button>

            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-section-title">Published Status</h5>
              <div className="status">
                <p>
                  Draft <Link href='#'>Edit</Link>
                </p>
              </div>
            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-section-title">Visibility Settings</h5>
              <div className="status">
                <p>
                  Not Published <Link href='#'>Edit</Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <h5 className="sidebar-section-title">Feedback &
                Collaboration</h5>
              <div className="description">
                <p>
                  Allow people to access, edit or comment on this plan
                </p>
                <p>
                  <Link className="learn-more"
                        href="/template/tpl_abcdef123456/access">
                    Manage Access
                  </Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <Button className="my-3" onPress={() => console.log('Publish')}>Publish
                template</Button>
              <h5 className="sidebar-section-title">History</h5>
              <p>
                <Link className="learn-more"
                      href="/template/tpl_abcdef123456/history">
                  Template history
                </Link>
              </p>
            </div>


          </div>
        </aside>
      </div>
      <div className="template-archive-container">
        <div className="main-content">
          <h2>
            Archive Template
          </h2>
          <p>
            This template will no longer be visible to plan creators.
            Pre-existing
            plans that use this template will be unaffected. This is not
            reversible.
          </p>
          <form>
            <Button className="my-3" data-tertiary
                    onPress={() => console.log('Archive')}>Archive
              Template</Button>
          </form>
        </div>
      </div>


    </div>
  );
}

export default TemplateEditPage;
