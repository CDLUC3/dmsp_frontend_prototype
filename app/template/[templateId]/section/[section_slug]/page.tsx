'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";

const SectionEditPage: React.FC = () => {
  // For a real application, you'd fetch the existing section data using the sec_hash

  return (
    <>


      <PageHeader
        title={`Edit Section`}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/template/#`}>Template</Link></Breadcrumb>
            <Breadcrumb>Edit Section</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <div className="template-editor-container">
        <div className="main-content">

          <Tabs>
            <TabList aria-label="Question editing">
              <Tab id="edit">Edit Question</Tab>
              <Tab id="options">Options</Tab>
              <Tab id="logic">Logic</Tab>
            </TabList>
            <TabPanel id="edit">
              <Form>
                <TextField
                  name="section_name"
                  type="text"
                  isRequired
                >
                  <Label>Section name</Label>
                  <Text slot="description" className="help">
                    Don’t worry, you can change this later.
                  </Text>
                  <Input/>
                  <FieldError/>
                </TextField>

                <TextField
                  name="section_description"
                  type="text"
                >
                  <Label>Section description</Label>
                  <Text slot="description" className="help">
                    Optionally, provide a description for this section.
                  </Text>
                  <Input/>
                  <FieldError/>
                </TextField>

                <Button type="submit">Create Section</Button>

              </Form>
            </TabPanel>
            <TabPanel id="options">
              <h2>Options</h2>
            </TabPanel>
            <TabPanel id="logic">
              <h2>Logic</h2>
            </TabPanel>
          </Tabs>
        </div>
      </div>

    </>
  );
}

export default SectionEditPage;
