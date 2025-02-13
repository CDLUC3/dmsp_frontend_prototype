'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text,
  TextField
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import RadioGroupComponent from '@/components/Form/RadioGroup';
import SlideInPanel from '@/components/SlideInComponent';

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
      <SlideInPanel />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <TextField
              name="template_name"
              type="text"
              isRequired
            >
              <Label>{CreateProject('form.projectTitle')}</Label>
              <Text slot="description" className="help">
                {CreateProject('form.projectTitleHelpText')}
              </Text>
              <Input />
              <FieldError />
            </TextField>

            <RadioGroupComponent
              radioGroupLabel={radioData.radioGroupLabel}
              radioButtonData={radioData.radioButtonData}
            />

            {/* 
            <RadioGroup>
              <Label>{CreateProject('form.newOrExisting')}</Label>

              <Radio value="previous">{CreateProject('form.radioExistingLabel')}</Radio>
              <Text slot="description" className="help">
                {CreateProject('form.radioExistingHelpText')}
              </Text>

              <Radio value="new">{CreateProject('form.radioNewLabel')}</Radio>
              <Text slot="description" className="help">
                {CreateProject('form.radioNewHelpText')}
              </Text>
            </RadioGroup> */}

            <CheckboxGroup className="checkbox-group">
              <Label>{CreateProject('form.checkboxGroupLabel')}</Label>
              <Text slot="description" className="help">
                {CreateProject('form.checkboxGroupHelpText')}
              </Text>
              <Checkbox value="is_mock_project">
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                <div className="">
                  <span>
                    {CreateProject('form.checkboxLabel')}
                  </span>
                  <br />
                  <span className="help">
                    {CreateProject('form.checkboxHelpText')}
                  </span>
                </div>
              </Checkbox>
            </CheckboxGroup>


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
