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
  Radio,
  RadioGroup,
  Text,
  TextField
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";

const TemplateCreatePage: React.FC = () => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    // redirect to the new template page
    window.location.href = '/template/create/select-template';

  }

  return (
    <>


      <PageHeader
        title="Create a template"
        description="Manager or create DMSP templates, once published researchers will be able to select your template."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/templates">Templates</Link></Breadcrumb>
            <Breadcrumb>Create a template</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-template-list"
      />



      <Form onSubmit={handleSubmit}>
        <TextField
          name="template_name"
          type="text"
          isRequired
        >
          <Label>Template name</Label>
          <Text slot="description" className="help">
            Don’t worry, you can change this later.
          </Text>
          <Input />
          <FieldError />
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

        <Button type="submit"
          className="">Create</Button>

      </Form>
    </>
  );
}

export default TemplateCreatePage;