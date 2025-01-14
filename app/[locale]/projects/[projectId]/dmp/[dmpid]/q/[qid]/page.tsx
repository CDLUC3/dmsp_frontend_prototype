'use client';

import React, {useState} from 'react';
import {Breadcrumb, Breadcrumbs, Form, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewQuestionPage.module.scss';
import {useTranslations} from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {DmpEditor} from "@/components/Editor";
import {Card,} from "@/components/Card/card";

interface Question {
  id: string;
  title: string;
  link: string;
  isAnswered: boolean;
}

const PlanOverviewQuestionPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const html = String.raw;
  const richtextDefault = html`test`;
  const [editorContent, setEditorContent] = useState(richtextDefault);

  const plan = {
    id: "plan_123",
    template_name: "NSF Polar Programs",
    title: "NSF Polar Programs",
    funder_name: "National Science Foundation"
  };

  const questions: Question[] = [
    {
      id: "q1",
      title: "What types of data, samples, collections, software, materials, etc. will be produced during your project?",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2544",
      isAnswered: true
    },
    {
      id: "q2",
      title: "What type of metadata (information others might need to use your data) will be collected during...",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2545",
      isAnswered: false
    },
    {
      id: "q3",
      title: "Will all data collected be converted to open source formats?",
      link: "/en-US/projects/proj_2425/dmp/xxx/q/2546",
      isAnswered: false
    }
  ];

  return (
    <>
      <PageHeader
        title="What types of data, samples, collections, software, materials, etc. will be produced during your project?"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb><Link
              href="/en-US">{t('navigation.home')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/en-US/projects">{t('navigation.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/en-US/projects/proj_2425/">Project
              name</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/en-US/projects/proj_2425/dmp/xxx/">{plan.title}</Link></Breadcrumb>
            <Breadcrumb>Data and Metadata Formats</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className="container">
            <section>
              <h4>Requirements by {plan.funder_name}</h4>
              <p>
                The Arctic Data Center requires when submitting to the Center,
                include methods to create these types of data.
              </p>
              <p>
                If using proprietary formats like Excel or MATLAB, plan to
                convert them to open-source formats before submission. If
                conversion isn&#39;t possible, explain why
              </p>

              <h4>Requirements by University of California</h4>
              <p>
                The management of data and metadata is essential for supporting
                research integrity, reproducibility and collaboration. This
                section seeks to document the types and formats of data and
                metadata that will be generated in your project. Properly
                formatted and well-documented data enhance the visibility of
                your research, promote collaboration among users and ensure
                compliance with institutional policies and guidelines.
              </p>
            </section>

            <Card>
              <Form>
                <span>Question</span>
                <h2>
                  What types of data, samples, collections, software, materials, etc. will be produced during your project?
                </h2>

                <DmpEditor content={"test test"} setContent={setEditorContent} />

                <div className="lastSaved mt-5 ">
                  Last saved X minutes ago
                </div>
              </Form>
            </Card>



            <section>
              <h4>Guidance by {plan.funder_name}</h4>
              <p>
                In your Data Management Plan (DMP), detail the types of data and
                materials expected to be produced in your project. This includes
                specifying raw and processed data, biological samples, chemical
                compounds, survey data and software. Highlight the formats (for
                example CSV, JSON, executable files) and the scale of data
                production (for example terabytes of data, hundreds of samples).
              </p>
              <p>
                Additionally, mention any unique elements like multimedia files
                or large-scale images and address specific storage needs or
                management challenges. Providing this comprehensive overview
                helps stakeholders understand the scope of your project&#39;s data
                requirements and ensures alignment with data management and
                sharing policies.
              </p>
              <p>
                NSF Helpdesk (open in new window) NSF.gov (open in new window)
                funding.nsf.gov (open in new window)
              </p>

              <h4>Guidance by University of California</h4>
              <p>
                This is the most detailed section of the data management plan.
                Describe the categories of data being collected and how they tie
                into the data associated with the methods used to collect that
                data.
              </p>
              <p>
                Expect this section to be the most detailed section, taking up a
                large portion of your data management plan document.
              </p>
            </section>

            <div className={styles.actions} >
              <div className={styles.actionItem}>
                <button
                  className="react-aria-Button react-aria-Button--primary">
                  Back to Section
                </button>
              </div>
              <div className={styles.actionItem}>
                <button
                  className="react-aria-Button react-aria-Button--primary">
                  Save
                </button>
                <p className={styles.lastSaved}>
                  Last saved: X mins ago
                </p>

              </div>
            </div>


          </div>
        </ContentContainer>

        <SidebarPanel>
          <div className={styles.bestPracticesPanel}>
            <h3>Best practice by DMP Tool</h3>
            <p>Most relevant best practice guide</p>

            <div className={styles.bestPracticesLinks}>
              <Link href="/best-practices/sharing">
                Data sharing
                <svg width="20" height="20" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/preservation">
                Data preservation
                <svg width="20" height="20" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/protection">
                Data protection
                <svg width="20" height="20" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>

              <Link href="/best-practices/all">
                All topics
                <svg width="20" height="20" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"/>
                </svg>
              </Link>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
}

export default PlanOverviewQuestionPage;
