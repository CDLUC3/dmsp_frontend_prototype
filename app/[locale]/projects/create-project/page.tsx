'use client';

import React from 'react';
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
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";


const ProjectsCreateProject = () => {

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
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
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
            <TextField
              name="template_name"
              type="text"
              isRequired
            >
              <Label>What is the title of the project?</Label>
              <Text slot="description" className="help">
                This should be the formal title if you have already applied for
                funding, as it will be used to find your Project in the Funder’s
                database. This can be changed later.
              </Text>
              <Input/>
              <FieldError/>
            </TextField>

            <RadioGroup>
              <Label>New or existing project?</Label>
              <Text slot="description" className="help">
                We will search for the project and pull in associated
                information for you to review and edit if possible, otherwise
                create a brand new project
              </Text>
              <Radio value="previous">The project already exists or might
                exist</Radio>
              <Radio value="new">New project</Radio>
            </RadioGroup>


            <CheckboxGroup className="checkbox-group">
              <Label>This project is mock project for testing, practice, or
                educational purposes</Label>
              <Text slot="description" className="help">
                This is a mock project intended solely for testing, practice, or
                educational purposes. It allows you to create a project and
                plans, but you will not be able to receive feedback or publish
                them.
              </Text>
              <Checkbox value="is_mock_project">
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4"/>
                  </svg>
                </div>
                <div className="">
                <span>
                  Yes, set this project to a mock or a test project.
                </span>
                  <br/>
                  <span className="help">
                      If you aim on publishing your DMSP eventually, we recommend
                    leaving this unticked, so you get the full features. All
                    real projects have a draft status you can use for testing.
                </span>
                </div>
              </Checkbox>
            </CheckboxGroup>


            <Button type="submit"
                    className="">Continue</Button>

          </Form>

        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>


    </>
  );
};
export default ProjectsCreateProject;
