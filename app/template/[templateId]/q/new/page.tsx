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
  Text,
  TextField
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";

const QuestionCreatePage: React.FC = () => {
  return (
    <>


      <PageHeader
        title="Create a New Question"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb>Question</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />


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
