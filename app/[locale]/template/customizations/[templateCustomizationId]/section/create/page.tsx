'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    Breadcrumb,
    Breadcrumbs,
    Button,
    Form,
    Label,
    Link,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from "react-aria-components";
// GraphQL queries and mutations
import {
    CustomSectionErrors,
    CustomizableObjectOwnership,
    AddCustomSectionDocument,
    UpdateCustomSectionDocument,
    TemplateCustomizationOverviewDocument
} from '@/generated/graphql';

//Components
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import PageHeader from "@/components/PageHeader";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import ErrorMessages from '@/components/ErrorMessages';
import FormInput from '@/components/Form/FormInput';
import { stripHtmlTags } from '@/utils/general';
import { scrollToTop } from '@/utils/general';

import {
    SectionFormErrorsInterface,
    SectionFormInterface,
} from '@/app/types';
import { logECS, routePath } from "@/utils/index";
import { useToast } from '@/context/ToastContext';
import { extractErrors } from '@/utils/errorHandler';

const CreateCustomSectionPage: React.FC = () => {

    const toastState = useToast();

    // Get templateCustomizationId param
    const params = useParams();
    const router = useRouter();
    const { templateCustomizationId } = params; // From route /template/customizations/:templateCustomizationId/section/create

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
    })

    // Track the last section to pin the new section after
    const [lastSectionId, setLastSectionId] = useState<number | null>(null);

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

    // Initialize mutations
    const [addCustomSectionMutation] = useMutation(AddCustomSectionDocument);
    const [updateCustomSectionMutation] = useMutation(UpdateCustomSectionDocument);

    // Run template query to get all sections and questions under the given templateCustomizationId
    const {
        data,
        loading,
        error: templateQueryErrors,
        refetch
    } = useQuery(TemplateCustomizationOverviewDocument, {
        variables: { templateCustomizationId: Number(templateCustomizationId) },
    });

    // Show Success Message
    const showSuccessToast = () => {
        const successMessage = CreateSectionPage('messages.success');
        toastState.add(successMessage, { type: 'success' });
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
        });
    }

    // Make GraphQL mutation request to create custom section
    const createCustomSection = async (): Promise<CustomSectionErrors | null> => {
        // strip all tags from sectionName before sending to backend
        const cleanedSectionName = stripHtmlTags(sectionNameContent);

        try {
            // First, create the custom section
            const addResponse = await addCustomSectionMutation({
                variables: {
                    input: {
                        templateCustomizationId: Number(templateCustomizationId),
                        ...(lastSectionId !== null && {
                            pinnedSectionId: lastSectionId,
                            pinnedSectionType: CustomizableObjectOwnership.Custom
                        })
                    }
                },
                refetchQueries: [{
                    query: TemplateCustomizationOverviewDocument,
                    variables: {
                        templateCustomizationId: Number(templateCustomizationId)
                    }
                }]
            });

            if (addResponse.data?.addCustomSection?.errors) {
                const errorObj = addResponse.data.addCustomSection.errors;

                // Extract all error messages from the error object
                const errorMessages = extractErrors<CustomSectionErrors>(errorObj, ["general", "guidance", "introduction", "name", "requirements", "pinnedSectionId", "pinnedSectionType", "templateCustomizationId"]);

                if (errorMessages.length > 0) {
                    // Set all error messages for display
                    setErrors(prevErrors => [...prevErrors, ...errorMessages]);
                    return errorObj;
                }
            }

            // Get the newly created section ID
            const customSectionId = addResponse.data?.addCustomSection?.id;

            if (!customSectionId) {
                setErrors(prevErrors => [...prevErrors, CreateSectionPage('messages.errorCreatingSection')]);
                logECS("error", "Creating Custom Section in CreateCustomSectionPage", {});
                return null;
            }

            // Now update the custom section with the content
            const updateResponse = await updateCustomSectionMutation({
                variables: {
                    input: {
                        customSectionId: Number(customSectionId),
                        name: cleanedSectionName,
                        introduction: sectionIntroductionContent,
                        requirements: sectionRequirementsContent,
                        guidance: sectionGuidanceContent,
                    }
                },
                refetchQueries: [{
                    query: TemplateCustomizationOverviewDocument,
                    variables: {
                        templateCustomizationId: Number(templateCustomizationId)
                    }
                }]
            });

            if (updateResponse.data?.updateCustomSection?.errors) {
                const errorObj = updateResponse.data.updateCustomSection.errors;

                // Extract all error messages from the error object
                const errorMessages = extractErrors<CustomSectionErrors>(errorObj, ["general", "guidance", "introduction", "name", "requirements"]);

                if (errorMessages.length > 0) {
                    // Set all error messages for display
                    setErrors(prevErrors => [...prevErrors, ...errorMessages]);
                    return errorObj;
                }
            }

        } catch (error) {
            setErrors(prevErrors => [...prevErrors, CreateSectionPage('messages.errorCreatingSection')]);
            logECS("error", "Creating Custom Section in CreateCustomSectionPage", {
                errors: error,
            });
        }
        return null;
    };

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
            // Create new custom section
            const errors = await createCustomSection();

            // Check if there are any errors (always exclude the GraphQL `_typename` entry)
            if (errors && Object.values(errors).filter((err) => err && err !== '__typename').length > 0) {
                // Set field-specific errors for inline validation
                setFieldErrors({
                    sectionName: errors.name || '',
                    sectionIntroduction: errors.introduction || '',
                    sectionRequirements: errors.requirements || '',
                    sectionGuidance: errors.guidance || ''
                });

                // Error messages were already set in createCustomSection via extractErrors
                // No need to set them again here
                setIsSubmitting(false);
            } else {
                setIsSubmitting(false);
                setHasUnsavedChanges(false);
                // Show success message
                showSuccessToast();
                // Redirect to the template customization page
                router.push(`/template/customizations/${templateCustomizationId}`)
            }

            scrollToTop(topRef);
        } else {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        setFormData({
            ...formData,
            sectionName: sectionNameContent,
            sectionIntroduction: sectionIntroductionContent,
            sectionRequirements: sectionRequirementsContent,
            sectionGuidance: sectionGuidanceContent
        });
    }, [sectionNameContent, sectionIntroductionContent, sectionRequirementsContent, sectionGuidanceContent])

    // Find the last section to pin the new custom section after it
    useEffect(() => {
        if (data?.templateCustomizationOverview?.sections && data.templateCustomizationOverview.sections.length > 0) {
            const sections = data.templateCustomizationOverview.sections;

            // Find the section with the highest displayOrder
            const lastSection = sections.reduce((max, section) => {
                if (!section) return max;
                if (!max || section.displayOrder > max.displayOrder) {
                    return section;
                }
                return max;
            }, sections[0]);

            if (lastSection) {
                setLastSectionId(lastSection.id);
            }
        }
    }, [data]);

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
                        <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
                        <Breadcrumb><Link href={routePath('template.customizations')}>{Global('breadcrumbs.templateCustomizations')}</Link></Breadcrumb>
                        <Breadcrumb><Link href={`/template/customizations/${templateCustomizationId}`}>{Global('breadcrumbs.template')}</Link></Breadcrumb>
                        <Breadcrumb>{CreateSectionPage('title')}</Breadcrumb>
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
                                            isRequiredVisualOnly={true}
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

export default CreateCustomSectionPage;
