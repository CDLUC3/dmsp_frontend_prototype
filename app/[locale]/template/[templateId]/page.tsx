'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  FieldError,
  Form,
  Heading,
  Label,
  Link,
  Modal,
  Radio,
  RadioGroup,
  Text,
  TextArea,
  TextField,
} from 'react-aria-components';

import {
  Section,
  TemplateVersionType,
  TemplateVisibility,
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery,
} from '@/generated/graphql';

// Components
import PageHeaderWithTitleChange from "@/components/PageHeaderWithTitleChange";
import AddSectionButton from "@/components/AddSectionButton";
import ErrorMessages from '@/components/ErrorMessages';
import SectionEditContainer from '@/components/SectionEditContainer';

import { useFormatDate } from '@/hooks/useFormatDate';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/routes';
import {
  updateTemplateAction,
  updateSectionDisplayOrderAction
} from './actions';
import styles from './templateEditPage.module.scss';
interface TemplateInfoInterface {
  templateId: number | null;
  name: string;
  visibility: TemplateVisibility;
}
const TemplateEditPage: React.FC = () => {
  const formatDate = useFormatDate();

  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const toastState = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [templateInfo, setTemplateInfoState] = useState<TemplateInfoInterface>({
    templateId: null,
    name: '',
    visibility: TemplateVisibility.Organization,
  });
  //Track local section order - using optimistic rendering
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Added for accessibility
  const [announcement, setAnnouncement] = useState('');

  // localization keys
  const BreadCrumbs = useTranslations('Breadcrumbs');
  const EditTemplate = useTranslations('EditTemplates');
  const PublishTemplate = useTranslations('PublishTemplate');
  const Messaging = useTranslations('Messaging');
  const Global = useTranslations('Global');

  // Used to set the translated visibility text, based on the
  // public/private choice.
  const [visibilityText, setVisibilityText] = useState<string>("");

  // Get templateId param
  const params = useParams();
  const router = useRouter();
  //const { templateId } = params; // From route /template/:templateId
  const templateId = String(params.templateId);

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Initialize publish mutation
  const [createTemplateVersionMutation] = useCreateTemplateVersionMutation();
  const [archiveTemplateMutation] = useArchiveTemplateMutation();

  // Run template query to get all templates under the given templateIdx
  const { data, loading, error: templateQueryErrors, refetch } = useTemplateQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",// Fetch latest data instead of cache so we get the latest sections and questions after adding new ones
    }
  );

  const sortSections = (sections: Section[]) => {
    // Create a new array with the spread operator before sorting
    return [...sections].sort((a, b) => (a.displayOrder!) - (b.displayOrder!));
  };

  const showSuccessToast = () => {
    const successMessage = Messaging('successfullyUpdated');
    toastState.add(successMessage, { type: 'success' });
  };


  const showSuccessArchiveToast = () => {
    const successMessage = EditTemplate('messages.successfullyArchived');
    toastState.add(successMessage, { type: 'success' });
  }

  const handleArchiveTemplate = async () => {
    try {
      const response = await archiveTemplateMutation({
        variables: {
          templateId: Number(templateId),
        },
      });

      const responseErrors = response.data?.archiveTemplate?.errors
      if (
        responseErrors &&
        typeof responseErrors.general === 'string') {
        if (responseErrors.general) {
          const message = responseErrors.general;
          setErrorMessages(prev => [
            ...prev,
            message
          ]);
        }

      } else {
        showSuccessArchiveToast();
        router.push(routePath('template.show', { templateId }));
      }
    } catch (err) {
      setErrorMessages(prevErrors => [...prevErrors, EditTemplate('errors.archiveTemplateError')]);
      logECS('error', 'handleArchiveTemplate', {
        error: err,
        url: { path: '/template/[templateId]' }
      });
    }
  };

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveTemplate = async (
    versionType: TemplateVersionType,
    comment: string | undefined,
    visibility: TemplateVisibility
  ) => {

    setErrorMessages([]); // Clear previous errors

    if (!visibility) {
      setErrorMessages([EditTemplate('errors.saveTemplateError')]);
      return;
    }

    try {
      const response = await createTemplateVersionMutation({
        variables: {
          templateId: Number(templateId),
          comment: comment?.length ? comment : null,
          versionType,
          visibility,
        },
      });

      const result = response?.data?.createTemplateVersion;

      if (!result) {
        setErrorMessages([EditTemplate('errors.saveTemplateError')]);
        return;
      }

      if (result.errors?.general) {
        setErrorMessages([result.errors.general]);
        return;
      }

      // Success: Close modal and show toast
      setPublishModalOpen(false);
      showSuccessToast();
      await refetch();
    } catch (err) {
      setErrorMessages([EditTemplate('errors.saveTemplateError')]);

      logECS('error', 'saveTemplate', {
        error: err,
        url: { path: '/template/[templateId]' },
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as TemplateVisibility;
    const changeLog = formData.get('change_log')?.toString();

    await saveTemplate(TemplateVersionType.Published, changeLog, visibility);
  };

  const handlePressPublishTemplate = () => {
    setPublishModalOpen(true);
  }

  // Call Server Action updateTemplateAction
  const updateTemplate = async (templateInfo: TemplateInfoInterface) => {

    if (templateInfo.templateId === null) {
      // Handle the case where templateId is null (e.g., log an error or return early)
      logECS('error', 'updateTemplate', {
        error: 'templateId is null',
        url: {
          path: routePath('template.show', { templateId: 'unknown' }),
        },
      });
      return {
        success: false,
        errors: [EditTemplate('errors.updateTemplateError')],
        data: null,
      };
    }

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateTemplateAction({
      templateId: templateInfo.templateId,
      name: templateInfo.name,
      visibility: templateInfo.visibility,
    });


    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  }

  const handleTitleChange = async (newTitle: string) => {
    const result = await updateTemplate({
      ...templateInfo,
      name: newTitle,
    });

    if (!result.success) {
      setErrorMessages([EditTemplate('errors.updateTitleError')])
    } else {
      if (
        result.data?.errors &&
        typeof result.data.errors.general === 'string') {
        // Handle errors as an object with general or field-level errors
        setErrorMessages(prev => [...prev, result.data?.errors?.general || EditTemplate('errors.updateTitleError')]);
      }
      //Need to refetch plan data to refresh the info that was changed
      await refetch();
    }
  }

  function handleVisibilityChange(value: string) {
    if (value == "public") {
      setVisibilityText(PublishTemplate('bullet.publishingTemplate3'));
    } else if (value == "private") {
      setVisibilityText(PublishTemplate('bullet.publishingTemplate3Private'));
    }
  }


  // Call Server Action updateSectionDisplayOrderAction
  const updateSectionDisplayOrder = async (sectionId: number, newDisplayOrder: number) => {

    if (!sectionId) {
      logECS('error', 'updateSectionDisplayOrder', {
        error: 'No sectionId',
        url: {
          path: routePath('template.show', { templateId: templateId }),
        },
      });
      return {
        success: false,
        errors: [EditTemplate('errors.updateDisplayOrderError')],
        data: null,
      };
    }

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateSectionDisplayOrderAction({
      sectionId: sectionId,
      newDisplayOrder: newDisplayOrder
    });


    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  }

  // Optimistic update function
  const updateLocalSectionOrder = (sectionId: number, newDisplayOrder: number) => {
    setLocalSections(prevSections => {
      const oldSections = [...prevSections];
      const movedSection = oldSections.find(s => s.id === sectionId);
      if (!movedSection || movedSection.displayOrder == null) return prevSections;

      const oldOrder = movedSection.displayOrder;

      const updatedSections = oldSections.map(section => {
        if (section.id === sectionId) {
          // The moved section gets the new displayOrder
          return { ...section, displayOrder: newDisplayOrder };
        }

        if (section.displayOrder == null) return section;

        // Shift other sections' displayOrders based on direction
        if (newDisplayOrder > oldOrder) {
          // Moving down: shift up sections in between
          if (section.displayOrder > oldOrder && section.displayOrder <= newDisplayOrder) {
            return { ...section, displayOrder: section.displayOrder - 1 };
          }
        } else if (newDisplayOrder < oldOrder) {
          // Moving up: shift down sections in between
          if (section.displayOrder >= newDisplayOrder && section.displayOrder < oldOrder) {
            return { ...section, displayOrder: section.displayOrder + 1 };
          }
        }

        return section;
      });

      return sortSections(updatedSections);
    });
  };

  const validateSectionMove = (sectionId: number, newDisplayOrder: number): { isValid: boolean, message?: string } => {
    const currentSection = localSections.find(s => s.id === sectionId);

    // If current section doesn't exist in localSections
    if (!currentSection || currentSection.displayOrder == null) {
      const errorMsg = EditTemplate('errors.updateDisplayOrderError');
      return { isValid: false, message: errorMsg }
    }

    // If new display order is zero
    const maxDisplayOrder = Math.max(...localSections.map(s => s.displayOrder || 0));
    if (newDisplayOrder < 1) {
      const errorMsg = EditTemplate('errors.displayOrderAlreadyAtTop');
      return { isValid: false, message: errorMsg }
    }

    // If new display order exceeds max number of sections
    if (newDisplayOrder > maxDisplayOrder) {
      const errorMsg = EditTemplate('errors.cannotMoveFurtherDown');
      return { isValid: false, message: errorMsg }
    }

    // If new display order is same as current display order
    if (currentSection.displayOrder === newDisplayOrder) {
      const errorMsg = EditTemplate('errors.cannotMoveFurtherUpOrDown');
      return { isValid: false, message: errorMsg }
    }

    return { isValid: true };
  };

  const handleSectionMove = async (sectionId: number, newDisplayOrder: number) => {
    if (isReordering) return; // Prevent concurrent operations

    // Remove all current errors
    setErrorMessages([]);

    const { isValid, message } = validateSectionMove(sectionId, newDisplayOrder);
    if (!isValid && message) {
      // Deliver toast error messages
      toastState.add(message, { type: 'error' });
      return;
    }

    // First, optimistically update the UI immediately for smoother reshuffling
    updateLocalSectionOrder(sectionId, newDisplayOrder);
    setIsReordering(true);

    try {
      const result = await updateSectionDisplayOrder(sectionId, newDisplayOrder);

      if (!result.success) {
        // Revert optimistic update on failure
        await refetch();
        const errors = result.errors;
        if (Array.isArray(errors)) {
          setErrorMessages(errors.length > 0 ? errors : [EditTemplate('errors.updateDisplayOrderError')]);
        }
      } else if (result.data?.errors?.general) {
        // Revert on server errors
        await refetch();
        setErrorMessages(prev => [...prev, result.data?.errors?.general || EditTemplate('errors.updateDisplayOrderError')]);
      }
      // After successful update

      // Scroll user to the reordered section
      const focusedElement = document.activeElement;

      // Check if an element is actually focused
      if (focusedElement) {
        // Scroll the focused element into view
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
      // Set accessible announcement
      const message = EditTemplate('messages.sectionMoved', { displayOrder: newDisplayOrder })
      setAnnouncement(message);
    } catch (error) {
      // Revert optimistic update on network error
      await refetch();
      setErrorMessages(prev => [...prev, EditTemplate('errors.updateDisplayOrderError')]);
    } finally {
      setIsReordering(false);
    }
  };

  // Need to set this info to update template title
  useEffect(() => {
    if (data?.template) {
      setTemplateInfoState({
        templateId: data.template.id ? Number(data.template.id) : null,
        name: data.template.name || '',
        visibility: data.template.visibility || null,
      });
    }

    if (data?.template?.sections) {
      const sorted = sortSections(
        data.template.sections.filter((section): section is Section => section !== null)
      );
      setLocalSections(sorted);
    }
  }, [data]);

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (templateQueryErrors) {
    return <div>{EditTemplate('errors.getTemplatesError')}</div>;
  }

  const template = data?.template;

  if (!template) {
    return <div>{EditTemplate('errors.noTemplateFound')}</div>;
  }

  // Format the latest publish date if it exists
  const formattedPublishDate = template.latestPublishDate ? formatDate(template.latestPublishDate) : null;



  // Use localSections instead of sortedSections in render
  const sectionsToRender = localSections.length > 0 ? localSections :
    (template.sections ? sortSections(template.sections.filter((section): section is Section => section !== null)) : []);

  const description = `by ${template?.name}` +
    (template?.latestPublishVersion ? ` - ${Global('version')}: ${template.latestPublishVersion}` : '') +
    (template?.latestPublishDate || formattedPublishDate ? ` - ${Global('lastUpdated')}: ${formattedPublishDate || template.latestPublishDate}` : '');


  return (
    <div>
      <PageHeaderWithTitleChange
        title={template.name}
        description={description}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{BreadCrumbs('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{BreadCrumbs('templates')}</Link></Breadcrumb>
            <Breadcrumb>{template.name}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
        onTitleChange={handleTitleChange}
      />

      <ErrorMessages errors={errorMessages} ref={errorRef} />

      <div className="template-editor-container">
        <div className="main-content">
          {sectionsToRender.length > 0 && (
            <div>
              {sectionsToRender
                .filter(section => section.id != null)
                .map(section => (
                  <SectionEditContainer
                    key={section.id}
                    sectionId={section.id as number}
                    displayOrder={section.displayOrder!}
                    templateId={templateId}
                    setErrorMessages={setErrorMessages}
                    onMoveUp={
                      section.displayOrder != null
                        ? () => handleSectionMove(section.id!, section.displayOrder! - 1)
                        : undefined
                    }
                    onMoveDown={
                      section.displayOrder != null
                        ? () => handleSectionMove(section.id!, section.displayOrder! + 1)
                        : undefined
                    }
                  />
                ))}
            </div>
          )}
          <AddSectionButton href={`/template/${templateId}/section/new`} />
        </div>
        <aside className="sidebar">
          <div className="sidebar-inner">
            <h2>{EditTemplate('titleStatus')}</h2>
            <div className="sidebar-section">

              <Button data-secondary className="my-3 secondary"
                onPress={() => saveTemplate(TemplateVersionType.Draft, '', TemplateVisibility.Organization)}>
                {EditTemplate('button.saveAsDraft')}
              </Button>

              <Button data-tertiary className="my-3"
                onPress={() => console.log('Preview')}>{EditTemplate('button.previewTemplate')}</Button>

            </div>

            {template.isDirty && (
              <div className="sidebar-section">
                <h3 className="h5 sidebar-section-title">{EditTemplate('button.publishTemplate')}</h3>
                <div className="status">
                  <p>
                    {EditTemplate('draft')} <Link href='#' onPress={() => setPublishModalOpen(true)}>{EditTemplate('links.edit')}</Link>
                  </p>
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <h3 className="h5 sidebar-section-title">{EditTemplate('heading.visibilitySettings')}</h3>
              <div className="status">
                <p>
                  {template.isDirty ? EditTemplate('notPublished') : EditTemplate('published')}{' '}<Link href='#' onPress={() => setPublishModalOpen(true)}>{EditTemplate('links.edit')}</Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <h3 className="h5 sidebar-section-title">{EditTemplate('heading.feedbackAndCollaboration')}</h3>
              <div className="description">
                <p>
                  {EditTemplate('allowAccess')}
                </p>
                <p>
                  <Link className="learn-more"
                    href={`/template/${templateId}/access`}>
                    {EditTemplate('links.manageAccess')}
                  </Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <Button
                className="my-3"
                onPress={() => handlePressPublishTemplate()}
              >
                {EditTemplate('button.publishTemplate')}
              </Button>
              <h3 className="h5 sidebar-section-title">{EditTemplate('heading.history')}</h3>
              <p>
                <Link className="learn-more"
                  href={`/template/${templateId}/history`}>
                  {EditTemplate('links.templateHistory')}
                </Link>
              </p>
            </div>


          </div>
        </aside>
      </div>
      <div className="template-archive-container">
        <div className="main-content">
          <h2>
            {EditTemplate('heading.archiveTemplate')}
          </h2>
          <p>
            {EditTemplate('description.archiveTemplate')}
          </p>
          <Form>
            <Button
              className="my-3"
              data-tertiary
              data-testid="archive-template"
              onPress={handleArchiveTemplate}>{EditTemplate('button.archiveTemplate')}
            </Button>
          </Form>
        </div>
      </div>


      <Modal
        isDismissable
        onOpenChange={setPublishModalOpen}
        isOpen={isPublishModalOpen}
        data-testid="modal"
      >
        <Dialog>
          <div>
            <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">
              <Heading slot="title">{PublishTemplate('heading.publish')}</Heading>

              <RadioGroup
                name="visibility"
                onChange={handleVisibilityChange}
              >
                <Label>{PublishTemplate('heading.visibilitySettings')}</Label>
                <Text slot="description" className="help">
                  {PublishTemplate('descPublishedTemplate')}
                </Text>
                <Radio
                  data-testid="visPublic"
                  value="public"
                  className={`${styles.radioBtn} react-aria-Radio`}
                >
                  <div>
                    <span>{PublishTemplate('radioBtn.public')}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate('radioBtn.publicHelpText')}</p>
                  </div>
                </Radio>
                <Radio
                  data-testid="visPrivate"
                  value="private"
                  className={`${styles.radioBtn} react-aria-Radio`}
                >
                  <div>
                    <span>{PublishTemplate('radioBtn.organizationOnly')}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate('radioBtn.orgOnlyHelpText')}</p>
                  </div>
                </Radio>
              </RadioGroup>

              <p>
                <strong>
                  {PublishTemplate('heading.publishingThisTemplate')}
                </strong>
              </p>

              <ul>
                <li>
                  {PublishTemplate('bullet.publishingTemplate')}
                </li>
                <li>
                  {PublishTemplate('bullet.publishingTemplate2')}
                </li>
                {visibilityText && (
                  <li data-testid="visText">
                    {visibilityText}
                  </li>
                )}
              </ul>
              <div className="">

                <TextField
                  name="change_log"
                  isRequired
                >
                  <Label>{PublishTemplate('heading.changeLog')}</Label>
                  <Text slot="description" className="help">
                    {PublishTemplate('descChangeLog')}
                  </Text>
                  <TextArea
                    data-testid="changeLog"
                    style={{ height: '100px' }}
                  />
                  <FieldError />
                </TextField>

              </div>


              <div className="modal-actions">
                <div className="">
                  <Button data-secondary onPress={() => setPublishModalOpen(false)}>{PublishTemplate('button.close')}</Button>
                </div>
                <div className="">
                  <Button type="submit">{PublishTemplate('button.saveAndPublish')}</Button>
                </div>
              </div>

            </Form>
          </div>
        </Dialog>
      </Modal>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div >
  );
};

export default TemplateEditPage;
