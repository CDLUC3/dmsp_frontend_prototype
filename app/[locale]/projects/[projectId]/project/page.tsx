'use client';

import {ContentContainer, LayoutWithPanel} from "@/components/Container";
import React from 'react';
import PageHeader from "@/components/PageHeader";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  FieldError,
  Form,
  Group,
  Heading,
  Input,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectValue,
  Text,
  TextArea,
  TextField
} from "react-aria-components";

const ProjectsProjectDetail = () => {
  const researchDomains = [
    "Life Sciences",
    "Physical Sciences",
    "Social Sciences",
    "Engineering",
    "Environmental Sciences",
    "Computer Science"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    window.location.href = '/projects/create-project/funding';
  }

  return (
    <>
      <PageHeader
        title="Plan: Select a DMP template"
        description="Select a template to use when creating your DMP."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <></>
        }
        className="page-template-list"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <TextField name="project_name" type="text" isRequired>
              <Label>Project Name</Label>
              <Input/>
              <FieldError/>
            </TextField>

            <TextField name="project_abstract" isRequired>
              <Label>Project Abstract</Label>
              <TextArea/>
              <FieldError/>
            </TextField>


            <div className="date-range-group">

              <DatePicker name="start_date">
                <Label>Start Date</Label>
                <Group>
                  <DateInput>
                    {(segment) => <DateSegment segment={segment}/>}
                  </DateInput>
                  <Button>▼</Button>
                </Group>
                <Popover>
                  <Dialog>
                    <Calendar>
                      <header>
                        <Button slot="previous">◀</Button>
                        <Heading className={"text-sm"}/>
                        <Button slot="next">▶</Button>
                      </header>
                      <CalendarGrid>
                        {(date) => <CalendarCell date={date}/>}
                      </CalendarGrid>
                    </Calendar>
                  </Dialog>
                </Popover>
              </DatePicker>


              <DatePicker name="end_date">
                <Label>End Date</Label>
                <Group>
                  <DateInput>
                    {(segment) => <DateSegment segment={segment}/>}
                  </DateInput>
                  <Button>▼</Button>
                </Group>
                <Popover>
                  <Dialog>
                    <Calendar>
                      <header>
                        <Button slot="previous">◀</Button>
                        <Heading className={"text-sm"}/>
                        <Button slot="next">▶</Button>
                      </header>
                      <CalendarGrid>
                        {(date) => <CalendarCell date={date}/>}
                      </CalendarGrid>
                    </Calendar>
                  </Dialog>
                </Popover>
              </DatePicker>
            </div>


            <Select name="research_domain">
              <Label>Research Domain</Label>
              <Text slot="description" className="help">
                This is help text</Text>
              <Button>
                <SelectValue/>
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {researchDomains.map((domain) => (
                    <ListBoxItem key={domain}>{domain}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError/>
            </Select>


            <div className="form-signpost  my-8">
              <div className="form-signpost-inner">
                <div className="">
                  <p className="text-sm">
                    Have a grant already? Not the right project? Use Search
                    projects to find the project. If found key information
                    will be filled in for you.
                  </p>
                </div>
                <div className="form-signpost-button">
                  <Button
                    className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800"
                    onPress={() => window.location.href = '/projects/search'}
                  >
                    Search projects
                  </Button>
                </div>
              </div>
            </div>


            <div className="project-type-section ">
              <h4>This project is mock project for testing, practice, or
                educational purposes</h4>
              <p className={"help"}>
                This is a mock project intended solely for testing, practice, or
                educational purposes.
                It allows you to create a project and plans, but you will not be
                able to receive
                feedback or publish them.
              </p>
              <p className={"help"}>
                <strong>Mock Project: </strong>
                Remain in a testing or educational environment. Your
                project will
                continue to operate in mock mode, allowing you to create
                plans and
                experiments without the ability to receive feedback or
                publish.
                You may upgrade at any time in the future.
              </p>
              <p className={"help"}>
                <strong>Real Project: </strong>
                Convert to a real project, and remove the mock project
                status.
                By doing so, you will gain access to feedback, publishing
                capabilities,
                and additional features. However, this decision is
                permanent and cannot
                be reversed. Proceed only if you are certain you no longer
                need a mock environment.
              </p>


              <RadioGroup name={"project_type"}>
                <Label>Project Type</Label>
                <Radio value="mock">Keep this project as a Mock Project</Radio>
                <Radio value="real">Convert to a real Project</Radio>
              </RadioGroup>


            </div>

            <Button type="submit" className="submit-button">Save</Button>
          </Form>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  )
    ;
};

export default ProjectsProjectDetail;
