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

const SectionCreatePage: React.FC = () => {
  return (
    <>
      <h1>Create a New Section</h1>

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
    </>
  );
}

export default SectionCreatePage;
