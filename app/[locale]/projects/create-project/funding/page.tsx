'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { routePath } from '@/utils/routes';


const ProjectsCreateProjectFunding = () => {
  const router = useRouter();

  const [hasFunding, setHasFunding] = useState("yes");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasFunding === 'yes') {
      router.push(routePath('projects.create.funder.search'))
    } else {
      router.push(routePath('projects.show', { projectId: 'proj_2425new' }))
    }
  }

  return (
    <>
      <PageHeader
        title="Do you already have funding for this project?"
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
        className="page-project-create-project-funding"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>

            <RadioGroup
              name="has_funding"
              value={hasFunding} // Bind to state
              onChange={setHasFunding}
            >
              <Label>Do you already have funding for this project?</Label>
              <Text slot="description" className="help">
                if yes, we will try to search for the project and pull in associated
                information for you to review and edit.
              </Text>
              <Radio value="yes">
                Yes
              </Radio>
              <Radio value="no">No</Radio>
            </RadioGroup>



            <Button type="submit"
              className="">Continue</Button>

          </Form>

        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>


    </>
  );
};
export default ProjectsCreateProjectFunding;