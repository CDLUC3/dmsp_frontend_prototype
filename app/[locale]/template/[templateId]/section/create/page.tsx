'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  Label,
  Link,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  DialogTrigger,
  OverlayArrow,
  Popover,
  Dialog,
} from "react-aria-components";
// GraphQL queries and mutations
import {
  useAddSectionMutation,
  useTagsQuery,
} from '@/generated/graphql';

//Components
import {
  LayoutContainer,
  ContentContainer,
} from '@/components/Container';
import { DmpIcon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { DmpEditor } from "@/components/Editor";

import styles from './sectionCreate.module.scss';
interface FormInterface {
  sectionName: string;
  sectionIntroduction: string;
  sectionRequirements: string;
  sectionGuidance: string;
  sectionTags?: TagsInterface[];
}

interface FormErrorsInterface {
  sectionName: string;
}

interface TagsInterface {
  id?: number | null;
  name: string;
  description?: string | null;
}

const CreateSectionPage: React.FC = () => {

  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId/section/create

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  //Set initial Rich Text Editor field values
  const [sectionNameContent, setSectionNameContent] = useState('');
  const [sectionIntroductionContent, setSectionIntroductionContent] = useState('');
  const [sectionRequirementsContent, setSectionRequirementsContent] = useState('');
  const [sectionGuidanceContent, setSectionGuidanceContent] = useState('');

  //Keep form field values in state
  const [formData, setFormData] = useState<FormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
    sectionTags: []
  })

  // Keep track of which checkboxes have been selected
  const [selectedTags, setSelectedTags] = useState<TagsInterface[]>([]);

  // Save errors in state to display on page
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
  });

  //Store selection of tags in state
  const [tags, setTags] = useState<TagsInterface[]>([]);

  // Initialize user addSection mutation
  const [addSectionMutation] = useAddSectionMutation();

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  // Client-side validation of fields
  const validateField = (name: string, value: string | string[] | undefined) => {
    let error = '';
    switch (name) {
      case 'sectionName':
        if (!value || value.length <= 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
    }

    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    return error;
  }

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    // Initialize a flag for form validity
    let isValid = true;
    let errors: FormInterface = {
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
    };

    // Iterate over formData to validate each field
    Object.keys(formData).forEach((key) => {
      const name = key as keyof FormErrorsInterface;
      const value = formData[name];

      // Call validateField to update errors for each field
      const error = validateField(name, value);
      if (error) {
        isValid = false;
        errors[name] = error;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
      sectionTags: []
    });
  }

  const scrollToTop = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Make GraphQL mutation request to create section
  const createSection = async () => {
    try {
      await addSectionMutation({
        variables: {
          input: {
            templateId: Number(templateId),
            name: sectionNameContent,
            introduction: sectionIntroductionContent,
            requirements: sectionRequirementsContent,
            guidance: sectionGuidanceContent,
            displayOrder: 1,
            tags: selectedTags
          }
        }
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, error.message]);
      } else {
        // Other errors will be displayed on page
        setErrors(prevErrors => [...prevErrors, 'Error when creating section']);
      }
    }
  };

  // Handle changes to tag selection
  const handleCheckboxChange = (tag: TagsInterface) => {
    setSelectedTags((prevTags) => {
      // Check if the tag is already selected
      const isAlreadySelected = prevTags.some((selectedTag) => selectedTag.id === tag.id);

      if (isAlreadySelected) {
        // If already selected, remove it
        return prevTags.filter((selectedTag) => selectedTag.id !== tag.id);
      } else {
        // If not selected, add it
        return [...prevTags, tag];
      }
    });
  };

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormData({
      sectionName: sectionNameContent,
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
      sectionTags: selectedTags
    })

    clearAllFieldErrors();

    if (isFormValid()) {
      // Create new section
      await createSection();
      setErrors([]); // Clear errors on successful submit
      scrollToTop(topRef);
    } else {
      const errorMessages = Object.entries(fieldErrors).map(([, value]) => value);
      setErrors(prev => [...prev, ...errorMessages]);
    }
  };

  useEffect(() => {
    if (tagsData?.tags) {
      // Remove __typename field from the tags selection
      /*eslint-disable @typescript-eslint/no-unused-vars*/
      const cleanedData = tagsData.tags.map(({ __typename, ...fields }) => fields);
      setTags(cleanedData);
    }
  }, [tagsData])

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errors.length > 0) {
      scrollToTop(errorRef);
    }
  }, [errors]);

  useEffect(() => {
    setFormData({
      ...formData,
      sectionName: sectionNameContent,
      sectionIntroduction: sectionIntroductionContent,
      sectionRequirements: sectionRequirementsContent,
      sectionGuidance: sectionGuidanceContent
    });
  }, [sectionNameContent, sectionIntroductionContent, sectionRequirementsContent, sectionGuidanceContent])

  return (
    <>
      <PageHeader
        title="Create Section"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/template/#`}>Template</Link></Breadcrumb>
            <Breadcrumb>Edit Section</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container" ref={topRef}>
            <div className="main-content">
              {errors && errors.length > 0 &&
                <div className="error" role="alert" aria-live="assertive" ref={errorRef}>
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>}
              <Tabs>
                <TabList aria-label="Question editing">
                  <Tab id="edit">Edit Question</Tab>
                  <Tab id="options">Options</Tab>
                  <Tab id="logic">Logic</Tab>
                </TabList>
                <TabPanel id="edit">
                  <Form onSubmit={handleFormSubmit}>
                    <Label id="sectionName">Section name</Label>
                    <DmpEditor
                      content={sectionNameContent}
                      setContent={setSectionNameContent}
                      error={fieldErrors['sectionName']}
                      id="sectionName"
                    />

                    <Label id="sectionIntroduction">Section introduction</Label>
                    <DmpEditor
                      content={sectionIntroductionContent}
                      setContent={setSectionIntroductionContent}
                      error={fieldErrors['sectionIntroduction']}
                      id="sectionIntroduction"
                    />

                    <Label id="sectionRequirements">Section requirements</Label>
                    <DmpEditor
                      content={sectionRequirementsContent}
                      setContent={setSectionRequirementsContent}
                      error={fieldErrors['sectionRequirements']}
                      id="sectionRequirements"
                    />

                    <Label id="sectionGuidance">Section guidance</Label>
                    <DmpEditor
                      content={sectionGuidanceContent}
                      setContent={setSectionGuidanceContent}
                      error={fieldErrors['sectionGuidance']}
                      id="sectionGuidance"
                    />

                    <CheckboxGroup name="sectionTags">
                      <Label>Section Best Practices to include</Label>
                      <span className="help">Select one or more tags to associate global best practice guidance written by DMP Tool.</span>
                      <div className={styles.checkboxGroup}>
                        {tags && tags.map(tag => {
                          const id = (tag.id)?.toString();
                          return (
                            <Checkbox
                              value={tag.name}
                              key={tag.name}
                              id={id}
                              onChange={() => handleCheckboxChange(tag)}
                            >
                              <div className="checkbox">
                                <svg viewBox="0 0 18 18" aria-hidden="true">
                                  <polyline points="1 9 7 14 15 4" />
                                </svg>
                              </div>
                              <span className={`${styles.checkboxLabel} checkbox-label`} data-testid='checkboxLabel'>
                                <div className={styles.checkboxWrapper}>
                                  <div>{tag.name}</div>
                                  <DialogTrigger>
                                    <Button className={styles.popoverBtn} aria-label="Click for more info"><div className={styles.icon}><DmpIcon icon="info" /></div></Button>
                                    <Popover>
                                      <OverlayArrow>
                                        <svg width={12} height={12} viewBox="0 0 12 12">
                                          <path d="M0 0 L6 6 L12 0" />
                                        </svg>
                                      </OverlayArrow>
                                      <Dialog>
                                        <div className="flex-col">
                                          {tag.description}
                                        </div>
                                      </Dialog>
                                    </Popover>
                                  </DialogTrigger>
                                </div>
                              </span>
                            </Checkbox>
                          )
                        })}
                      </div>
                    </CheckboxGroup>
                    <Button type="submit">Create Section</Button>

                  </Form>
                </TabPanel>
                <TabPanel id="options">
                  <h2>Options</h2>
                </TabPanel>
                <TabPanel id="logic">
                  <h2>Logic</h2>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default CreateSectionPage;