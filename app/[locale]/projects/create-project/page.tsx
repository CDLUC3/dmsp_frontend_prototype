'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {
  RadioGroupComponent,
  CheckboxGroupComponent,
  FormInput
} from '@/components/Form';

import styles from './createProject.module.scss';

const ProjectsCreateProject = () => {
  // localization keys
  const Global = useTranslations('Global');
  const CreateProject = useTranslations('ProjectsCreateProject');

  const radioData = {
    radioGroupLabel: CreateProject('form.newOrExisting'),
    radioButtonData: [
      {
        value: 'previous',
        label: CreateProject('form.radioExistingLabel'),
        description: CreateProject('form.radioExistingHelpText'),
      },
      {
        value: 'new',
        label: CreateProject('form.radioNewLabel'),
        description: CreateProject('form.radioNewHelpText')
      }
    ]
  }

  const checkboxData = [
    {
      value: 'mock_project',
      label: CreateProject('form.checkboxLabel'),
      description: CreateProject('form.checkboxHelpText')
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    // redirect to the new template page
    window.location.href = '/projects/create-project/funding';

  }

  return (
    <>
      <PageHeader
        title="Create a project"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-create-project"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <FormInput
              name="project_name"
              type="text"
              label={CreateProject('form.projectTitle')}
              description={CreateProject('form.projectTitleHelpText')}
              isRequired={true}
            />
            <RadioGroupComponent
              radioGroupLabel={radioData.radioGroupLabel}
              radioButtonData={radioData.radioButtonData}
            />

            <CheckboxGroupComponent
              checkboxGroupLabel={CreateProject('form.checkboxGroupLabel')}
              checkboxGroupDescription={CreateProject('form.checkboxGroupHelpText')}
              checkboxData={checkboxData}
            />

            <Button type="submit"
              className="">{Global('buttons.continue')}</Button>

          </Form>

        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>


    </>
  );
};
export default ProjectsCreateProject;
