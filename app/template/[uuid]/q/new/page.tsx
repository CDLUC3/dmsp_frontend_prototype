'use client';

import React from 'react';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Text,
  TextField
} from "react-aria-components";

const QuestionCreatePage: React.FC = () => {
  return (
    <>
      <h1>Create a New Question</h1>

      <Form>
        <TextField
          name="question_text"
          type="text"
          isRequired
        >
          <Label>Question text</Label>
          <Text slot="description" className="help">
            Enter the question that you want to include in this section.
          </Text>
          <Input/>
          <FieldError/>
        </TextField>

        <TextField
          name="question_help_text"
          type="text"
        >
          <Label>Help text</Label>
          <Text slot="description" className="help">
            Optionally, provide help text or additional context for this question.
          </Text>
          <Input/>
          <FieldError/>
        </TextField>

        <Button type="submit">Create Question</Button>

      </Form>
    </>
  );
}

export default QuestionCreatePage;
