'use client';

import React, { useState } from 'react';
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
  TextArea,
  TextField
} from "react-aria-components";
import { useParams } from 'next/navigation';


// Components
import PageHeader from "@/components/PageHeader";

// Sample data stub representing data fetched from a GraphQL server
const sampleQuestion = {
  id: 'q_mnopqr',
  templateId: 't_abcdef', // Added template ID
  type: 'Rich Text',
  text: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
  requirements: 'Keep the question concise and clear. Use the requirements or guidance to provide additional explanation.',
  guidance: 'Be concise\nExplain the data file format\nExplain the expected size\nExplain the blah blah blah blah blah blah blah',
  sampleText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};

const QuestionEditPage = ({ questionTypeId }: { questionTypeId?: number | null }) => {
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId
  const { q_slug } = params; //question id

  // State for managing form inputs
  const [question, setQuestion] = useState(sampleQuestion);
  const handleGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, guidance: e.currentTarget.value });
  };

  const handleSave = async () => {
    /*If a 'q_slug' exists in path, we will update that existing question, otherwise
    we will add a new question */
    if (q_slug) {
      // Update mutation for question
    } else {
      // Add mutation for question
    }
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${question.text}`}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>Edit Template</Link></Breadcrumb>
            <Breadcrumb>Question</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <div className="template-editor-container">


        <div className="main-content">


          {/* Using templateId from the URL to create a back link */}


          <Tabs>
            <TabList aria-label="Question editing">
              <Tab id="edit">Edit Question</Tab>
              <Tab id="options">Options</Tab>
              <Tab id="logic">Logic</Tab>
            </TabList>
            <TabPanel id="edit">
              <Form>
                <TextField
                  name="type"
                  type="text"
                  isRequired
                  value={question.type}
                >
                  <Label>Type (required)</Label>
                  <Input disabled />
                  <FieldError />
                  <Button type="button">Change type</Button>
                </TextField>

                <TextField
                  name="question_text"
                  type="text"
                  isRequired
                  value={question.text}
                >
                  <Label>Question text (required)</Label>
                  <Input
                    value={question.text}
                    onChange={(e) => setQuestion({
                      ...question,
                      text: e.currentTarget.value
                    })}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="question_requirements"
                  isRequired
                  value={question.requirements}
                >
                  <Label>Question requirements (required)</Label>
                  <Text slot="description" className="help">
                    Keep the question concise and clear. Use the requirements or
                    guidance to provide additional explanation.
                  </Text>
                  <TextArea
                    value={question.requirements}
                    onChange={(e) => setQuestion({
                      ...question,
                      requirements: e.currentTarget.value
                    })}
                    style={{ height: '100px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="question_guidance"
                  value={question.guidance}
                >
                  <Label>Question guidance (optional but recommended)</Label>
                  <TextArea
                    value={question.guidance}
                    onChange={handleGuidanceChange}
                    style={{ height: '150px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="sample_text"
                  value={question.sampleText}
                >
                  <Label>Sample text</Label>
                  <Text slot="description" className="help">
                    Provide an example or template of expected answer (optional
                    but
                    recommended)
                  </Text>
                  <TextArea
                    value={question.sampleText}
                    onChange={(e) => setQuestion({
                      ...question,
                      sampleText: e.currentTarget.value
                    })}
                    style={{ height: '80px' }}
                  />
                  <FieldError />
                </TextField>

                <Button type="submit" onPress={handleSave}>Save</Button>

              </Form>
            </TabPanel>
            <TabPanel id="options">
              <h2>Options</h2>
            </TabPanel>
            <TabPanel id="logic">
              <h2>logic</h2>
            </TabPanel>
          </Tabs>

        </div >

        <div className="sidebar">
          <h2>Preview</h2>
          <p>See how this question will look to users.</p>
          <Button>Preview question</Button>

          <h3>Best practice by DMP Tool</h3>
          <p>Keep the question concise and clear. Use the requirements or
            guidance
            to provide additional explanation.</p>
          <p>Outline the requirements that a user must consider for this
            question.</p>
          <p>Researchers will be able to copy the sample text into the field as
            a
            starting point, as a way to speed up content entry.</p>
        </div>
      </div >
    </>

  );
}

export default QuestionEditPage;
