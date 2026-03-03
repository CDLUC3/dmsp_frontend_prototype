'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Form,
  Label,
  Link,
  Modal,
  ModalOverlay,
} from "react-aria-components";

// GraphQL
import {
  PublishedSectionDocument,
  RemoveSectionCustomizationDocument,
  SectionCustomizationBySectionDocument,
  UpdateSectionCustomizationDocument,
  AddSectionCustomizationDocument
} from '@/generated/graphql';

import { SectionFormInterface, TagsInterface } from '@/app/types';

//Components
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import PageHeader from "@/components/PageHeader";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import ErrorMessages from '@/components/ErrorMessages';
import Loading from '@/components/Loading';

interface CustomSectionErrors {
  customSectionGuidance?: string;
  general?: string | null;
  [key: string]: string | null | undefined;
}

// Utils and other
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { scrollToTop } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import styles from './sectionCustomize.module.scss';


const SectionCustomizePage: React.FC = () => {
  const toastState = useToast(); // Access the toast state from context

  // Get sectionId param
  const params = useParams();
  const router = useRouter();

  // Get templateId and sectionId params
  const templateCustomizationId = String(params.templateCustomizationId);
  const versionedSectionId = String(params.versionedSectionId);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // To be able to show a loading state when redirecting after successful update because otherwise there is a bit of a stutter where the page reloads before redirecting
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Custom section data state
  const [customSectionData, setCustomSectionData] = useState<{
    customSectionGuidance?: string;
  }>({
    customSectionGuidance: '',
  });

  // Published section data
  const [sectionData, setSectionData] = useState<SectionFormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
  });


  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);


  // Get published Section data
  const { data: publishedSection, loading: publishedSectionLoading } = useQuery(PublishedSectionDocument, {
    variables: {
      versionedSectionId: Number(versionedSectionId)
    }
  });

  const sectionId = publishedSection?.publishedSection?.id;


  // Get section customization data
  const { data: sectionCustomization, loading: sectionCustomizationLoading } = useQuery(SectionCustomizationBySectionDocument,
    {
      variables: { templateCustomizationId: Number(templateCustomizationId), versionedSectionId: Number(versionedSectionId) },
    }
  );


  // Save errors in state to display on page
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<CustomSectionErrors>({
    customSectionGuidance: '',
  });

  // localization keys
  const Global = useTranslations('Global');
  const SectionUpdatePage = useTranslations('SectionUpdatePage');
  const Section = useTranslations('Section');
  const SectionCustomize = useTranslations('SectionCustomize');

  // Set URLs
  const TEMPLATE_URL = routePath('template.customize', { templateCustomizationId });
  const UPDATE_SECTION_URL = routePath('template.customize.sectionId', { templateCustomizationId, versionedSectionId });

  // Initialize remove section mutation
  const [addSectionCustomization] = useMutation(AddSectionCustomizationDocument);
  const [removeSectionCustomization] = useMutation(RemoveSectionCustomizationDocument);
  const [updateSectionCustomization] = useMutation(UpdateSectionCustomizationDocument);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const RichTextDisplay: React.FC<{ label: string; content: string; }> = ({
    label,
    content,
  }) => (
    <div className="field-display">
      <h2>{label}</h2>
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
      case 'customSectionGuidance':
        if (!value || value.length <= 2) {
          return SectionUpdatePage('messages.fieldLengthValidation');
        }
        break;
    }
    return '';
  };

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    let hasError = false;
    const errorList: string[] = [];

    // Validate customSectionGuidance
    const guidanceValue = customSectionData.customSectionGuidance;
    const guidanceError = typeof guidanceValue === 'string'
      ? validateField('customSectionGuidance', guidanceValue)
      : '';

    // Build errors object
    const errors: CustomSectionErrors = {
      customSectionGuidance: guidanceError,
    };

    // Check if there are any errors
    if (guidanceError) {
      hasError = true;
      errorList.push(guidanceError);
    }

    // Update state with all errors
    setFieldErrors(errors);
    setErrorMessages(errorList);

    return !hasError;
  };

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      customSectionGuidance: '',
    });
  }

  // Make GraphQL mutation request to update section
  // TODO: UpdateCustomSectionDocument placeholder - not yet available
  const updateCustomSection = async (): Promise<[CustomSectionErrors, boolean]> => {
    // string all tags from sectionName before sending to backend
    const cleanedSectionName = stripHtmlTags(sectionData.sectionName);

    try {
      const response = await updateSectionCustomization({
        variables: {
          input: {
            sectionCustomizationId: Number(sectionId),
            guidance: customSectionData.customSectionGuidance,
          }
        }
      });

      const responseErrors = response.data?.updateSectionCustomization?.errors
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
  const handleDeleteSectionCustomization = async () => {
    setIsDeleting(true);
    try {
      await removeSectionCustomization({
        variables: {
          sectionCustomizationId: Number(sectionId)
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

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = SectionUpdatePage('messages.success');
    toastState.add(successMessage, { type: 'success' });
  }

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


  useEffect(() => {
    // Update state values from data results
    if (publishedSection?.publishedSection) {
      const section = publishedSection.publishedSection;
      const cleanedSectionName = stripHtmlTags(section.name);
      setSectionData({
        sectionName: cleanedSectionName,
        sectionIntroduction: section?.introduction ? section.introduction : '',
        sectionRequirements: section?.requirements ? section.requirements : '',
        sectionGuidance: section?.guidance ? section.guidance : '',
      })
    }
  }, [publishedSection])

  // If there is no existing customization for this section, create one so that there is always a customization 
  // to edit and we don't have to worry about handling the case where there isn't one
  useEffect(() => {
    const initializeCustomization = async () => {
      if (!sectionCustomizationLoading && !sectionCustomization?.sectionCustomizationBySection) {
        await addSectionCustomization({
          variables: {
            input: {
              templateCustomizationId: Number(templateCustomizationId),
              versionedSectionId: Number(versionedSectionId),
            },
          },
        });
      }
    };

    initializeCustomization();
  }, [sectionCustomizationLoading, sectionCustomization]);


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

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errorMessages.length > 0) {
      scrollToTop(errorRef);
    }
  }, [errorMessages]);

  // We need this so that the page waits to render until data is available
  if (publishedSectionLoading) {
    return <Loading />;
  }

  if (isRedirecting) {
    return <Loading />;
  }
  return (
    <>
      <PageHeader
        title={SectionCustomize('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.customizations', { templateCustomizationId })}>{Global('breadcrumbs.templateCustomizations')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.customize', { templateCustomizationId })}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{SectionCustomize('title')}</Breadcrumb>
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
                  <h2>{Section('labels.sectionName')}</h2>
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

                <RichTextDisplay
                  label={Section('labels.sectionGuidance')}
                  content={sectionData.sectionGuidance}
                />

                <div className={styles.additionalGuidance}>
                  <Label htmlFor="customSectionGuidance" id="customSectionGuidanceLabel">Additional section guidance</Label>
                  <TinyMCEEditor
                    content={customSectionData.customSectionGuidance || ''}
                    setContent={(value) => updateCustomSectionGuidanceContent('customSectionGuidance', value)}
                    error={fieldErrors['customSectionGuidance']}
                    id="customSectionGuidance"
                    labelId="customSectionGuidanceLabel"
                    helpText="Add additional guidance that will appear on the Section Overview page"
                  />
                </div>

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
                    className="danger"
                    isDisabled={isDeleting}
                  >
                    {isDeleting ? `${SectionCustomize('buttons.deletingCustomizations')}...` : SectionCustomize("buttons.deleteCustomization")}
                  </Button>
                  <ModalOverlay>
                    <Modal>
                      <Dialog>
                        {({ close }) => (
                          <>
                            <h3>{SectionCustomize("heading.deleteCustomization")}</h3>
                            <p>{SectionCustomize.rich("descriptions.deleteCustomization", {
                              strong: (chunks) => <strong>{chunks}</strong>
                            })}</p>
                            <div className={styles.deleteConfirmButtons}>
                              <Button
                                className="secondary"
                                autoFocus
                                onPress={close}>
                                {Global('buttons.cancel')}
                              </Button>
                              <Button
                                className="danger"
                                onPress={() => {
                                  handleDeleteSectionCustomization();
                                  close();
                                }}
                              >
                                {Global('buttons.delete')}
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

