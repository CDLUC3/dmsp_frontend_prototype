'use client';

import React, {useState} from 'react';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Text,
  TextArea,
  TextField,
} from "react-aria-components";
import {Card} from "@/components/Card/card";

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

const QuestionEditPage: React.FC = () => {
  // State for managing form inputs
  const [question, setQuestion] = useState(sampleQuestion);

  const handleGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({...question, guidance: e.currentTarget.value});
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{width: '60%'}}>


        {/* Using templateId from the URL to create a back link */}
        <Link href={`/template/${question.templateId}`}>
          ← Back to template
        </Link>


        <h1>Edit: {question.text}</h1>


        <Card>
          <Form>
            <TextField
              name="type"
              type="text"
              isRequired
              value={question.type}
            >
              <Label>Type (required)</Label>
              <Input disabled/>
              <FieldError/>
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
              <FieldError/>
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
                style={{height: '100px'}}
              />
              <FieldError/>
            </TextField>

            <TextField
              name="question_guidance"
              value={question.guidance}
            >
              <Label>Question guidance (optional but recommended)</Label>
              <TextArea
                value={question.guidance}
                onChange={handleGuidanceChange}
                style={{height: '150px'}}
              />
              <FieldError/>
            </TextField>

            <TextField
              name="sample_text"
              value={question.sampleText}
            >
              <Label>Sample text</Label>
              <Text slot="description" className="help">
                Provide an example or template of expected answer (optional but
                recommended)
              </Text>
              <TextArea
                value={question.sampleText}
                onChange={(e) => setQuestion({
                  ...question,
                  sampleText: e.currentTarget.value
                })}
                style={{height: '80px'}}
              />
              <FieldError/>
            </TextField>

            <Button type="submit">Save</Button>

          </Form>
        </Card>
      </div>

      <div style={{
        width: '35%',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px'
      }}>
        <h2>Preview</h2>
        <p>See how this question will look to users.</p>
        <Button>Preview question</Button>

        <h3>Best practice by DMP Tool</h3>
        <p>Keep the question concise and clear. Use the requirements or guidance
          to provide additional explanation.</p>
        <p>Outline the requirements that a user must consider for this
          question.</p>
        <p>Researchers will be able to copy the sample text into the field as a
          starting point, as a way to speed up content entry.</p>
      </div>
    </div>
  );
}

export default QuestionEditPage;
