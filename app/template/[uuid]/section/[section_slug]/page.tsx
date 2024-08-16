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

const SectionEditPage: React.FC = () => {
  // For a real application, you'd fetch the existing section data using the sec_hash

  return (
    <>
      <h1>Edit Section</h1>

      <Form>
        <TextField
          name="section_name"
          type="text"
          isRequired
          defaultValue="Roles and Responsibilities" // Replace with actual data
        >
          <Label>Section name</Label>
          <Text slot="description" className="help">
            Update the section name if necessary.
          </Text>
          <Input/>
          <FieldError/>
        </TextField>

        <TextField
          name="section_description"
          type="text"
          defaultValue="This section outlines the roles and responsibilities for data management." // Replace with actual data
        >
          <Label>Section description</Label>
          <Text slot="description" className="help">
            Update the description for this section.
          </Text>
          <Input/>
          <FieldError/>
        </TextField>

        <Button type="submit">Save Changes</Button>

      </Form>
    </>
  );
}

export default SectionEditPage;
