'use client';

import React, {useState} from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Input,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
  TextArea,
  TextField,
} from 'react-aria-components';
import PageHeader from '@/components/PageHeader';
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from '@/components/Container';

const ResearchOutputEdit = () => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    abbreviation: '',
    description: '',
    sensitiveData: false,
    personallyIdentifiableInfo: false,
    repository: '',
    accessLevel: '',
    releaseDate: '',
    license: '',
  });

  const researchOutputTypes = [
    'Audiovisual',
    'Collection',
    'Data paper',
    'Dataset',
    'Event',
    'Image',
    'Interactive resource',
    'Model representation',
    'Physical object',
    'Service',
    'Software',
    'Sound',
    'Text',
    'Workflow',
  ];

  const accessLevels = ['Unrestricted', 'Controlled', 'Other'];

  const repositories = [
    'Arctic Research Repository',
    'National Data Repository',
    'University Repository',
  ];


  const handleSubmit = () => {
    console.log('Submitting form data:', formData);

    // Add custom logic for submission
  };

  return (
    <>
      <PageHeader
        title="Edit Research Output"
        description="Edit the details for your research output below."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href="/">Home</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/projects">Projects</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/projects/proj_2425/research-outputs">Research
                Outputs</Link>
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>

          </>
        }
      />

      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <form onSubmit={(e) => e.preventDefault()}>
            <Select name="type"
                >
              <Label>Type</Label>
              <Button>
                <SelectValue/>
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {researchOutputTypes.map((type) => (
                    <ListBoxItem key={type}>{type}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError/>
            </Select>

            <TextField name="title" type="text" isRequired>
              <Label>Title</Label>
              <Input
                value={formData.title}

              />
              <FieldError/>
            </TextField>

            <TextField name="abbreviation" type="text">
              <Label>Abbreviation</Label>
              <Input
                value={formData.abbreviation}
              />
              <FieldError/>
            </TextField>


            <TextField name="description" isRequired>
              <Label>Description</Label>
              <TextArea/>
              <FieldError/>
            </TextField>


            <CheckboxGroup>
              <Label>Data Flags</Label>
              <Text slot="description" className="help">
                Indicate whether this output contains flagged data types.
              </Text>
              <Checkbox value="sensitiveData">
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4"/>
                  </svg>
                </div>
                May contain sensitive data
              </Checkbox>
              <Checkbox value="personalData">
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4"/>
                  </svg>
                </div>
                May contain personally identifiable information
              </Checkbox>

            </CheckboxGroup>

            <Select name="repository">
              <Label>Repository</Label>
              <Button>
                <SelectValue/>
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {repositories.map((repo) => (
                    <ListBoxItem key={repo}>{repo}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError/>
            </Select>

            <Select
              name="accessLevel"
            >
              <Label>Initial Access Level</Label>
              <Button>
                <SelectValue/>
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {accessLevels.map((access) => (
                    <ListBoxItem key={access}>{access}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError/>
            </Select>

            <TextField name="releaseDate" type="text">
              <Label>Anticipated Release Date</Label>
              <Input
                value={formData.releaseDate}
              />
              <FieldError/>
            </TextField>



            <TextField name="license" type="text">
              <Label>Initial License</Label>
              <Input
                value={formData.license}
              />
              <FieldError/>
            </TextField>

            <div className="formActions">
              <Button type="submit" className="primary" onPress={handleSubmit}>
                Save Changes
              </Button>
              <Button
                type="button"
                className="secondary"
                onPress={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </ContentContainer>
        <SidebarPanel/>
      </LayoutWithPanel>
    </>
  );
};

export default ResearchOutputEdit;
