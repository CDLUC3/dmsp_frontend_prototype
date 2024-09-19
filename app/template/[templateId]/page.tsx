'use client';

import React from 'react';
import {Button, Link} from 'react-aria-components';
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEdit from "@/components/QuestionEdit";

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
  ],
};

const TemplateEditPage: React.FC = () => {
  return (
    <div>
      <div className="template-editor-header">
        {/* Using templateId from the URL to create a back link */}
        <Link className="back-link-button" href={`/template`}>
          &larr; Back to template
        </Link>

        <h1 >{template.name}</h1>
        <p style={{color: 'gray', fontSize: '14px'}}>
          by {template.author} - Version: {template.version} -
          Published: {template.publishedDate}
        </p>
      </div>

      <div className="template-editor-container">
        <div className="main-content">

          {template.sections.map((section, index) => (
            <div key={section.id} style={{marginBottom: '40px'}}>

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

              <Button
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  fontSize: '16px',
                  backgroundColor: '#e5e5e5',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Add question
              </Button>
            </div>
          ))}



          <Button
            style={{
              padding: '15px',
              fontSize: '18px',
              backgroundColor: '#e5e5e5',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Add new section
          </Button>

          <div style={{marginTop: '30px'}}>
            <Button

            >
              Save as draft
            </Button>
            <Button

            >
              Preview template
            </Button>
            <Button

            >
              Save and publish
            </Button>
          </div>


        </div>

      </div>


    </div>
  );
}

export default TemplateEditPage;
