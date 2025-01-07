'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  SectionsDisplayOrderDocument,
  useSectionQuery
} from '@/generated/graphql';

//Components
import {
  LayoutContainer,
  ContentContainer,
} from '@/components/Container';
import { DmpIcon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { DmpEditor } from "@/components/Editor";

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

const SectionUpdatePage: React.FC = () => {

  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId/section/create
  const { section_slug: sectionId } = params;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  //Set initial Rich Text Editor field values
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
  const [maxDisplayOrderNum, setMaxDisplayOrderNum] = useState<number>(0);
  // Save errors in state to display on page
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
  });

  // localization keys
  const Global = useTranslations('Global');
  const SectionUpdatePage = useTranslations('SectionUpdatePage');
  const Section = useTranslations('Section');

  //Store selection of tags in state
  const [tags, setTags] = useState<TagsInterface[]>([]);
  const [checkboxTags, setCheckboxTags] = useState<string[]>([]);

  // Initialize user addSection mutation
  const [addSectionMutation] = useAddSectionMutation();

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  // Query for the specified section
  const { data, loading } = useSectionQuery({
    variables: {
      sectionId: Number(sectionId)
    }
  })

  const [sectionNameContent, setSectionNameContent] = useState(
    data?.section?.name ? `<p>${data.section.name}</p>` : '<p></p>'
  );


  // Get the current max display order number + 1
  const getNewDisplayOrder = () => {
    return maxDisplayOrderNum + 1;
  }

  // Client-side validation of fields
  const validateField = (name: string, value: string | string[] | undefined) => {
    let error = '';
    switch (name) {
      case 'sectionName':
        if (!value || value.length <= 2) {
          error = SectionUpdatePage('messages.fieldLengthValidation')
        }
        break;
    }

    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    if (error.length > 1) {
      setErrors(prev => [...prev, error]);
    }

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
      const newDisplayOrder = getNewDisplayOrder();
      await addSectionMutation({
        variables: {
          input: {
            templateId: Number(templateId),
            name: sectionNameContent,
            introduction: sectionIntroductionContent,
            requirements: sectionRequirementsContent,
            guidance: sectionGuidanceContent,
            displayOrder: newDisplayOrder,
            tags: selectedTags
          }
        },
        refetchQueries: [{ //Need to update the sectionDisplayOrders with latest from db
          query: SectionsDisplayOrderDocument,
          variables: {
            templateId: Number(templateId)
          }
        }]
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, error.message]);
      } else {
        setErrors(prevErrors => [...prevErrors, SectionUpdatePage('messages.errorCreatingSection')]);
      }
    }
  };

  // Handle changes to tag checkbox selection
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

    setSuccessMessage('');

    clearAllFieldErrors();

    if (isFormValid()) {
      // Create new section
      await createSection();
      setErrors([]); // Clear errors on successful submit
      // For now, scroll to top of page to provide some feedback that form was successfully submitted
      // TODO: add flash/toast message to signal to user that form was successfully submitted
      setSuccessMessage(SectionUpdatePage('messages.success'))
      scrollToTop(topRef);
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
    if (data && data.section) {
      const section = data.section;
      setSectionNameContent(`<p>${section.name}</p>`);
      setSectionIntroductionContent(section?.introduction ? section.introduction : '');
      setSectionRequirementsContent(section?.requirements ? section.requirements : '');
      setSectionGuidanceContent(section?.guidance ? section.guidance : '');
      setFormData({
        ...formData,
        sectionName: section.name,
        sectionIntroduction: section?.introduction ? section.introduction : '',
        sectionRequirements: section?.requirements ? section.requirements : '',
        sectionGuidance: section?.guidance ? section.guidance : ''
      });

      if (data.section?.tags) {
        const cleanedTags = data.section?.tags.filter(tag => tag !== null && tag !== undefined);
        setSelectedTags((prevTags) => {
          return [...prevTags, ...cleanedTags];
        });
        const selectedTagNames = cleanedTags.map(tag => {
          return tag.name;
        });
        setCheckboxTags(selectedTagNames);
      }
    }
  }, [data])

  // We need this so that the page waits to render until data is available
  if (loading) {
    return <div>Loading...</div>;
  }

  const selectedTagsArray = selectedTags.map(tag => {
    return tag.name;
  });

  console.log(selectedTags);
  console.log(selectedTagsArray)

  return (
    <>
      <PageHeader
        title={SectionUpdatePage('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/template/#`}>{Global('breadcrumbs.template')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.editSection')}</Breadcrumb>
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
                <div className="messages error" role="alert" aria-live="assertive" ref={errorRef}>
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              }

              {successMessage && (
                <div className="messages success" role="alert" aria-live="assertive">
                  <p>{successMessage}</p>
                </div>
              )}
              <Tabs>
                <TabList aria-label="Question editing">
                  <Tab id="edit">{Section('tabs.editSection')}</Tab>
                  <Tab id="options">{Section('tabs.options')}</Tab>
                  <Tab id="logic">{Section('tabs.logic')}</Tab>
                </TabList>
                <TabPanel id="edit">
                  <Form onSubmit={handleFormSubmit}>
                    <Label htmlFor="sectionName" id="sectionNameLabel">{Section('labels.sectionName')}</Label>
                    <DmpEditor
                      content={sectionNameContent || '<p></p>'}
                      setContent={setSectionNameContent}
                      error={fieldErrors['sectionName']}
                      id="sectionName"
                      labelId="sectionNameLabel"
                    />

                    <Label htmlFor="sectionIntroduction" id="sectionIntroductionLabel">{Section('labels.sectionIntroduction')}</Label>
                    <DmpEditor
                      content={sectionIntroductionContent}
                      setContent={setSectionIntroductionContent}
                      error={fieldErrors['sectionIntroduction']}
                      id="sectionIntroduction"
                      labelId="sectionIntroductionLabel"
                    />

                    <Label htmlFor="sectionRequirementsLabel" id="sectionRequirements">{Section('labels.sectionRequirements')}</Label>
                    <DmpEditor
                      content={sectionRequirementsContent}
                      setContent={setSectionRequirementsContent}
                      error={fieldErrors['sectionRequirements']}
                      id="sectionRequirements"
                      labelId="sectionRequirementsLabel"
                    />

                    <Label htmlFor="sectionGuidanceLabel" id="sectionGuidance">{Section('labels.sectionGuidance')}</Label>
                    <DmpEditor
                      content={sectionGuidanceContent}
                      setContent={setSectionGuidanceContent}
                      error={fieldErrors['sectionGuidance']}
                      id="sectionGuidance"
                      labelId="sectionGuidanceLabel"
                    />

                    <CheckboxGroup
                      name="sectionTags"
                      defaultValue={checkboxTags}
                    >
                      <Label>{Section('labels.bestPracticeTags')}</Label>
                      <span className="help">{Section('helpText.bestPracticeTagsDesc')}</span>
                      <div className="checkbox-group">
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
                              <span className="checkbox-label" data-testid='checkboxLabel'>
                                <div className="checkbox-wrapper">
                                  <div>{tag.name}</div>
                                  <DialogTrigger>
                                    <Button className="popover-btn" aria-label="Click for more info"><div className="icon"><DmpIcon icon="info" /></div></Button>
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
                    <Button type="submit">{SectionUpdatePage('button.updateSection')}</Button>

                  </Form>
                </TabPanel>
                <TabPanel id="options">
                  <h2>{Section('tabs.options')}</h2>
                </TabPanel>
                <TabPanel id="logic">
                  <h2>{Section('tabs.logic')}</h2>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default SectionUpdatePage;
