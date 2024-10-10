'use client';

import React from 'react';
import {
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

const SectionCreatePage: React.FC = () => {
  return (
    <>


      {/* Using templateId from the URL to create a back link */}
      <Link className="back-link-button"
      >
        &larr; Back to template
      </Link>

      <h1>Create a New Section</h1>

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

export default SectionCreatePage;