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
  useTagsQuery,
  useUpdateSectionMutation,
} from '@/generated/graphql';

//Components
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import { DmpIcon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { DmpEditor } from "@/components/Editor";
import ErrorMessages from '@/components/ErrorMessages';
import FormInput from '@/components/Form/FormInput';
import {
  SectionFormErrorsInterface,
  SectionFormInterface,
  TagsInterface
} from '@/app/types';
import { useSectionData } from "@/hooks/sectionData";
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { scrollToTop } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';

const SectionUpdatePage: React.FC = () => {
  const toastState = useToast(); // Access the toast state from context

  // Get sectionId param
  const params = useParams();
  const router = useRouter();

  // Get templateId and sectionId params
  const templateId = Array.isArray(params.templateId) ? params.templateId[0] : params.templateId;
  const sectionId = Array.isArray(params.section_slug) ? params.section_slug[0] : params.section_slug;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  const {
    sectionData,
    selectedTags,
    checkboxTags,
    loading,
    setSectionData,
    setSelectedTags,
  } = useSectionData(Number(sectionId));


  // Save errors in state to display on page
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<SectionFormInterface>({
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

  // Set URLs
  const TEMPLATE_URL = routePath('template.show', { templateId });
  const UPDATE_SECTION_URL = routePath('template.section.slug', { templateId, section_slug: sectionId });


  // Initialize user addSection mutation
  const [updateSectionMutation] = useUpdateSectionMutation();

  // Query for all tags
  const { data: tagsData } = useTagsQuery();


  const updateSectionContent = (key: string, value: string) => {
    setSectionData((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

  // Client-side validation of fields
  const validateField = (name: string, value: string | string[] | undefined): string => {
    switch (name) {

      case 'sectionName':
        if (!value || value.length <= 2) {
          return SectionUpdatePage('messages.fieldLengthValidation');
        }
        break;
    }
    return '';
  };

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    const errors: SectionFormErrorsInterface = {
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: ''
    };

    let hasError = false;

    // Validate all fields and collect errors
    Object.keys(sectionData).forEach((key) => {
      const name = key as keyof SectionFormErrorsInterface;
      const value = sectionData[name];
      const error = validateField(name, value);

      if (error) {
        hasError = true;
        errors[name] = error;
      }
    });

    // Update state with all errors
    setFieldErrors(errors);
    if (errors) {
      setErrorMessages(Object.values(errors).filter((e) => e)); // Store only non-empty error messages
    }

    return !hasError;
  };

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
    });
  }

  // Make GraphQL mutation request to update section
  const updateSection = async (): Promise<[SectionErrors, boolean]> => {
    // string all tags from sectionName before sending to backend
    const cleanedSectionName = stripHtmlTags(sectionData.sectionName);

    try {
      const response = await updateSectionMutation({
        variables: {
          input: {
            sectionId: Number(sectionId),
            name: cleanedSectionName,
            introduction: sectionData.sectionIntroduction,
            requirements: sectionData.sectionRequirements,
            guidance: sectionData.sectionGuidance,
            displayOrder: sectionData.displayOrder,
            bestPractice: sectionData.bestPractice ?? false, // have to write it this way, otherwise the 'false' will remove this prop from input
            tags: selectedTags
          }
        }
      });

      const responseErrors = response.data?.updateSection?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'SectionErrors').length > 0) {
          return [responseErrors, false];
        }
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateSection', {
        error,
        url: { path: UPDATE_SECTION_URL }
      });
      if (error instanceof ApolloError) {
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, SectionUpdatePage('messages.errorUpdatingSection')]);
        return [{}, false];
      }
    }
  };

  // Handle changes to tag checkbox selection
  const handleCheckboxChange = (tag: TagsInterface) => {
    setSelectedTags(prevTags => prevTags.some(selectedTag => selectedTag.id === tag.id)
      ? prevTags.filter(selectedTag => selectedTag.id !== tag.id)
      : [...prevTags, tag]
    );
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = SectionUpdatePage('messages.success');
    toastState.add(successMessage, { type: 'success' });
  }

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);

    if (isFormValid()) {
      // Create new section
      const [errors, success] = await updateSection();

      if (!success) {
        if (errors) {
          setFieldErrors({
            sectionName: errors.name || '',
            sectionIntroduction: errors.introduction || '',
            sectionRequirements: errors.requirements || '',
            sectionGuidance: errors.guidance || ''
          });
        }
        setErrorMessages([errors.general || SectionUpdatePage('messages.errorUpdatingSection')]);

      } else {
        // Show success message and redirect back to Edit Templates page
        showSuccessToast();
        router.push(TEMPLATE_URL);
      }
    }
  };

  useEffect(() => {
    if (tagsData?.tags) {
      // Remove __typename field from the tags selection
      /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
      const cleanedData = tagsData.tags.map(({ __typename, ...fields }) => fields);
      setTags(cleanedData);
    }
  }, [tagsData])

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errorMessages.length > 0) {
      scrollToTop(errorRef);
    }
  }, [errorMessages]);


  // We need this so that the page waits to render until data is available
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={SectionUpdatePage('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.index', { templateId })}>{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.show', { templateId })}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.updateSection')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container" ref={topRef}>
            <div className="main-content">

              <ErrorMessages errors={errorMessages} ref={errorRef} />



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
                      isRequired={false}
                      aria-required={true}
                      label={Section('labels.sectionName')}
                      value={sectionData.sectionName ? sectionData.sectionName : ''}
                      onChange={(e) => setSectionData({
                        ...sectionData,
                        sectionName: e.currentTarget.value
                      })}
                      errorMessage={fieldErrors['sectionName']}
                    />

                    <Label htmlFor="sectionIntroduction" id="sectionIntroductionLabel">{Section('labels.sectionIntroduction')}</Label>
                    <DmpEditor
                      content={sectionData.sectionIntroduction}
                      setContent={(value) => updateSectionContent('sectionIntroduction', value)}
                      error={fieldErrors['sectionIntroduction']}
                      id="sectionIntroduction"
                      labelId="sectionIntroductionLabel"
                      helpText={Section('helpText.sectionIntroduction')}
                    />


                    <Label htmlFor="sectionRequirementsLabel" id="sectionRequirements">{Section('labels.sectionRequirements')}</Label>
                    <DmpEditor
                      content={sectionData.sectionRequirements}
                      setContent={(value) => updateSectionContent('sectionRequirements', value)}
                      error={fieldErrors['sectionRequirements']}
                      id="sectionRequirements"
                      labelId="sectionRequirementsLabel"
                      helpText={Section('helpText.sectionRequirements')}
                    />

                    <Label htmlFor="sectionGuidanceLabel" id="sectionGuidance">{Section('labels.sectionGuidance')}</Label>
                    <DmpEditor
                      content={sectionData.sectionGuidance}
                      setContent={(value) => updateSectionContent('sectionGuidance', value)}
                      error={fieldErrors['sectionGuidance']}
                      id="sectionGuidance"
                      labelId="sectionGuidanceLabel"
                      helpText={Section('helpText.sectionGuidance')}
                    />

                    <CheckboxGroup
                      name="sectionTags"
                      defaultValue={checkboxTags}
                    >
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
                    <Button type="submit">{Global('buttons.saveAndUpdate')}</Button>

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
