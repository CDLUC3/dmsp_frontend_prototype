'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  DialogTrigger,
  Form,
  Label,
  Link,
  OverlayArrow,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
// GraphQL queries and mutations
import {
  SectionErrors,
  SectionsDisplayOrderDocument,
  useAddSectionMutation,
  useSectionsDisplayOrderQuery,
  useTagsQuery
} from '@/generated/graphql';

//Components
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import { DmpIcon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import ErrorMessages from '@/components/ErrorMessages';
import FormInput from '@/components/Form/FormInput';
import { stripHtmlTags } from '@/utils/general';
import { scrollToTop } from '@/utils/general';

import {
  SectionFormErrorsInterface,
  SectionFormInterface,
  TagsInterface
} from '@/app/types';
import { useToast } from '@/context/ToastContext';

const CreateSectionPage: React.FC = () => {

  const toastState = useToast(); // Access the toast state from context

  // Get templateId param
  const params = useParams();
  const router = useRouter();
  const { templateId } = params; // From route /template/:templateId/section/create

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  //Set initial Rich Text Editor field values
  const [sectionNameContent, setSectionNameContent] = useState('');
  const [sectionIntroductionContent, setSectionIntroductionContent] = useState('');
  const [sectionRequirementsContent, setSectionRequirementsContent] = useState('');
  const [sectionGuidanceContent, setSectionGuidanceContent] = useState('');

  //Keep form field values in state
  const [formData, setFormData] = useState<SectionFormInterface>({
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
  const [fieldErrors, setFieldErrors] = useState<SectionFormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
  });

  // localization keys
  const Global = useTranslations('Global');
  const CreateSectionPage = useTranslations('CreateSectionPage');
  const Section = useTranslations('Section');

  //Store selection of tags in state
  const [tags, setTags] = useState<TagsInterface[]>([]);

  // Initialize user addSection mutation
  const [addSectionMutation] = useAddSectionMutation();

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  // Query for all section displayOrder
  const { data: sectionDisplayOrders } = useSectionsDisplayOrderQuery({
    variables: {
      templateId: Number(templateId)
    }
  })

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
          error = CreateSectionPage('messages.fieldLengthValidation')
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
    const errors: SectionFormInterface = {
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
    };

    // Iterate over formData to validate each field
    Object.keys(formData).forEach((key) => {
      const name = key as keyof SectionFormErrorsInterface;
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

  // Make GraphQL mutation request to create section
  const createSection = async (): Promise<SectionErrors> => {
    // string all tags from sectionName before sending to backend
    const cleanedSectionName = stripHtmlTags(sectionNameContent);

    try {
      const newDisplayOrder = getNewDisplayOrder();
      const response = await addSectionMutation({
        variables: {
          input: {
            templateId: Number(templateId),
            name: cleanedSectionName,
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
      });

      if (response.data?.addSection?.errors) {
        return response.data.addSection.errors;
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, error.message]);
      } else {
        setErrors(prevErrors => [...prevErrors, CreateSectionPage('messages.errorCreatingSection')]);
      }
    }
    return {};
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
    setHasUnsavedChanges(true);
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = CreateSectionPage('messages.success');
    toastState.add(successMessage, { type: 'success' });
  }

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Clear previous errors
    clearAllFieldErrors();
    setErrors([]);

    if (isFormValid()) {
      // Create new section
      const errors = await createSection();

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'SectionErrors').length > 0) {
        setFieldErrors({
          sectionName: errors.name || '',
          sectionIntroduction: errors.introduction || '',
          sectionRequirements: errors.requirements || '',
          sectionGuidance: errors.guidance || ''
        });

        setErrors([errors.general || CreateSectionPage('messages.errorCreatingSection')]);
      } else {
        setIsSubmitting(false);
        setHasUnsavedChanges(false);
        // Show success message
        showSuccessToast();
        // Redirect to the edit template page
        router.push(`/template/${templateId}`)
      }

      scrollToTop(topRef);
    }
  };

  useEffect(() => {
    if (tagsData?.tags) {
      // Remove __typename field from the tags selection
      const cleanedData = tagsData.tags.map(({
        __typename,
        ...fields
      }) => fields);
      setTags(cleanedData);
    }
  }, [tagsData])

  useEffect(() => {
    if (sectionDisplayOrders?.sections && sectionDisplayOrders.sections.length > 0) {
      const sections = sectionDisplayOrders?.sections;

      // Find the maximum displayOrder
      const maxDisplayOrder = sections.reduce(
        (max, section) => (section?.displayOrder ?? -Infinity) > max ? section?.displayOrder ?? max : max,
        0
      );

      setMaxDisplayOrderNum(maxDisplayOrder);
    }
  }, [sectionDisplayOrders])

  useEffect(() => {
    setFormData({
      ...formData,
      sectionName: sectionNameContent,
      sectionIntroduction: sectionIntroductionContent,
      sectionRequirements: sectionRequirementsContent,
      sectionGuidance: sectionGuidanceContent
    });
  }, [sectionNameContent, sectionIntroductionContent, sectionRequirementsContent, sectionGuidanceContent])

  // Warn user of unsaved changes if they try to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome/Firefox to show the confirm dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return (
    <>
      <PageHeader
        title={CreateSectionPage('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.createSection')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container" ref={topRef}>
            <div className="main-content">

              <ErrorMessages errors={errors} ref={errorRef} />

              <Tabs>
                <TabList aria-label="Question editing">
                  <Tab id="edit">{Section('tabs.editSection')}</Tab>
                  <Tab id="options">{Section('tabs.options')}</Tab>
                  <Tab id="logic">{Section('tabs.logic')}</Tab>
                </TabList>
                <TabPanel id="edit">
                  <Form onSubmit={handleFormSubmit}>

                    <FormInput
                      name="sectionName"
                      id="sectionName"
                      type="text"
                      aria-required={true}
                      label={Section('labels.sectionName')}
                      value={formData.sectionName}
                      onChange={e => {
                        setSectionNameContent(e.currentTarget.value);
                        setHasUnsavedChanges(true);
                      }}
                      isInvalid={fieldErrors['sectionName'] !== ''}
                      errorMessage={fieldErrors['sectionName']}
                    />

                    <Label htmlFor="sectionIntroduction" id="sectionIntroductionLabel">{Section('labels.sectionIntroduction')}</Label>
                    <TinyMCEEditor
                      content={sectionIntroductionContent}
                      setContent={(value) => {
                        setSectionIntroductionContent(value);
                        setHasUnsavedChanges(true);
                      }}
                      error={fieldErrors['sectionIntroduction']}
                      id="sectionIntroduction"
                      labelId="sectionIntroductionLabel"
                      helpText={Section('helpText.sectionIntroduction')}
                    />

                    <Label htmlFor="sectionRequirements" id="sectionRequirementsLabel">{Section('labels.sectionRequirements')}</Label>
                    <TinyMCEEditor
                      content={sectionRequirementsContent}
                      setContent={(value) => {
                        setSectionRequirementsContent(value);
                        setHasUnsavedChanges(true);
                      }}
                      error={fieldErrors['sectionRequirements']}
                      id="sectionRequirements"
                      labelId="sectionRequirementsLabel"
                      helpText={Section('helpText.sectionRequirements')}
                    />

                    <Label htmlFor="sectionGuidance" id="sectionGuidanceLabel">{Section('labels.sectionGuidance')}</Label>
                    <TinyMCEEditor
                      content={sectionGuidanceContent}
                      setContent={(value) => {
                        setSectionGuidanceContent(value);
                        setHasUnsavedChanges(true);
                      }}
                      error={fieldErrors['sectionGuidance']}
                      id="sectionGuidance"
                      labelId="sectionGuidanceLabel"
                      helpText={Section('helpText.sectionGuidance')}
                    />

                    <CheckboxGroup name="sectionTags">
                      <Label>{Section('labels.bestPracticeTags')}</Label>
                      <span className="help">{Section('helpText.bestPracticeTagsDesc')}</span>
                      <div className="checkbox-group-two-column">
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
                              <span className="checkbox-label"
                                data-testid='checkboxLabel'>
                                <div className="checkbox-wrapper">
                                  <div>{tag.name}</div>
                                  <DialogTrigger>
                                    <Button className="popover-btn"
                                      aria-label="Click for more info"><div
                                        className="icon"><DmpIcon
                                          icon="info" /></div></Button>
                                    <Popover>
                                      <OverlayArrow>
                                        <svg width={12} height={12}
                                          viewBox="0 0 12 12">
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
                    <Button
                      type="submit"
                      aria-disabled={isSubmitting}
                    >
                      {isSubmitting ? CreateSectionPage('button.creatingSection') : CreateSectionPage('button.createSection')}
                    </Button>
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
      </LayoutContainer>
    </>
  );
}

export default CreateSectionPage;
