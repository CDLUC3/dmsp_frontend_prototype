'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
  Modal,
  ModalOverlay,
} from "react-aria-components";

// GraphQL
import {
  SectionErrors,
  TagsDocument,
  UpdateCustomSectionDocument,
  RemoveSectionDocument,
} from '@/generated/graphql';

//Components
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import { DmpIcon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import ErrorMessages from '@/components/ErrorMessages';
import FormInput from '@/components/Form/FormInput';
import Loading from '@/components/Loading';

import {
  CustomSectionInterface,
  SectionFormErrorsInterface,
  SectionFormInterface,
  TagsInterface
} from '@/app/types';

// Hooks
import { useSectionData } from "@/hooks/sectionData";

// Utils and other
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { scrollToTop } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import styles from '../sectionUpdate.module.scss';

const SectionCustomizePage: React.FC = () => {
  const toastState = useToast(); // Access the toast state from context

  // Get sectionId param
  const params = useParams();
  const router = useRouter();

  // Get templateId and sectionId params
  const templateId = String(params.templateId);
  const sectionId = String(params.section_slug);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // To be able to show a loading state when redirecting after successful update because otherwise there is a bit of a stutter where the page reloads before redirecting
  const [isRedirecting, setIsRedirecting] = useState(false);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  const {
    customSectionData,
    sectionData,
    selectedTags,
    checkboxTags,
    loading,
    setCustomSectionData,
    setSectionData,
    setSelectedTags,
  } = useSectionData(Number(sectionId));


  // Save errors in state to display on page
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<CustomSectionInterface>({
    customSectionGuidance: '',
    customSectionRequirements: ''
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
  const [updateCustomSectionMutation] = useMutation(UpdateCustomSectionDocument);

  // Initialize remove section mutation
  const [removeSectionMutation] = useMutation(RemoveSectionDocument);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query for all tags
  const { data: tagsData } = useQuery(TagsDocument);


  const RichTextDisplay: React.FC<{ label: string; content: string; }> = ({
    label,
    content,
  }) => (
    <div className="field-display">
      <Label>{label}</Label>
      <div
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );

  const updateCustomSectionGuidanceContent = (key: string, value: string) => {
    setCustomSectionData((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  }

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
    const errors: CustomSectionInterface = {
      customSectionGuidance: '',
      customSectionRequirements: ''
    };

    let hasError = false;

    // Validate all fields and collect errors
    Object.keys(customSectionData).forEach((key) => {
      const name = key as keyof CustomSectionInterface;
      const value = customSectionData[name];
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
      customSectionGuidance: '',
      customSectionRequirements: ''
    });
  }

  // Make GraphQL mutation request to update section
  const updateCustomSection = async (): Promise<[SectionErrors, boolean]> => {
    // string all tags from sectionName before sending to backend
    const cleanedSectionName = stripHtmlTags(sectionData.sectionName);

    try {
      const response = await updateCustomSectionMutation({
        variables: {
          input: {
            requirements: customSectionData.customSectionRequirements,
            guidance: customSectionData.customSectionGuidance,
            displayOrder: sectionData.displayOrder,
            bestPractice: sectionData.bestPractice ?? false, // have to write it this way, otherwise the 'false' will remove this prop from input
            tags: selectedTags
          }
        }
      });

      const responseErrors = response.data?.updateCustomSection?.errors
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
      setErrorMessages(prevErrors => [...prevErrors, SectionUpdatePage('messages.errorUpdatingSection')]);
      return [{}, false];
    }
  };

  // Handle section deletion
  const handleDeleteSection = async () => {
    setIsDeleting(true);
    try {
      await removeSectionMutation({
        variables: {
          sectionId: Number(sectionId)
        }
      });
      // Show success message and redirect to template page
      toastState.add(SectionUpdatePage('messages.successDeletingSection'), { type: 'success' });
      router.push(TEMPLATE_URL);
    } catch (error) {
      logECS('error', 'deleteSection', {
        error,
        url: { path: UPDATE_SECTION_URL }
      });
      setErrorMessages([SectionUpdatePage('messages.errorDeletingSection')]);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle changes to tag checkbox selection
  const handleCheckboxChange = (tag: TagsInterface) => {
    setSelectedTags(prevTags => prevTags.some(selectedTag => selectedTag.id === tag.id)
      ? prevTags.filter(selectedTag => selectedTag.id !== tag.id)
      : [...prevTags, tag]
    );
    setHasUnsavedChanges(true);
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = SectionUpdatePage('messages.success');
    toastState.add(successMessage, { type: 'success' });
  }

  const handleSectionNameChange = (sectionData: SectionFormInterface) => {
    setSectionData(sectionData);
    setHasUnsavedChanges(true);
  };

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);

    if (isFormValid()) {
      // Create new section
      const [errors, success] = await updateCustomSection();

      if (!success) {
        if (errors) {
          setFieldErrors({
            customSectionGuidance: errors.customSectionGuidance || '',
            customSectionRequirements: errors.customSectionRequirements || ''
          });
        }
        setErrorMessages([errors.general || SectionUpdatePage('messages.errorUpdatingSection')]);

      } else {
        setHasUnsavedChanges(false);
        // Show success message and redirect back to Edit Templates page
        showSuccessToast();
        setIsRedirecting(true); // Set redirecting state to true to display loading state
        router.push(TEMPLATE_URL);
      }
    } else {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    if (tagsData?.tags) {
      // Remove __typename field from the tags selection
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

  if (isRedirecting) {
    return <Loading />;
  }
  return (
    <>
      <PageHeader
        title="Customize section"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.customizations', { templateId })}>Customization templates</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.customize', { templateId })}>Customize template</Link></Breadcrumb>
            <Breadcrumb>Customize section</Breadcrumb>
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

              <Form onSubmit={handleFormSubmit}>
                <div className="field-display">
                  <Label>{Section('labels.sectionName')}</Label>
                  <p>{sectionData.sectionName}</p>
                </div>

                <RichTextDisplay
                  label={Section('labels.sectionIntroduction')}
                  content={sectionData.sectionIntroduction}
                />

                <RichTextDisplay
                  label={Section('labels.sectionRequirements')}
                  content={sectionData.sectionRequirements}
                />

                <Label htmlFor="customSectionRequirements" id="customSectionRequirementsLabel">Additional section requirements</Label>
                <TinyMCEEditor
                  content={customSectionData.customSectionRequirements || ''}
                  setContent={(value) => updateCustomSectionGuidanceContent('customSectionRequirements', value)}
                  error={fieldErrors['customSectionRequirements']}
                  id="customSectionRequirements"
                  labelId="customSectionRequirementsLabel"
                  helpText="Add additional requirements that will appear on the Section Overview page"
                />

                <RichTextDisplay
                  label={Section('labels.sectionGuidance')}
                  content={sectionData.sectionGuidance}
                />

                <Label htmlFor="customSectionGuidance" id="customSectionGuidanceLabel">Additional section guidance</Label>
                <TinyMCEEditor
                  content={customSectionData.customSectionGuidance || ''}
                  setContent={(value) => updateCustomSectionGuidanceContent('customSectionGuidance', value)}
                  error={fieldErrors['customSectionGuidance']}
                  id="customSectionGuidance"
                  labelId="customSectionGuidanceLabel"
                  helpText="Add additional guidance that will appear on the Section Overview page"
                />

                {selectedTags.length > 0 && (
                  <div className="field-display">
                    <Label>{Section('labels.bestPracticeTags')}</Label>
                    <ul className="tags-list">
                      {selectedTags.map(tag => (
                        <li key={tag.id}>{tag.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="submit"
                  aria-disabled={isSubmitting}
                >
                  {Global('buttons.saveAndUpdate')}
                </Button>
              </Form>


              {/* Delete Section Button and Modal */}
              <div className={styles.deleteSectionContainer}>
                <h3 className={styles.dangerZoneTitle}>Delete customization</h3>
                <p className={styles.dangerZoneDescription}>
                  Your customizations to this section will be removed from the template. This is not reversible.
                </p>
                <DialogTrigger isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                  <Button
                    className={`react-aria-Button danger`}
                    isDisabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete customization'}
                  </Button>
                  <ModalOverlay>
                    <Modal>
                      <Dialog>
                        {({ close }) => (
                          <>
                            <h3>{SectionUpdatePage('deleteModal.title')}</h3>
                            <p>{SectionUpdatePage('deleteModal.content')}</p>
                            <div className={styles.deleteConfirmButtons}>
                              <Button className='react-aria-Button' autoFocus onPress={close}>
                                {SectionUpdatePage('deleteModal.cancelButton')}
                              </Button>
                              <Button
                                className={`danger`}
                                onPress={() => {
                                  handleDeleteSection();
                                  close();
                                }}
                              >
                                {SectionUpdatePage('deleteModal.deleteButton')}
                              </Button>
                            </div>
                          </>
                        )}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </div>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default SectionCustomizePage;
