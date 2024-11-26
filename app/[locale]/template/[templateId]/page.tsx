'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  FieldError,
  Form,
  Heading,
  Label,
  Link,
  Modal,
  Radio,
  RadioGroup,
  Text,
  TextArea,
  TextField,
} from 'react-aria-components';
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
      id: 'sec_789102',
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
      id: 'sec_789103',
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
      id: 'sec_789104',
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

  let [isPublishModalOpen, setPublishModalOpen] = React.useState(false);


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
              <Button
                className="my-3"
                onPress={() => setPublishModalOpen(true)}
              >
                Publish template
              </Button>
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
          <Form>
            <Button className="my-3" data-tertiary
                    onPress={() => console.log('Archive')}>Archive
              Template</Button>
          </Form>
        </div>
      </div>


      <Modal isDismissable
             isOpen={isPublishModalOpen}

             >
        <Dialog>
          <Heading slot="title">Publish</Heading>

          <RadioGroup>
            <Label>Visibility Settings</Label>
            <Text slot="description" className="help">
              You can control who can use this published template.
            </Text>
            <Radio value="public">
              <div>
                <span>Public</span>
                <p className="text-gray-600 text-sm">This will be available and discoverable by plan builders.</p>
              </div>
            </Radio>
            <Radio value="organization">
              <div>
                <span>Organization only</span>
                <p className="text-gray-600 text-sm">Only your organization will be able to view and use this template.</p>
              </div>
            </Radio>
          </RadioGroup>

          <p>
            <strong>
              Publishing this template
            </strong>
          </p>

          <ul>
            <li>
              After publication, all new plans will use this version.
            </li>
            <li>
              In-progress or existing plans will not be updated.
            </li>
            <li>
              You have configured Visibility as Public in Template options.
              All
              DMP Tool users will be able to see and use this template.
            </li>
          </ul>
          <div className="">
            <Form>
              <TextField
                name="change_log"
                isRequired
              >
                <Label>Change log</Label>
                <Text slot="description" className="help">
                  Enter a short description of what has been changed. This will only be visible to
                  people in your organization.
                </Text>
                <TextArea
                  style={{height: '100px'}}
                />
                <FieldError/>
              </TextField>
            </Form>
          </div>


          <div className="modal-actions">
            <div className="">
              <Button data-secondary onPress={() => setPublishModalOpen(false)}>Close</Button>
            </div>
            <div className="">
              <Button onPress={() => setPublishModalOpen(false)}>Save and Publish</Button>
            </div>
          </div>


        </Dialog>
      </Modal>


    </div>
  );
}

export default TemplateEditPage;
