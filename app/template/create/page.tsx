'use client';

import React from 'react';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  Text,
  TextField
} from "react-aria-components";

const TemplateCreatePage: React.FC = () => {
  return (
    <>
      <h1>Create a template</h1>

      <p>

      </p>

      <Form>
        <TextField
          name="template_name"
          type="text"
          isRequired
        >
          <Label>Template name</Label>
          <Text slot="description" className="help">
            Don’t worry, you can change this later.
          </Text>
          <Input/>
          <FieldError/>
        </TextField>

        <RadioGroup>
          <Label>Template type</Label>
          <Text slot="description" className="help">
            Choose the type of template you want to create.
          </Text>
          <Radio value="previous">Start with one of your previous templates.</Radio>
          <Radio value="dmp">Start with a DMP best practice template.</Radio>
          <Radio value="new">Build new template</Radio>
        </RadioGroup>

        <Button type="submit">Create</Button>

      </Form>
    </>
  );
}

export default TemplateCreatePage;
